# frozen_string_literal: true

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
RNFIREBASE_SPM_SIGNATURE_FIX_PHASE_NAME = '[RNFB] Remove duplicate Firebase/Google SPM binary xcframework signature files'

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

# Read Firebase SPM URL from app package.json (single source of truth).
# __dir__ resolves to the directory of this file (packages/app/).
# In monorepos with hoisted dependencies or pnpm, the path from other packages
# (e.g., `require '../app/firebase_spm'`) must resolve correctly to this location.
# If your package manager hoists differently, you may need to adjust the require
# path in individual podspecs.
$firebase_spm_url ||= begin
  app_package_path = File.join(__dir__, 'package.json')
  app_package = JSON.parse(File.read(app_package_path))
  app_package['sdkVersions']['ios']['firebaseSpmUrl']
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
# firebase-ios-sdk SPM requires dynamic linkage. There is no upstream statement
# from Google that SPM+static is supported. See:
# https://github.com/firebase/firebase-ios-sdk/blob/main/Package.swift
# (all products use .library(type: .dynamic))
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
    current.split(' ')
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
    # never populates any target's PackageFrameworks folder at all -- it builds
    # Swift Package products into a separate shared "uninstalled products"
    # folder instead. Without also checking here, a real `xcodebuild archive`
    # (i.e. every TestFlight/App Store build) silently embeds zero Firebase SPM
    # frameworks and the resulting app crashes at launch with a missing-library
    # dyld error.
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
  changed ||= (!input_paths.nil? && phase.input_paths != input_paths)
  changed ||= (!output_paths.nil? && phase.output_paths != output_paths)

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
#   post_install do |installer|
#     react_native_post_install(installer, ...)
#     rnfirebase_add_spm_embed_phase(installer)
#   end
def rnfirebase_add_spm_embed_phase(installer)
  return unless $rnfirebase_spm_active

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

# Fails `pod install` fast, with a clear explanation, when RNFB's SPM mode is
# combined with static linkage (`use_frameworks! :linkage => :static`) --
# instead of letting consumers hit a confusing "duplicate symbols for
# architecture ..." linker error later, at Xcode build time, with no obvious
# link back to the Podfile setting that caused it.
#
# firebase-ios-sdk's SPM package only ships dynamic library products -- see
# https://github.com/firebase/firebase-ios-sdk/blob/main/Package.swift (every
# product uses `.library(type: .dynamic)`) -- so under static linkage, every
# RNFB pod that resolves Firebase via SPM ends up statically embedding its
# own private copy of the same Firebase SPM products, and the app target
# links duplicate symbols for each one. There is no supported combination of
# RNFB's SPM mode with static linkage to fall back to; the fix is always to
# either switch to dynamic linkage or opt out of SPM entirely.
#
# Raises `Pod::Informative` -- CocoaPods' own user-facing error class, which
# `pod install` prints as a plain, readable message with no Ruby backtrace --
# rather than warning-and-continuing like the other checks in this file.
def rnfirebase_fail_if_spm_static_linkage!(installer)
  return unless $rnfirebase_spm_active

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

    firebase-ios-sdk's Swift Package only ships dynamic library products, so `use_frameworks! :linkage => :static` causes every react-native-firebase pod that resolves Firebase via SPM to embed its own copy of the same Firebase frameworks -- this produces duplicate-symbol linker errors at build time instead of a clear error here.

    Fix one of the following in your Podfile, then run `pod install` again:
      - Use dynamic linkage: `use_frameworks! :linkage => :dynamic`
      - Opt out of SPM: set `$RNFirebaseDisableSPM = true` before any target block, then use the static or dynamic linkage your project requires.
  MESSAGE
end

# Hooks CocoaPods itself (not React Native) so `rnfirebase_add_spm_embed_phase`
# runs automatically on every `pod install`/`pod update`, without requiring
# any Podfile change from consumers.
#
# We wrap `Pod::Installer#run_podfile_post_install_hooks` -- the method
# CocoaPods calls, unconditionally, on every install (it's what runs the
# Podfile's own `post_install do |installer| ... end` block, if any, but the
# *wrapper* method itself always runs even when the Podfile defines no
# `post_install` at all). This is the same point in the install lifecycle
# where consumers previously called `rnfirebase_add_spm_embed_phase`
# manually, so behavior is unchanged -- only *how* it gets invoked differs.
#
# This file is `require`d from each RNFB podspec, which CocoaPods evaluates
# early, during dependency resolution (itself one of the first steps inside
# `Installer#install!`). That's early enough for the patch installed here to
# affect the *later*, fresh call to `run_podfile_post_install_hooks` made
# further down in that same `install!` run.
#
# Why hook CocoaPods instead of React Native: `Pod::Installer` is a stable,
# semantically-versioned public class that the wider CocoaPods plugin
# ecosystem already depends on directly, and its shape hasn't materially
# changed in years. That makes it a meaningfully safer patch target than
# RN's private, unversioned `react-native/scripts/cocoapods/spm.rb` helper,
# which isn't part of any documented RN contract. If CocoaPods ever
# renames/removes this method, the guards below no-op instead of raising,
# and print a `pod install`-time warning (a visible integration error,
# rather than a silent runtime dyld crash) telling you to call
# `rnfirebase_add_spm_embed_phase(installer)` from your own Podfile as a
# fallback.
#
# `installer_class` is only ever overridden by tests -- there's no real
# `Pod::Installer` outside of a full CocoaPods environment.
def rnfirebase_hook_cocoapods_post_install!(installer_class = (Pod::Installer if defined?(Pod::Installer)))
  hook_method = :run_podfile_post_install_hooks
  original_method = :rnfirebase_original_run_podfile_post_install_hooks

  return unless installer_class
  was_private = installer_class.private_method_defined?(hook_method)
  return unless was_private || installer_class.method_defined?(hook_method)
  return if installer_class.method_defined?(original_method) || installer_class.private_method_defined?(original_method)

  installer_class.class_eval do
    alias_method original_method, hook_method

    define_method(hook_method) do
      # Deliberately not wrapped in a rescue-and-warn like the checks below:
      # there's no working fallback for this combination, so letting `pod
      # install` continue would only delay the same failure to Xcode's
      # build/link step, with a far more confusing error and no pointer back
      # to the actual misconfiguration.
      rnfirebase_fail_if_spm_static_linkage!(self)
      result = send(original_method)
      begin
        rnfirebase_add_spm_embed_phase(self)
      rescue => e
        if defined?(Pod::UI)
          Pod::UI.warn "[react-native-firebase] Couldn't embed Firebase SPM frameworks " \
            "automatically (#{e.class}: #{e.message}). Add `rnfirebase_add_spm_embed_phase(installer)` " \
            'to your Podfile\'s post_install block as a fallback.'
        end
      end
      begin
        rnfirebase_add_spm_core_to_app_target(self)
      rescue => e
        if defined?(Pod::UI)
          Pod::UI.warn "[react-native-firebase] Couldn't link FirebaseCore into the app target " \
            "automatically (#{e.class}: #{e.message}). Add `rnfirebase_add_spm_core_to_app_target(installer)` " \
            'to your Podfile\'s post_install block as a fallback if your own native code calls ' \
            'FIRApp/FIROptions APIs directly.'
        end
      end
      begin
        rnfirebase_remove_spm_core_from_app_target(self)
      rescue => e
        if defined?(Pod::UI)
          Pod::UI.warn "[react-native-firebase] Couldn't remove a stale FirebaseCore SPM link from the " \
            "app target automatically (#{e.class}: #{e.message}). If you previously used SPM and have " \
            'since set `$RNFirebaseDisableSPM = true`, remove the "firebase-ios-sdk" Swift Package ' \
            'dependency from your app target manually in Xcode.'
        end
      end
      begin
        rnfirebase_fix_spm_archive_signature_collision(self)
      rescue => e
        if defined?(Pod::UI)
          Pod::UI.warn '[react-native-firebase] Couldn\'t add the Firebase/Google SPM binary ' \
            "xcframework signature workaround automatically (#{e.class}: #{e.message}). If your " \
            'Release archive fails with `"...xcframework-ios.signature" couldn\'t be copied to ' \
            '"Signatures" because an item with the same name already exists`, add a Run Script ' \
            'build phase to your app target that runs `rm -f ' \
            "\"\\${CONFIGURATION_BUILD_DIR}\"/<TheNameFromTheErrorMessage>.xcframework-ios.signature`."
        end
      end
      begin
        rnfirebase_apply_spm_build_settings(self)
      rescue => e
        if defined?(Pod::UI)
          Pod::UI.warn "[react-native-firebase] Couldn't apply Firebase SPM build settings " \
            "automatically (#{e.class}: #{e.message}). Add `rnfirebase_apply_spm_build_settings(installer)` " \
            'to your Podfile\'s post_install block as a fallback if Release builds crash at launch with ' \
            'missing FIRComponent registrations, or Xcode reports that a Firebase module such as ' \
            '`FirebaseCoreInternal`/`FirebaseSharedSwift` cannot be resolved.'
        end
      end
      result
    end
  end
  installer_class.send(:private, hook_method) if was_private
rescue => e
  if defined?(Pod::UI)
    Pod::UI.warn "[react-native-firebase] Couldn't hook CocoaPods to auto-embed Firebase SPM " \
      "frameworks (#{e.class}: #{e.message}). Add `rnfirebase_add_spm_embed_phase(installer)` " \
      'to your Podfile\'s post_install block as a fallback.'
  end
end

# Adds a direct SPM product dependency on `FirebaseCore` to the *app's own*
# native target(s) -- not just RNFB's pod targets. Runs automatically on every
# `pod install`/`pod update` alongside `rnfirebase_add_spm_embed_phase` -- see
# `rnfirebase_hook_cocoapods_post_install!` below -- so you normally never
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
  return unless $rnfirebase_spm_active

  pkg_class = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference
  ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency

  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    project_modified = false

    project.native_targets.each do |target|
      next unless target.respond_to?(:package_product_dependencies)
      next unless target.respond_to?(:shell_script_build_phases)
      next unless target.shell_script_build_phases.any? { |phase| phase.name == '[CP] Embed Pods Frameworks' }
      next if target.package_product_dependencies.any? { |dep| dep.product_name == 'FirebaseCore' }

      pkg = project.root_object.package_references.find do |candidate|
        candidate.class == pkg_class && candidate.repositoryURL == $firebase_spm_url
      end
      if !pkg
        pkg = project.new(pkg_class)
        pkg.repositoryURL = $firebase_spm_url
        pkg.requirement = { kind: 'upToNextMajorVersion', minimumVersion: $rnfirebase_spm_version }
        project.root_object.package_references << pkg
      end

      if defined?(Pod) && defined?(Pod::UI)
        Pod::UI.puts "[react-native-firebase] #{target.name}: ".yellow +
          'Linking FirebaseCore directly into the app target (SPM) so native code that calls ' \
          'FIRApp/FIROptions APIs directly can resolve those symbols.'
      end

      ref = project.new(ref_class)
      ref.package = pkg
      ref.product_name = 'FirebaseCore'
      target.package_product_dependencies << ref

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
  return if $rnfirebase_spm_active

  pkg_class = Xcodeproj::Project::Object::XCRemoteSwiftPackageReference
  ref_class = Xcodeproj::Project::Object::XCSwiftPackageProductDependency

  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    project_modified = false

    project.native_targets.each do |target|
      next unless target.respond_to?(:package_product_dependencies)

      stale_refs = target.package_product_dependencies.select do |dep|
        dep.class == ref_class && dep.product_name == 'FirebaseCore' && dep.package&.repositoryURL == $firebase_spm_url
      end
      next if stale_refs.empty?

      if defined?(Pod) && defined?(Pod::UI)
        Pod::UI.puts "[react-native-firebase] #{target.name}: ".yellow +
          'SPM disabled -- removing the stale FirebaseCore Swift Package link left on the app target.'
      end

      stale_refs.each do |ref|
        target.package_product_dependencies.delete(ref)
        ref.remove_from_project
      end
      project_modified = true
    end

    project.root_object.package_references
      .select { |pkg| pkg.class == pkg_class && pkg.repositoryURL == $firebase_spm_url }
      .each do |pkg|
        next if pkg.referrers.any? { |referrer| referrer.class == ref_class }

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
  return unless $rnfirebase_spm_active

  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    project_modified = false

    project.native_targets.each do |target|
      next unless target.respond_to?(:shell_script_build_phases)
      next unless target.shell_script_build_phases.any? { |phase| phase.name == '[CP] Embed Pods Frameworks' }

      shell_script = RNFIREBASE_SPM_SIGNATURE_FIX_ARTIFACT_NAMES.map { |name|
        "rm -f \"${CONFIGURATION_BUILD_DIR}\"/#{name}.xcframework-ios.signature"
      }.join("\n") + "\n"

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
  return unless $rnfirebase_spm_active

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

  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      explicit_modules_settings.each do |setting|
        config.build_settings[setting] = 'NO'
      end
    end
  end
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
    $rnfirebase_spm_active = true
    # Tracked so `rnfirebase_add_spm_core_to_app_target` can declare the same
    # minimum version requirement without needing its own copy of `version`.
    $rnfirebase_spm_version = version
    if defined?(Pod) && defined?(Pod::UI)
      Pod::UI.puts "[react-native-firebase] #{spec.name}: ".yellow +
        "Using SPM for Firebase dependency resolution (products: #{spm_products.join(', ')})"
    end
    spm_dependency(spec,
      url: $firebase_spm_url,
      requirement: { kind: 'upToNextMajorVersion', minimumVersion: version },
      products: spm_products
    )
  else
    if defined?(Pod) && defined?(Pod::UI)
      if rnfirebase_spm_disabled?
        Pod::UI.puts "[react-native-firebase] #{spec.name}: ".yellow +
          "SPM disabled ($RNFirebaseDisableSPM = true), using CocoaPods for Firebase dependencies"
      elsif !defined?(spm_dependency)
        Pod::UI.puts "[react-native-firebase] #{spec.name}: ".yellow +
          "SPM not available (React Native < 0.75), using CocoaPods for Firebase dependencies"
      end
    end
    pods = [pods] unless pods.is_a?(Array)
    pods.each do |pod|
      spec.dependency pod, version
    end
  end
end
