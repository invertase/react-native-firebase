# frozen_string_literal: true

# rubocop:disable Metrics, Style/GlobalVars
#
# Copyright (c) 2016-present Invertase Limited & Contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this library except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

require 'json'

RNFIREBASE_SPM_EMBED_PHASE_NAME = '[RNFB] Embed Firebase SPM Frameworks'
RNFIREBASE_SPM_SIGNATURE_FIX_PHASE_NAME = '[RNFB] Remove duplicate Firebase/Google SPM binary xcframework signature files' # rubocop:disable Layout/LineLength

# Every `.binaryTarget` xcframework name reachable in the resolved SPM package
# graph for the RNFB test app (firebase-ios-sdk 12.16.0, full module set --
# Analytics with ad support, Firestore, etc). Enumerated from
# `SourcePackages/workspace-state.json`'s `artifacts` list after a clean
# `-resolvePackageDependencies` run rather than guessed, since none of these
# show up as a reference in our own podspecs or pbxprojs (see comment on
# `rnfirebase_fix_spm_archive_signature_collision` below for why). Any of
# these can be staged into more than one target's build directory and hit the
# Archive signature-copy collision below, not just the Analytics-related
# ones we hit first.
RNFIREBASE_SPM_SIGNATURE_FIX_ARTIFACT_NAMES = %w[
  GoogleAppMeasurement
  GoogleAppMeasurementIdentitySupport
  GoogleAdsOnDeviceConversion
  FirebaseAnalytics
  FirebaseFirestoreInternal
  absl
  grpc
  grpcpp
  openssl_grpc
].freeze

# Encapsulates the SPM-related state that has to survive across CocoaPods'
# per-podspec evaluation (where `firebase_dependency` runs -- see `activate!`
# below) and the later, single `post_install` phase (where every
# `rnfirebase_*` helper in this file reads it back via `active?`/`version`/
# `url`). This works today because CocoaPods always finishes evaluating every
# podspec before running `post_install`, so a single, process-wide place to
# stash this is safe -- but wrapping the three pieces of state in a module
# (rather than three bare globals) keeps every read/write site in this file
# explicit about what it's touching, and gives `active?` a place to
# self-check for a state that should never happen instead of every
# downstream caller trusting a bare boolean blindly.
module RNFirebaseSPM
  class << self
    # Firebase SPM package URL, read from the app's own package.json (single
    # source of truth) the first time it's needed, then cached for the rest
    # of this `pod install` process.
    #
    # __dir__ resolves to the directory of this file (packages/app/).
    # Every other podspec loads this file via `require_relative` (e.g.
    # `require_relative '../app/firebase_spm'`), which resolves the path
    # relative to the requiring file's own location rather than the
    # process's current working directory -- so this always resolves
    # correctly regardless of monorepo hoisting layout (hoisted
    # dependencies, pnpm, etc.), with no adjustment needed.
    def url
      @url ||= begin
        app_package_path = File.join(__dir__, 'package.json')
        app_package = JSON.parse(File.read(app_package_path))
        app_package['sdkVersions']['ios']['firebaseSpmUrl']
      end
    end

    # Records that `firebase_dependency` (below) took the SPM path for at
    # least one podspec in this install, and which Firebase SDK `version` it
    # resolved with. Called once, from `firebase_dependency` itself, the
    # first time it successfully takes the SPM path. `version` is stored so
    # `rnfirebase_add_spm_core_to_app_target` can declare the same minimum
    # version requirement on the app target's own FirebaseCore product
    # dependency, without needing its own separate copy of it.
    def activate!(version)
      @active = true
      @version = version
    end

    # Whether SPM is active for this install -- read by every `rnfirebase_*`
    # post-install helper in this file to decide whether to act at all.
    #
    # Self-checks internal consistency before returning: if `@active` is
    # `true` but no real `version` was ever recorded, something set the flag
    # without going through `activate!` above (e.g. a future refactor that
    # assigns the flag directly instead of calling it), and every downstream
    # helper that trusts this return value -- including one that links
    # FirebaseCore into the app target at a specific minimum version -- would
    # silently operate on incomplete state instead. Raising `Pod::Informative`
    # here (this file's own user-facing `pod install`-time error class, same
    # as `rnfirebase_fail_if_spm_static_linkage!` below) turns that into a
    # loud, immediate failure instead of a confusing downstream symptom.
    def active?
      return false unless @active

      if @version.nil? || @version.to_s.strip.empty?
        raise Pod::Informative, <<~MESSAGE
          [react-native-firebase] Internal error: Firebase SPM was marked active without a recorded version -- `RNFirebaseSPM.activate!` was either never called, or was called with a nil/empty version. This indicates a bug in react-native-firebase's own Podfile integration, not a problem with your project.

          Please open an issue at https://github.com/invertase/react-native-firebase/issues, including your full `pod install` output.
        MESSAGE
      end

      true
    end

    # The Firebase SDK version `firebase_dependency` resolved with, recorded
    # by `activate!` above -- used by `rnfirebase_add_spm_core_to_app_target`
    # to declare the same minimum version requirement on the app target's own
    # FirebaseCore product dependency.
    attr_reader :version

    # Clears active/version/url back to their unset defaults. Not needed in
    # production Podfile code paths -- each `pod install` process is
    # short-lived, so there's nothing to reset between installs -- but the
    # test suite `load`s this file fresh for every test and needs a
    # deliberate way to reset this module's state in between, rather than
    # relying on Ruby's one-way `defined?` (a global variable, once assigned,
    # can't become "undefined" again) the way `$RNFirebaseDisableSPM` still
    # does in the test suite's `setup`.
    def reset!
      @active = nil
      @version = nil
      @url = nil
    end
  end
end

# Helper to declare Firebase dependencies with SPM support and CocoaPods fallback.
#
# When `spm_dependency` is available (React Native >= 0.75), it declares the
# Firebase iOS SDK as a Swift Package dependency. Otherwise, it falls back to
# the traditional CocoaPods `s.dependency` declaration.
#
# Set `$RNFirebaseDisableSPM = true` in your Podfile to force CocoaPods-only
# dependency resolution. You must disable SPM when using `use_frameworks! :linkage => :static`
# because static frameworks cause each pod to embed Firebase SPM products,
# resulting in duplicate symbol linker errors.
#
# firebase-ios-sdk SPM products are plain `.library(...)` (automatic linkage),
# not `.library(type: .dynamic)`. See:
# https://github.com/firebase/firebase-ios-sdk/blob/main/Package.swift
# Automatic products are linked statically into each consumer. RNFB SPM mode
# therefore requires `use_frameworks! :linkage => :dynamic` so the app can
# build and run; static pod linkage collides those per-pod copies at link time.
# Dynamic pods avoid the link failure but still embed a private copy per pod,
# so third-party pods cannot share one FirebaseCore/FirebaseApp with RNFB
# under SPM (use `$RNFirebaseDisableSPM = true` + CocoaPods for that).
#
# Returns true only when `$RNFirebaseDisableSPM` has been explicitly set to `true`.
#
# We deliberately check the value (not just `defined?`), so that config generators,
# Expo plugins, or env-templated Podfiles that emit `$RNFirebaseDisableSPM = false`
# don't silently switch to CocoaPods.
def rnfirebase_spm_disabled?
  defined?($RNFirebaseDisableSPM) && $RNFirebaseDisableSPM == true
end

# Normalizes a build setting value that Xcode/Xcodeproj may represent as
# `nil`, a whitespace-separated `String`, or an `Array` into a plain `Array`
# safe to call `include?`/`push`/`<<` on. Settings like `OTHER_LDFLAGS` or
# `SWIFT_INCLUDE_PATHS` can legitimately arrive as any of the three depending
# on how a consumer's project/build settings were authored -- treating them
# as always-already-an-Array (e.g. a bare `||= []` default, which only
# covers the `nil` case) raises `NoMethodError` the moment a consumer's
# target already has one of these set as a `String`.
def rnfirebase_build_setting_list(current)
  if current.nil? || (current.is_a?(String) && current.strip.empty?) || (current.is_a?(Array) && current.empty?)
    ['$(inherited)']
  elsif current.is_a?(String)
    current.split
  else
    current.dup
  end
end

def rnfirebase_spm_embed_script
  <<~'SCRIPT'
    set -euo pipefail

    app_frameworks_dir="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"
    mkdir -p "${app_frameworks_dir}"

    embed_frameworks_from() {
      local source_dir="$1"
      [ -d "${source_dir}" ] || return 0

      find "${source_dir}" -maxdepth 1 -type d -name "*.framework" -print0 | while IFS= read -r -d '' framework; do
        framework_name="$(basename "${framework}")"
        destination="${app_frameworks_dir}/${framework_name}"

        if [ -e "${destination}" ]; then
          continue
        fi

        # Xcode's Archive action writes EVERY SKIP_INSTALL=YES product into
        # ${OBJROOT}/UninstalledProducts/${PLATFORM_NAME} -- not just Swift
        # Package products. With CocoaPods + `use_frameworks!` (required for
        # SPM mode), that folder also contains every pod's .framework,
        # including STATIC ones (Expo modules, the Pods_<target> umbrella,
        # ...). Embedding a static framework into the app bundle makes App
        # Store validation fail with "Invalid bundle structure ... binary
        # file is not permitted". Only ever embed real dynamic libraries.
        #
        # Internal binary name matches the .framework folder name minus the
        # extension for every CocoaPods/SPM-built framework (all this script
        # handles).
        binary_name="${framework_name%.framework}"
        # Deliberate tradeoff: match `file -b` prose for "dynamically linked"
        # rather than inspecting Mach-O magic bytes. Locale-independent in
        # practice on Apple's `file`, but still a CLI string match.
        if [ ! -f "${framework}/${binary_name}" ] || \
           ! file -b "${framework}/${binary_name}" | grep -q 'dynamically linked'; then
          echo "Skipping ${framework_name}: binary missing or not dynamically linked"
          continue
        fi

        echo "Embedding Firebase SPM framework ${framework_name} (from ${source_dir})"
        rsync -av --delete \
          --filter "- Headers" \
          --filter "- PrivateHeaders" \
          --filter "- Modules" \
          "${framework}" \
          "${app_frameworks_dir}"

        if [ -n "${EXPANDED_CODE_SIGN_IDENTITY:-}" ] && [ "${CODE_SIGNING_REQUIRED:-}" != "NO" ] && [ "${CODE_SIGNING_ALLOWED:-}" != "NO" ]; then
          /usr/bin/codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" ${OTHER_CODE_SIGN_FLAGS:-} --preserve-metadata=identifier,entitlements "${destination}"
        fi
      done
    }

    # Regular (simulator/device) builds put every Swift Package product for
    # the whole scheme's dependency graph into one shared folder.
    embed_frameworks_from "${BUILT_PRODUCTS_DIR}/PackageFrameworks"

    # Xcode's Archive action (ONLY_ACTIVE_ARCH=NO, DEPLOYMENT_POSTPROCESSING=YES)
    # never populates PackageFrameworks. It stages build products under
    # ${OBJROOT}/UninstalledProducts/${PLATFORM_NAME} instead -- and that
    # folder is NOT SPM-only: Archive writes every SKIP_INSTALL=YES product
    # there, which under CocoaPods + use_frameworks! (required for SPM mode)
    # includes every pod .framework (dynamic Firebase SPM products and static
    # pods alike). Without this fallback, Archive embeds zero Firebase SPM
    # frameworks and the app crashes at launch (missing-library dyld). The
    # filter inside embed_frameworks_from keeps only dynamically linked
    # binaries so static CocoaPods frameworks are not copied into the app
    # bundle (App Store "Invalid bundle structure").
    embed_frameworks_from "${OBJROOT}/UninstalledProducts/${PLATFORM_NAME}"
  SCRIPT
end

# Creates (or updates in place) a shell-script build phase named `name` on
# `target`, only reporting a change when something about it actually
# differs from what's already there.
#
# Without this, callers that unconditionally assign every property and then
# unconditionally set their own "did I touch anything" flag end up rewriting
# -- and re-saving -- the consumer's `.pbxproj` on every single `pod install`,
# even when the phase's script/paths are byte-for-byte identical to the last
# install. That's needless diff churn on a file consumers commit to source
# control.
#
# Returns `true` if the phase was newly created or any of its properties
# changed; `false` if it already matched and nothing was touched.
def rnfirebase_upsert_shell_script_phase!(target, name, shell_script:, shell_path:, input_paths: nil, output_paths: nil)
  existing = target.shell_script_build_phases.find { |candidate| candidate.name == name }
  phase = existing || target.new_shell_script_build_phase(name)

  changed = existing.nil?
  changed ||= phase.shell_script != shell_script
  changed ||= phase.shell_path != shell_path
  changed ||= phase.always_out_of_date != '1'
  changed ||= !input_paths.nil? && phase.input_paths != input_paths
  changed ||= !output_paths.nil? && phase.output_paths != output_paths

  phase.shell_script = shell_script
  phase.shell_path = shell_path
  phase.always_out_of_date = '1'
  phase.input_paths = input_paths if input_paths
  phase.output_paths = output_paths if output_paths

  changed
end

# Adds a build phase that copies Firebase's SPM-built dynamic frameworks
# into the app bundle. Runs automatically on every `pod install`/`pod update`
# -- see `rnfirebase_hook_cocoapods_post_install!` below -- so you normally
# never need to call this yourself.
#
# Only needed when Firebase is resolved via SPM (the RN >= 0.75 default) with
# dynamic linkage. It's a no-op (returns immediately) when Firebase used
# CocoaPods instead, so it's always safe to leave in your Podfile if you're
# calling it manually as a fallback (see below).
#
# Why this needs to exist at all: React Native's SPM integration
# (`spm_dependency` -> `SPM.apply_on_post_install`, in RN's own bundled
# `react_native_pods.rb`) adds Swift package product dependencies to pod
# targets, but never teaches the app target's CocoaPods embed script about
# the dynamic frameworks Xcode's SPM build produces -- so without this, apps
# crash at launch with a missing-library dyld error.
#
# If the automatic hook below ever fails to install (e.g. a future CocoaPods
# release restructures `Pod::Installer`), it prints a `pod install`-time
# warning telling you to call this explicitly instead:
#
#   post_integrate do |installer|
#     rnfirebase_add_spm_embed_phase(installer)
#   end
#
# Use `post_install` only if your CocoaPods version has no `post_integrate`.
def rnfirebase_add_spm_embed_phase(installer)
  return unless RNFirebaseSPM.active?

  installer.aggregate_targets.each do |aggregate_target|
    project_modified = false

    aggregate_target.user_project.native_targets.each do |target|
      next unless target.respond_to?(:shell_script_build_phases)
      next unless target.shell_script_build_phases.any? { |phase| phase.name == '[CP] Embed Pods Frameworks' }

      changed = rnfirebase_upsert_shell_script_phase!(
        target,
        RNFIREBASE_SPM_EMBED_PHASE_NAME,
        shell_script: rnfirebase_spm_embed_script,
        shell_path: '/bin/bash',
        input_paths: ['${BUILT_PRODUCTS_DIR}/PackageFrameworks'],
        output_paths: ['${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}']
      )
      project_modified ||= changed
    end

    # Only rewrite the pbxproj when we actually created or changed a phase --
    # avoids an unconditional save (and consumer-visible pbxproj diff) on
    # every single `pod install`, even when nothing about the phase differs
    # from the last install.
    aggregate_target.user_project.save if project_modified
  end
end

# Safety net for `rnfirebase_add_spm_embed_phase`: confirms its embed build
# phase actually landed on every target that needs it, immediately after it
# runs. "Needs it" uses the exact same target-selection criterion
# `rnfirebase_add_spm_embed_phase` itself uses (SPM active, target has a
# `'[CP] Embed Pods Frameworks'` phase) -- so this is only ever checking
# targets that function was actually supposed to have touched.
#
# Without this, a future Xcodeproj/Xcode-project shape that
# `rnfirebase_add_spm_embed_phase` doesn't anticipate could leave it
# silently doing nothing for a target, with no `pod install`-time signal --
# the first sign of trouble would be that app crashing at launch with a
# missing-library dyld error, with nothing pointing back at this file.
#
# Raises `Pod::Informative` -- CocoaPods' own user-facing error class,
# same as `rnfirebase_fail_if_spm_static_linkage!` -- rather than warning
# and continuing like the softer checks in this file: there's no safe
# fallback for "the app you're about to build will crash at launch," so
# `pod install` itself must fail loudly here instead.
def rnfirebase_verify_spm_embed_phase_applied!(installer)
  return unless RNFirebaseSPM.active?

  missing_target_names = []

  installer.aggregate_targets.each do |aggregate_target|
    aggregate_target.user_project.native_targets.each do |target|
      next unless target.respond_to?(:shell_script_build_phases)
      next unless target.shell_script_build_phases.any? { |phase| phase.name == '[CP] Embed Pods Frameworks' }
      next if target.shell_script_build_phases.any? { |phase| phase.name == RNFIREBASE_SPM_EMBED_PHASE_NAME }

      missing_target_names << target.name
    end
  end

  return if missing_target_names.empty?

  raise Pod::Informative, <<~MESSAGE
    [react-native-firebase] Failed to add the Firebase SPM embed build phase to target(s): #{missing_target_names.join(', ')}.

    Without it, this app will crash at launch with a missing-library dyld error, because Firebase's Swift Package frameworks never get copied into the app bundle.

    Add `rnfirebase_add_spm_embed_phase(installer)` to your Podfile's post_integrate block as a fallback, then run `pod install` again. # rubocop:disable Layout/LineLength
  MESSAGE
end

# Fails `pod install` fast, with a clear explanation, when RNFB's SPM mode is
# combined with static linkage (`use_frameworks! :linkage => :static`) --
# instead of letting consumers hit a confusing "duplicate symbols for
# architecture ..." linker error later, at Xcode build time, with no obvious
# link back to the Podfile setting that caused it.
#
# firebase-ios-sdk's SPM products are automatic libraries (plain `.library(...)`,
# not `type: .dynamic`) -- see
# https://github.com/firebase/firebase-ios-sdk/blob/main/Package.swift -- so
# each pod that resolves Firebase via SPM statically embeds its own copy.
# Under static pod linkage those copies collide when the app links
# (`duplicate symbol`). Under dynamic pod linkage the app builds, but each
# dynamic framework still keeps a private copy (runtime class duplication /
# split FirebaseApp registries). There is no supported combination of RNFB's
# SPM mode with static linkage; the fix is always to switch to dynamic
# linkage or opt out of SPM entirely.
#
# Raises `Pod::Informative` -- CocoaPods' own user-facing error class, which
# `pod install` prints as a plain, readable message with no Ruby backtrace --
# rather than warning-and-continuing like the other checks in this file.
def rnfirebase_fail_if_spm_static_linkage!(installer)
  return unless RNFirebaseSPM.active?

  # `AggregateTarget#build_as_static?` (and `#build_type` it delegates to) is
  # NOT what it sounds like: CocoaPods always constructs the aggregate
  # "Pods-<target>" umbrella target itself as `static_framework`/
  # `static_library` -- see `Installer::Analyzer#generate_aggregate_target`,
  # which hardcodes `target_definition.uses_frameworks? ? BuildType.static_framework
  # : BuildType.static_library` regardless of `use_frameworks!`'s `:linkage`.
  # Checking it here made this fail unconditionally for every SPM install,
  # dynamic linkage included, because it's true either way.
  #
  # The actual `:linkage => :dynamic` vs `:static` choice from the Podfile is
  # recorded on each aggregate target's own `target_definition.build_type`
  # instead (`TargetDefinition#build_type`, which individual `PodTarget`s
  # also inherit from via `Analyzer#determine_build_type`) -- check that.
  static_targets = installer.aggregate_targets.select do |target|
    target.target_definition.build_type.static?
  end
  return if static_targets.empty?

  target_names = static_targets.map(&:name).join(', ')

  raise Pod::Informative, <<~MESSAGE
    [react-native-firebase] SPM + static linkage is not supported (target(s): #{target_names}).

    firebase-ios-sdk's Swift Package products are automatic libraries (not `type: .dynamic`), so each react-native-firebase pod that resolves Firebase via SPM embeds its own copy. With `use_frameworks! :linkage => :static` those copies collide at link time as duplicate-symbol errors.

    Fix one of the following in your Podfile, then run `pod install` again:
      - Use dynamic linkage: `use_frameworks! :linkage => :dynamic`
      - Opt out of SPM: set `$RNFirebaseDisableSPM = true` before any target block, then use the static or dynamic linkage your project requires.
  MESSAGE
end

# Expo's precompiled-module pre-install hook runs after Podfile pre-install
# hooks and changes React-Core-dependent pod targets to static libraries.
# That is required for Expo's own source-built pods, but RNFB's Firebase SPM
# products are automatic libraries: making more than one RNFB pod static
# absorbs the same Firebase objects into each archive and the app link fails
# with duplicate symbols.
#
# Restore only Expo's generated prebuilt-RNCore + dynamic-framework path, and
# only RNFB targets that Expo actually changed to `static_library`. Bare
# consumers never define `Expo::PrecompiledModules`; source-built Expo installs
# make `enabled?` false; static/no-framework Podfiles do not report `:dynamic`.
# Existing dynamic RNFB targets and explicit static frameworks are untouched.
def rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(installer)
  return unless RNFirebaseSPM.active?
  return unless defined?(Expo::PrecompiledModules)
  return unless Expo::PrecompiledModules.respond_to?(:enabled?) &&
                Expo::PrecompiledModules.respond_to?(:linkage)
  return unless Expo::PrecompiledModules.enabled?
  return unless Expo::PrecompiledModules.linkage(installer) == :dynamic

  static_library = Pod::BuildType.static_library
  dynamic_framework = Pod::BuildType.dynamic_framework
  restored_targets = installer.pod_targets.select do |target|
    target.name.start_with?('RNFB') && target.build_type == static_library
  end

  restored_targets.each do |target|
    target.define_singleton_method(:build_type) { dynamic_framework }
  end
  return if restored_targets.empty? || !defined?(Pod::UI)

  names = restored_targets.map(&:name).join(', ')
  Pod::UI.puts "[react-native-firebase] Restored dynamic framework linkage after Expo prebuilt downgrade: #{names}"
end

# CocoaPods `TargetUUIDGenerator` replaces `@generated_uuids` with leftover
# `@available_uuids` before Podfile `post_install`. RN's SPM integration then
# calls `project.new` for Firebase package product deps; with an empty/short
# counter that restarts near index 0 and **overwrites** `rootObject`
# (`PBXProject` at `PREFIX0000000`). Xcode 26 then refuses to open Pods
# (`-[XCSwiftPackageProductDependency _setSavedArchiveVersion:]`) and the
# workspace builds only SPM app targets — bridging headers can't see RNFB
# frameworks (reproduced on RN 0.85.3 × prebuilt RNCore). Raise the sequential
# UUID high-water mark to past every existing CocoaPods-format object before
# any `post_install` body (including `react_native_post_install` → SPM) runs.
def rnfirebase_ensure_pods_uuid_counter_safe!(installer)
  project = installer.pods_project
  return unless project

  prefix = project.instance_variable_get(:@uuid_prefix)
  return unless prefix.is_a?(String) && prefix.length >= 6

  pfx = prefix[0, 6]
  max_idx = -1
  project.objects_by_uuid.each_key do |uuid|
    next unless uuid.is_a?(String) && uuid.length == 14 && uuid.start_with?(pfx) && uuid.end_with?('0')

    idx = uuid[6, 7].to_i(16)
    max_idx = idx if idx > max_idx
  end
  return if max_idx.negative?

  generated = project.instance_variable_get(:@generated_uuids)
  generated = [] unless generated.is_a?(Array)
  already_high = generated.size > max_idx
  # CocoaPods UUID layout (prefix + 7 hex digits + trailing 0) — positional tokens are intentional.
  generated << format('%.6s%07X0', prefix, generated.size) while generated.size <= max_idx # rubocop:disable Style/FormatStringToken
  project.instance_variable_set(:@generated_uuids, generated)
  project.instance_variable_set(:@available_uuids, [])

  # Only log when SPM is active and we actually padded -- non-SPM installs
  # still get the counter raise (cheap insurance) but must not spam every
  # `pod install` with a success line.
  return unless !already_high && defined?(Pod::UI) && RNFirebaseSPM.active?

  Pod::UI.puts '[react-native-firebase] Raised CocoaPods Pods UUID counter ' \
               "past index #{max_idx} before RN SPM mutates Pods.xcodeproj."
end

# Hard integrity check for the UUID-collision failure class above -- mirrors
# `rnfirebase_verify_spm_embed_phase_applied!` (soft attempt, then fail closed).
# After RN's SPM `post_install` mutates Pods.xcodeproj, the Pods project's
# `rootObject` UUID must still resolve to the same `PBXProject` instance. If a
# later `project.new` reused `PREFIX0000000`, `objects_by_uuid` holds a
# different object at that UUID while `@root_object` still points at the
# original `PBXProject`; saving then writing that UUID as `rootObject` leaves
# Xcode unable to open Pods.
#
# Raises `Pod::Informative` rather than warning-and-continuing: there is no
# safe fallback once the project graph is corrupted.
def rnfirebase_verify_pods_project_uuid_integrity!(installer)
  return unless RNFirebaseSPM.active?
  return unless installer.respond_to?(:pods_project)

  project = installer.pods_project
  return unless project
  return unless project.respond_to?(:root_object) && project.respond_to?(:objects_by_uuid)

  root = project.root_object
  resolved = root && project.objects_by_uuid[root.uuid]
  return if root &&
            resolved.equal?(root) &&
            resolved.respond_to?(:isa) &&
            resolved.isa == 'PBXProject'

  raise Pod::Informative, <<~MESSAGE
    [react-native-firebase] Pods.xcodeproj rootObject / PBXProject UUID integrity check failed after post_install.

    CocoaPods' sequential UUID counter was likely reset before React Native's SPM integration called `project.new`, overwriting the Pods `PBXProject` (`rootObject`). Xcode then refuses to open Pods (e.g. `-[XCSwiftPackageProductDependency _setSavedArchiveVersion:]`), and bridging headers cannot see React Native Firebase frameworks.

    Delete `ios/Pods` and `ios/Podfile.lock`, upgrade `@react-native-firebase/app`, then run `pod install` again. If this persists, report it with your React Native and CocoaPods versions.
  MESSAGE
end

# Hooks CocoaPods itself (not React Native) so `rnfirebase_add_spm_embed_phase`
# runs automatically on every `pod install`/`pod update`, without requiring
# any Podfile change from consumers.
#
# User-project SPM mutations (embed phase, FirebaseCore on the app target,
# signature workaround, build settings). Must run *after* CocoaPods has
# integrated `[CP] Embed Pods Frameworks` into the app target -- see
# `rnfirebase_hook_cocoapods_post_install!`. Extracted so both the
# `post_integrate` hook (current CocoaPods) and the `post_install` fallback
# (older CocoaPods without `run_podfile_post_integrate_hooks`) share one body.
def rnfirebase_run_spm_user_project_hooks(installer)
  begin
    rnfirebase_add_spm_embed_phase(installer)
  rescue StandardError => e
    if defined?(Pod::UI)
      Pod::UI.warn "[react-native-firebase] Couldn't embed Firebase SPM frameworks " \
                   "automatically (#{e.class}: #{e.message}). Add `rnfirebase_add_spm_embed_phase(installer)` " \
                   'to your Podfile\'s post_integrate block as a fallback.'
    end
  end
  # Deliberately outside the `rescue` above: dynamic framework embedding is
  # load-bearing (without it, the app crashes at launch with a missing-library
  # dyld error), so if the phase still isn't on a target that needs it --
  # whether the call raised, silently no-opped, or only partially applied --
  # this must abort `pod install` rather than let a broken install continue.
  rnfirebase_verify_spm_embed_phase_applied!(installer)
  begin
    rnfirebase_add_spm_core_to_app_target(installer)
  rescue StandardError => e
    if defined?(Pod::UI)
      Pod::UI.warn "[react-native-firebase] Couldn't link FirebaseCore into the app target " \
                   "automatically (#{e.class}: #{e.message}). " \
                   'Add `rnfirebase_add_spm_core_to_app_target(installer)` ' \
                   'to your Podfile\'s post_integrate block as a fallback if your own native code calls ' \
                   'FIRApp/FIROptions APIs directly.'
    end
  end
  begin
    rnfirebase_remove_spm_core_from_app_target(installer)
  rescue StandardError => e
    if defined?(Pod::UI)
      Pod::UI.warn "[react-native-firebase] Couldn't remove a stale FirebaseCore SPM link from the " \
                   "app target automatically (#{e.class}: #{e.message}). If you previously used SPM and have " \
                   'since set `$RNFirebaseDisableSPM = true`, remove the "firebase-ios-sdk" Swift Package ' \
                   'dependency from your app target manually in Xcode.'
    end
  end
  begin
    rnfirebase_fix_spm_archive_signature_collision(installer)
  rescue StandardError => e
    if defined?(Pod::UI)
      Pod::UI.warn '[react-native-firebase] Couldn\'t add the Firebase/Google SPM binary ' \
                   "xcframework signature workaround automatically (#{e.class}: #{e.message}). If your " \
                   'Release archive fails with `"...xcframework-ios.signature" couldn\'t be copied to ' \
                   '"Signatures" because an item with the same name already exists`, add a Run Script ' \
                   'build phase to your app target that runs `rm -f ' \
                   '"\\${CONFIGURATION_BUILD_DIR}"/<TheNameFromTheErrorMessage>.xcframework-ios.signature`.'
    end
  end
  begin
    rnfirebase_apply_spm_build_settings(installer)
  rescue StandardError => e
    if defined?(Pod::UI)
      Pod::UI.warn "[react-native-firebase] Couldn't apply Firebase SPM build settings " \
                   "automatically (#{e.class}: #{e.message}). " \
                   'Add `rnfirebase_apply_spm_build_settings(installer)` ' \
                   'to your Podfile\'s post_integrate block as a fallback if Release builds crash at launch with ' \
                   'missing FIRComponent registrations, or Xcode reports that a Firebase module such as ' \
                   '`FirebaseCoreInternal`/`FirebaseSharedSwift` cannot be resolved.'
    end
  end
end

# We wrap `Pod::Installer#generate_pods_project` (restore RNFB dynamic
# frameworks after Expo's prebuilt downgrade and CocoaPods' transitive-static
# validation, but before product/link-input generation),
# `Pod::Installer#run_podfile_post_install_hooks` (Pods project: UUID counter,
# RN SPM integrity, static-linkage guard) and, when present,
# `Pod::Installer#run_podfile_post_integrate_hooks` (user project: embed
# Firebase SPM frameworks + link FirebaseCore onto the app target).
#
# CocoaPods runs `post_install` *before* writing projects and *before*
# `integrate_user_project`. That integrator is what adds
# `[CP] Embed Pods Frameworks` on a clean app target and then *saves* the
# user `.pbxproj`. Helpers that key off that phase (or that `project.save`
# the app target) must therefore run in `post_integrate`, which CocoaPods
# calls at the end of `integrate_user_project` after that save.
#
# Expo CNG `expo prebuild --clean` always starts from a template with no CP
# embed phase. Running the user-project helpers from `post_install` silently
# skipped every native target, then integrate wrote `[CP] Embed Pods
# Frameworks` without `[RNFB] Embed Firebase SPM Frameworks` or a
# FirebaseCore `PBXBuildFile` -- undefined `_OBJC_CLASS_$_FIRApp` from
# AppDelegate (#9158 / CPRN-301). A committed bare-RN `ios/` folder that
# already had the CP phase from a prior `pod install` could look fine at
# `post_install` and hid this on #9164.
#
# This file is `require`d from each RNFB podspec, which CocoaPods evaluates
# early, during dependency resolution (itself one of the first steps inside
# `Installer#install!`). That's early enough for the patch installed here to
# affect the later hook calls in that same `install!` run.
#
# Why hook CocoaPods instead of React Native: `Pod::Installer` is a stable,
# semantically-versioned public class that the wider CocoaPods plugin
# ecosystem already depends on directly, and its shape hasn't materially
# changed in years. That makes it a meaningfully safer patch target than
# RN's private, unversioned `react-native/scripts/cocoapods/spm.rb` helper,
# which isn't part of any documented RN contract. If CocoaPods ever
# renames/removes these methods, the guards below no-op instead of raising,
# and print a `pod install`-time warning telling you to call
# `rnfirebase_add_spm_embed_phase(installer)` from your own Podfile as a
# fallback. Older CocoaPods without `run_podfile_post_integrate_hooks` keeps
# the user-project helpers on `post_install`.
#
# `installer_class` is only ever overridden by tests -- there's no real
# `Pod::Installer` outside of a full CocoaPods environment.
def rnfirebase_hook_cocoapods_post_install!(installer_class = (Pod::Installer if defined?(Pod::Installer)))
  generate_method = :generate_pods_project
  generate_original_method = :rnfirebase_original_generate_pods_project
  hook_method = :run_podfile_post_install_hooks
  original_method = :rnfirebase_original_run_podfile_post_install_hooks
  integrate_hook_method = :run_podfile_post_integrate_hooks
  integrate_original_method = :rnfirebase_original_run_podfile_post_integrate_hooks

  unless installer_class
    if defined?(Pod::UI)
      Pod::UI.warn '[react-native-firebase] `Pod::Installer` isn\'t defined -- automatic Firebase SPM setup ' \
                   '(dynamic framework embedding, etc.) was not hooked into `pod install`. Add ' \
                   '`rnfirebase_add_spm_embed_phase(installer)` to your Podfile\'s post_integrate block as a fallback.'
    end
    return
  end

  was_private = installer_class.private_method_defined?(hook_method)
  unless was_private || installer_class.method_defined?(hook_method)
    if defined?(Pod::UI)
      Pod::UI.warn "[react-native-firebase] `Pod::Installer##{hook_method}` doesn't exist (a CocoaPods " \
                   'release may have renamed or removed it) -- automatic Firebase SPM setup was not hooked into ' \
                   '`pod install`. Add `rnfirebase_add_spm_embed_phase(installer)` to your Podfile\'s post_integrate ' \
                   'block as a fallback.'
    end
    return
  end

  already_hooked_post_install = installer_class.method_defined?(original_method) ||
                                installer_class.private_method_defined?(original_method)
  already_hooked_generate = installer_class.method_defined?(generate_original_method) ||
                            installer_class.private_method_defined?(generate_original_method)
  already_hooked_post_integrate = installer_class.method_defined?(integrate_original_method) ||
                                  installer_class.private_method_defined?(integrate_original_method)

  generate_was_private = installer_class.private_method_defined?(generate_method)
  generate_available = generate_was_private || installer_class.method_defined?(generate_method)
  integrate_was_private = installer_class.private_method_defined?(integrate_hook_method)
  post_integrate_available = integrate_was_private || installer_class.method_defined?(integrate_hook_method)

  generate_unavailable_warning = :@rnfirebase_generate_pods_project_unavailable_warning
  if !already_hooked_generate &&
     !generate_available &&
     defined?(Expo::PrecompiledModules) &&
     Expo::PrecompiledModules.respond_to?(:enabled?) &&
     Expo::PrecompiledModules.enabled? &&
     defined?(Pod::UI) &&
     !installer_class.instance_variable_defined?(generate_unavailable_warning)
    Pod::UI.warn '[react-native-firebase] `Pod::Installer#generate_pods_project` does not exist ' \
                 '(a CocoaPods release may have renamed or removed it) -- Expo prebuilt RNFB ' \
                 'dynamic-linkage restoration was not hooked into `pod install`. Use the CocoaPods ' \
                 'version required by your Expo SDK and report this version combination if the app ' \
                 'links duplicate Firebase symbols.'
    installer_class.instance_variable_set(generate_unavailable_warning, true)
  end

  # Already hooked -- e.g. a second RNFB podspec also `require`d this same
  # file within one `pod install` process. Expected and idempotent.
  return if (already_hooked_generate || !generate_available) &&
            already_hooked_post_install &&
            (already_hooked_post_integrate || !post_integrate_available)

  unless already_hooked_generate || !generate_available
    installer_class.class_eval do
      alias_method generate_original_method, generate_method

      define_method(generate_method) do
        # Expo's patched pre-install implementation has already downgraded
        # React-Core-dependent targets, and CocoaPods has already validated
        # that graph. Restore RNFB immediately before CocoaPods reads each
        # pod target's build type to generate products and app link inputs.
        begin
          rnfirebase_restore_dynamic_linkage_after_expo_prebuilt!(self)
        rescue StandardError => e
          if defined?(Pod::UI)
            Pod::UI.warn '[react-native-firebase] Expo prebuilt RNFB dynamic-linkage restoration failed ' \
                         "(#{e.class}: #{e.message}). Pod install aborted to avoid a partial restore."
          end
          raise
        end
        send(generate_original_method)
      end
    end
    installer_class.send(:private, generate_method) if generate_was_private
  end

  unless already_hooked_post_integrate || !post_integrate_available
    installer_class.class_eval do
      alias_method integrate_original_method, integrate_hook_method

      define_method(integrate_hook_method) do
        result = send(integrate_original_method)
        rnfirebase_run_spm_user_project_hooks(self)
        result
      end
    end
    installer_class.send(:private, integrate_hook_method) if integrate_was_private
  end

  return if already_hooked_post_install

  installer_class.class_eval do
    alias_method original_method, hook_method

    define_method(hook_method) do
      # Deliberately not wrapped in a rescue-and-warn like the checks below:
      # there's no working fallback for this combination, so letting `pod
      # install` continue would only delay the same failure to Xcode's
      # build/link step, with a far more confusing error and no pointer back
      # to the actual misconfiguration.
      rnfirebase_fail_if_spm_static_linkage!(self)
      # Soft ensure (warn on unexpected errors) -- paired with the hard
      # `rnfirebase_verify_pods_project_uuid_integrity!` after original
      # post_install.
      begin
        rnfirebase_ensure_pods_uuid_counter_safe!(self)
      rescue StandardError => e
        if defined?(Pod::UI)
          Pod::UI.warn '[react-native-firebase] Couldn\'t raise Pods UUID counter before ' \
                       "RN SPM (#{e.class}: #{e.message}). If `pod install` leaves Pods.xcodeproj " \
                       'damaged (missing PBXProject / Xcode `_setSavedArchiveVersion`), upgrade ' \
                       'react-native-firebase or patch CocoaPods UUID generation.'
        end
      end
      result = send(original_method)
      # Deliberately not rescued: if RN SPM overwrote `rootObject`, continuing
      # would only delay the failure to Xcode with a worse diagnostic.
      rnfirebase_verify_pods_project_uuid_integrity!(self)
      # Current CocoaPods: user-project mutations run from post_integrate
      # (after `[CP] Embed Pods Frameworks` exists). Older CocoaPods without
      # that hook keeps them here.
      rnfirebase_run_spm_user_project_hooks(self) unless post_integrate_available
      result
    end
  end
  installer_class.send(:private, hook_method) if was_private
rescue StandardError => e
  if defined?(Pod::UI)
    Pod::UI.warn "[react-native-firebase] Couldn't hook CocoaPods to auto-embed Firebase SPM " \
                 "frameworks (#{e.class}: #{e.message}). Add `rnfirebase_add_spm_embed_phase(installer)` " \
                 'to your Podfile\'s post_integrate block as a fallback.'
  end
end

# Adds a direct SPM product dependency on `FirebaseCore` to the *app's own*
# native target(s) -- not just RNFB's pod targets. Runs automatically on every
# `pod install`/`pod update` from `rnfirebase_run_spm_user_project_hooks`
# (post_integrate on current CocoaPods; post_install fallback otherwise) --
# see `rnfirebase_hook_cocoapods_post_install!` -- so you normally never
# need to call this yourself.
#
# Why this needs to exist: every react-native-firebase app is required to
# `import Firebase` and call `FirebaseApp.configure()` (Swift) /
# `[FIRApp configure]` (Objective-C) itself -- this isn't an optional pattern
# for a secondary app instance, it's a strict requirement for all RNFB apps.
# With CocoaPods-only Firebase dependency resolution, every RNFB pod declares
# a regular `s.dependency 'Firebase/CoreOnly'`, and CocoaPods automatically
# propagates the resulting framework/header search paths all the way up to
# the app's own target -- so that required `FIRApp configure` call has always
# been able to link against FirebaseCore for free, without the app declaring
# anything itself. Xcode's own SPM package product dependencies don't
# propagate the same way: each target needs its own *explicit* product
# dependency in order to link a package product. Without this, apps using
# SPM+dynamic linkage fail at Archive time with "Undefined symbols ...
# _OBJC_CLASS_$_FIRApp", even though the same code links fine under
# CocoaPods-only resolution.
def rnfirebase_add_spm_core_to_app_target(installer)
  return unless RNFirebaseSPM.active?

  pkg_class = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference
  ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency

  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    project_modified = false

    project.native_targets.each do |target|
      next unless target.respond_to?(:package_product_dependencies)
      next unless target.respond_to?(:shell_script_build_phases)
      next unless target.shell_script_build_phases.any? { |phase| phase.name == '[CP] Embed Pods Frameworks' }

      # A `FirebaseCore` product dependency already being declared on the
      # target does *not* by itself mean this target is a genuine no-op:
      # a pre-fix RNFB version could have committed that dependency into
      # the consumer's `.pbxproj` without ever linking it (see the
      # PBXBuildFile comment below) -- that's the exact broken state #9158
      # reports, and it's already sitting in every affected consumer's
      # project today. So checking `package_product_dependencies` alone
      # can't tell that already-affected state apart from a healthy,
      # already-linked one -- it has to check the build phase itself.
      existing_ref = target.package_product_dependencies.find { |dep| dep.product_name == 'FirebaseCore' }
      if existing_ref
        next if target.frameworks_build_phase.files.any? { |bf| bf.product_ref == existing_ref }

        # Healing path: reuse the dependency (and its package reference)
        # that's already declared -- only the link (PBXBuildFile) is
        # missing, so don't create a duplicate dependency/package reference.
        ref = existing_ref
      else
        pkg = project.root_object.package_references.find do |candidate|
          candidate.instance_of?(pkg_class) && candidate.repositoryURL == RNFirebaseSPM.url
        end
        unless pkg
          pkg = project.new(pkg_class)
          pkg.repositoryURL = RNFirebaseSPM.url
          pkg.requirement = { kind: 'upToNextMajorVersion', minimumVersion: RNFirebaseSPM.version }
          project.root_object.package_references << pkg
        end

        ref = project.new(ref_class)
        ref.package = pkg
        ref.product_name = 'FirebaseCore'
        target.package_product_dependencies << ref
      end

      if defined?(Pod::UI)
        message = if existing_ref
                    'Repairing FirebaseCore SPM link on the app target (dependency was already declared but ' \
                      'never linked) so native code that calls FIRApp/FIROptions APIs directly can resolve ' \
                      'those symbols.'
                  else
                    'Linking FirebaseCore directly into the app target (SPM) so native code that calls ' \
                      'FIRApp/FIROptions APIs directly can resolve those symbols.'
                  end
        Pod::UI.puts "[react-native-firebase] #{target.name}: ".yellow + message
      end

      # Declaring the product dependency (above, or in a prior install for
      # the healing path) only tells Xcode the target *depends* on it -- it
      # doesn't actually link it. Linking a package product (same as
      # CocoaPods pod dependencies, and the same as adding
      # one via Xcode's own "Frameworks, Libraries, and Embedded Content" UI)
      # requires a matching PBXBuildFile, with its product_ref pointed at
      # this same dependency, in the target's Frameworks build phase. Without
      # this, the app fails at the link step with "Undefined symbols ...
      # _OBJC_CLASS_$_FIRApp" for any native code that calls FIRApp/FIROptions
      # directly (e.g. Expo's generated AppDelegate) -- even though `pod
      # install` itself appears to succeed.
      build_file = project.new(Xcodeproj::Project::Object::PBXBuildFile)
      build_file.product_ref = ref
      target.frameworks_build_phase.files << build_file

      target.build_configurations.each do |config|
        build_settings = target.build_settings(config.name)
        # Normalize first: Xcode/Xcodeproj may already represent
        # SWIFT_INCLUDE_PATHS as a whitespace-separated String rather than an
        # Array, depending on how the consumer's project was authored. A bare
        # `||= ['$(inherited)']` only covers the nil case -- calling `.push`
        # on an existing String value raises NoMethodError and crashes `pod
        # install` for that target.
        paths = rnfirebase_build_setting_list(build_settings['SWIFT_INCLUDE_PATHS'])
        search_path = '${SYMROOT}/${CONFIGURATION}${EFFECTIVE_PLATFORM_NAME}/'
        paths << search_path unless paths.include?(search_path)
        build_settings['SWIFT_INCLUDE_PATHS'] = paths
      end

      project_modified = true
    end

    project.save if project_modified
  end
end

# Undoes `rnfirebase_add_spm_core_to_app_target` -- removes the direct SPM
# `FirebaseCore` product dependency (and, once nothing else references it,
# the "firebase-ios-sdk" package reference itself) from the app's own native
# target(s). Runs automatically on every `pod install`/`pod update` alongside
# `rnfirebase_add_spm_core_to_app_target` -- see
# `rnfirebase_hook_cocoapods_post_install!` above -- so you normally never
# need to call this yourself.
#
# Why this needs to exist: `rnfirebase_add_spm_core_to_app_target` writes into
# the *app's own* Xcode project (`aggregate_target.user_project`, e.g.
# `testing.xcodeproj`) -- a different project than the one React Native's own
# SPM integration manages (`installer.pods_project`, i.e. `Pods.xcodeproj`).
# RN's `SPMManager#clean_spm_dependencies_from_target` (in
# `react-native/scripts/cocoapods/spm.rb`) only ever clears package
# references from `pods_project` on every `pod install` -- it has no
# knowledge of, and never touches, the app-project-level reference added
# above. So once SPM has been active at least once and the resulting
# `FirebaseCore` product dependency has been committed into the app's
# `.pbxproj` (as it normally would be), switching to
# `$RNFirebaseDisableSPM = true` and reinstalling left that stale SPM wiring
# in place forever: the app target ended up simultaneously linked against
# Xcode's SPM-resolved `firebase-ios-sdk` package graph *and* the freshly
# CocoaPods-resolved `Firebase/CoreOnly` pod, and the two copies of
# Firebase's module graph collided -- surfacing as `redefinition of module
# 'Firebase'` at compile time, and as duplicate App-Intents-metadata build
# commands at Archive time.
def rnfirebase_remove_spm_core_from_app_target(installer)
  return if RNFirebaseSPM.active?

  pkg_class = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference
  ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency

  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    project_modified = false

    project.native_targets.each do |target|
      next unless target.respond_to?(:package_product_dependencies)

      stale_refs = target.package_product_dependencies.select do |dep|
        dep.instance_of?(ref_class) && dep.product_name == 'FirebaseCore' && dep.package&.repositoryURL == RNFirebaseSPM.url # rubocop:disable Layout/LineLength
      end
      next if stale_refs.empty?

      if defined?(Pod::UI)
        Pod::UI.puts "#{"[react-native-firebase] #{target.name}: ".yellow}SPM disabled -- removing the stale FirebaseCore Swift Package link left on the app target." # rubocop:disable Layout/LineLength
      end

      stale_refs.each do |ref|
        target.package_product_dependencies.delete(ref)
        # `ref.remove_from_project` below only nils out the matching PBXBuildFile's
        # product_ref -- it doesn't remove the now-empty PBXBuildFile itself from the
        # Frameworks build phase -- so look it up first, while product_ref is still set.
        stale_build_file = target.frameworks_build_phase.files.find { |file| file.product_ref == ref }
        target.frameworks_build_phase.files.delete(stale_build_file) if stale_build_file
        ref.remove_from_project
      end
      project_modified = true
    end

    project.root_object.package_references
           .select { |pkg| pkg.instance_of?(pkg_class) && pkg.repositoryURL == RNFirebaseSPM.url }
           .each do |pkg|
             next if pkg.referrers.any?(ref_class)

             project.root_object.package_references.delete(pkg)
             pkg.remove_from_project
             project_modified = true
           end

    project.save if project_modified
  end
end

# Works around a long-standing Xcode Archive bug (present since Xcode 15,
# still reproducing on Xcode 26) where a Swift Package binary target's
# `.signature` provenance file gets staged into more than one target's build
# directory when multiple targets in the workspace transitively depend on the
# same binary artifact. Xcode's Archive action then tries to copy every
# staged copy into the shared `<Archive>.xcarchive/Signatures/` directory,
# and the second copy collides with the first:
#
#   "GoogleAppMeasurementIdentitySupport.xcframework-ios.signature" couldn't
#   be copied to "Signatures" because an item with the same name already
#   exists.
#
# This isn't specific to react-native-firebase -- the same class of bug, with
# the same fix, has been reported for other CocoaPods+SPM binary xcframeworks
# (Mapbox: CocoaPods/CocoaPods#12022; MapLibre: maplibre-react-native#1489;
# Lottie).
#
# It can hit *any* binary xcframework in the resolved graph, not just
# Analytics-related ones -- e.g. Google's own `google/GoogleAppMeasurement.git`
# SPM package unconditionally links `GoogleAdsOnDeviceConversion` (from the
# *separate* `googleads/google-ads-on-device-conversion-ios-sdk` package) as a
# dependency of `GoogleAppMeasurementTarget`, completely independent of
# RNFBAnalytics's own *optional* `spm_dependency` call for it (gated behind
# `$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion`, which turns
# out to only matter for CocoaPods-only resolution) -- none of that showed up
# as a reference in our own podspecs or pbxprojs; it only turned up by
# inspecting the actual checked-out Package.swift manifests under
# DerivedData/.../SourcePackages/checkouts. Confirmed locally: fixing one
# binary artifact just surfaces the collision on the next one on a subsequent
# archive run, so `RNFIREBASE_SPM_SIGNATURE_FIX_ARTIFACT_NAMES` above lists
# every `.binaryTarget` xcframework in the resolved graph (enumerated from
# `SourcePackages/workspace-state.json`, not guessed) so they're all covered
# in one pass.
#
# Deliberately scoped to this known artifact-name list rather than a bare
# `*.signature` glob -- broad enough to cover this whole binary family without
# also silently masking an unrelated, legitimate "file already exists"
# failure from some other SPM package in a consumer's own app.
def rnfirebase_fix_spm_archive_signature_collision(installer)
  return unless RNFirebaseSPM.active?

  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    project_modified = false

    project.native_targets.each do |target|
      next unless target.respond_to?(:shell_script_build_phases)
      next unless target.shell_script_build_phases.any? { |phase| phase.name == '[CP] Embed Pods Frameworks' }

      rm_lines = RNFIREBASE_SPM_SIGNATURE_FIX_ARTIFACT_NAMES.map do |name|
        "rm -f \"${CONFIGURATION_BUILD_DIR}\"/#{name}.xcframework-ios.signature"
      end
      # Trailing newline required for Xcode Run Script phase content.
      shell_script = "#{rm_lines.join("\n")}\n"

      changed = rnfirebase_upsert_shell_script_phase!(
        target,
        RNFIREBASE_SPM_SIGNATURE_FIX_PHASE_NAME,
        shell_script: shell_script,
        shell_path: '/bin/sh'
      )
      project_modified ||= changed
    end

    project.save if project_modified
  end
end

# Applies Release/module-build-system settings that Firebase SPM + dynamic
# linkage requires on the app's own native target(s) and on the Pods
# project. Runs automatically on every `pod install`/`pod update` -- see
# `rnfirebase_hook_cocoapods_post_install!` above -- so you normally never
# need to call this yourself.
#
# 1. `-ObjC` in `OTHER_LDFLAGS` (app target, every configuration): under SPM
#    + dynamic linkage, dead-code stripping can drop Objective-C
#    classes/categories that are only ever discovered via runtime reflection
#    rather than a direct static reference -- e.g. Firebase's
#    FIRLibrary/FIRComponent registration used by RNFBCrashlyticsInitProvider
#    -- which otherwise crashes the app at launch, but only in Release/
#    Archive builds (a TestFlight-only failure that's hard to reproduce from
#    a local Debug build). `-ObjC` forces the linker to keep any object file
#    that defines an ObjC class/category, without disabling dead-code
#    stripping or optimizations for anything else, so it doesn't meaningfully
#    grow the binary or slow down Release builds.
#
# 2. `SWIFT_ENABLE_EXPLICIT_MODULES = 'NO'` and `CLANG_ENABLE_EXPLICIT_MODULES
#    = 'NO'` (app target and Pods project, every configuration): Xcode 26
#    enables explicit modules -- separately for Swift and for Clang -- by
#    default, but Firebase's SPM internal targets (`FirebaseCoreInternal`,
#    `FirebaseSharedSwift`) aren't exposed as public products. Explicit
#    modules is a build-system-wide setting for Swift Package products
#    resolved via the app's own project/scheme (SPM packages don't have
#    their own toggle for it), so both settings have to be disabled on the
#    app project too, not just the Pods project -- otherwise pure-Swift
#    Firebase SPM products (Storage, RemoteConfig, Database, InAppMessaging)
#    intermittently fail to have their generated ObjC interop header
#    (*-Swift.h) available when the consuming RNFB Pods target starts
#    compiling. This does NOT disable SPM -- it only makes Swift and Clang
#    use implicit module discovery (the Xcode 16 default) uniformly across
#    the app, CocoaPods, and SPM build boundary. See
#    okf-bundle/ios-spm-native-imports.md.
#
# NOT applied (tried and reverted): `-fmodules -fcxx-modules` in
# `OTHER_CPLUSPLUSFLAGS`, to let `.mm` files use `@import FirebaseCore;`/
# `@import <ProductName>;` -- every RNFB module's Objective-C header falls
# back to that Clang module-import syntax (as opposed to a plain `#import
# <Header.h>`) when `__has_include(<ProductName/Header.h>)` fails to find a
# classic `<Module/Header.h>`-style include path. It turns out that fallback
# is never actually exercised for the app target: `rnfirebase_add_spm_core_to_app_target`
# above already links `FirebaseCore` into the app target as a direct SPM
# product dependency, and Xcode's SPM integration then adds header search
# paths for *every* product in that resolved package graph (not just
# `FirebaseCore`) to any target with at least one product dependency on it
# -- so `__has_include(<FirebaseAppCheck/FirebaseAppCheck.h>)` (etc.)
# already succeeds for the app target's own files, and the `@import`
# fallback branch is dead code there. Forcing C++ modules on anyway just
# breaks things: Xcode then tries to build Clang modules for anything the
# app `#import`s, including React Native's own `use_frameworks!` products,
# and several of those (`glog`, `cxxreact` -- via `folly`) aren't clean
# under `-fcxx-modules` (e.g. "import of module 'glog.log_severity' appears
# within namespace 'google'", "no type named 'is_dynamic' in namespace
# 'facebook::xplat::detail'"), failing the Archive build with "could not
# build module 'glog'"/`'cxxreact'`. Confirmed via a real `xcodebuild
# archive`: with this flag, the build fails on React Native's own C++ pods;
# without it, `@import` is never reached and the archive succeeds cleanly.
def rnfirebase_apply_spm_build_settings(installer)
  return unless RNFirebaseSPM.active?

  explicit_modules_settings = %w[SWIFT_ENABLE_EXPLICIT_MODULES CLANG_ENABLE_EXPLICIT_MODULES]

  add_flag = lambda do |build_settings, key, flag|
    current = rnfirebase_build_setting_list(build_settings[key])

    next false if current.include?(flag)

    build_settings[key] = (current << flag).join(' ')
    true
  end

  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    project_modified = false

    project.native_targets.each do |target|
      target.build_configurations.each do |config|
        ldflags_changed = add_flag.call(config.build_settings, 'OTHER_LDFLAGS', '-ObjC')
        project_modified ||= ldflags_changed

        explicit_modules_settings.each do |setting|
          unless config.build_settings[setting] == 'NO'
            config.build_settings[setting] = 'NO'
            project_modified = true
          end
        end
      end
    end

    project.save if project_modified
  end

  # User-project settings are `project.save`d above. Pods settings used to
  # live only on the in-memory `installer.pods_project` during `post_install`,
  # when CocoaPods still writes that file. The user-project hooks now run
  # from `post_integrate` (after that write), so these mutations are lost
  # unless we save. Xcode 26 then keeps explicit modules on RNFB pod
  # targets and fails Swift compiles that import Firebase SPM internals
  # (`FirebaseCoreInternal`, `FirebaseSharedSwift`) with "compilation
  # search paths unable to resolve module dependency".
  pods_project = installer.pods_project
  return unless pods_project

  pods_modified = false
  pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      explicit_modules_settings.each do |setting|
        unless config.build_settings[setting] == 'NO'
          config.build_settings[setting] = 'NO'
          pods_modified = true
        end
      end
    end
  end
  pods_project.save if pods_modified
end

rnfirebase_hook_cocoapods_post_install!

# @param spec [Pod::Specification] The podspec object (the `s` in podspec DSL)
# @param version [String] Firebase SDK version (e.g., '12.10.0')
# @param spm_products [Array<String>] SPM product names (e.g., ['FirebaseAuth'])
# @param pods [Array<String>, String] CocoaPods dependency names with optional version
#   Can be a single string like 'Firebase/Auth' or an array like ['Firebase/Messaging', 'FirebaseCoreExtension']
def firebase_dependency(spec, version, spm_products, pods)
  if defined?(spm_dependency) && !rnfirebase_spm_disabled?
    # Tracked ourselves (rather than inspecting RN's internal `SPM` object's
    # dependency list) so `rnfirebase_add_spm_embed_phase` doesn't depend on
    # any RN-internal state shape -- only on whether *we* ever took this path.
    RNFirebaseSPM.activate!(version)
    if defined?(Pod::UI)
      Pod::UI.puts "[react-native-firebase] #{spec.name}: ".yellow +
                   "Using SPM for Firebase dependency resolution (products: #{spm_products.join(', ')})"
    end
    spm_dependency(spec,
                   url: RNFirebaseSPM.url,
                   requirement: { kind: 'upToNextMajorVersion', minimumVersion: version },
                   products: spm_products)
  else
    if defined?(Pod::UI)
      if rnfirebase_spm_disabled?
        Pod::UI.puts "#{"[react-native-firebase] #{spec.name}: ".yellow}SPM disabled ($RNFirebaseDisableSPM = true), using CocoaPods for Firebase dependencies" # rubocop:disable Layout/LineLength
      elsif !defined?(spm_dependency)
        Pod::UI.puts "#{"[react-native-firebase] #{spec.name}: ".yellow}SPM not available (React Native < 0.75), using CocoaPods for Firebase dependencies" # rubocop:disable Layout/LineLength
      end
    end
    pods = [pods] unless pods.is_a?(Array)
    pods.each do |pod|
      spec.dependency pod, version
    end
  end
end

# rubocop:enable Metrics, Style/GlobalVars
