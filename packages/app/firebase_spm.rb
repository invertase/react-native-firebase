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

def rnfirebase_spm_embed_script
  <<~'SCRIPT'
    set -euo pipefail

    package_frameworks_dir="${BUILT_PRODUCTS_DIR}/PackageFrameworks"
    app_frameworks_dir="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"

    if [ ! -d "${package_frameworks_dir}" ]; then
      exit 0
    fi

    mkdir -p "${app_frameworks_dir}"

    find "${package_frameworks_dir}" -maxdepth 1 -type d -name "*.framework" -print0 | while IFS= read -r -d '' framework; do
      framework_name="$(basename "${framework}")"
      destination="${app_frameworks_dir}/${framework_name}"

      if [ -e "${destination}" ]; then
        continue
      fi

      echo "Embedding Firebase SPM framework ${framework_name}"
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
  SCRIPT
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

      phase = target.shell_script_build_phases.find { |candidate| candidate.name == RNFIREBASE_SPM_EMBED_PHASE_NAME }
      phase ||= target.new_shell_script_build_phase(RNFIREBASE_SPM_EMBED_PHASE_NAME)

      phase.shell_script = rnfirebase_spm_embed_script
      phase.shell_path = '/bin/bash'
      phase.always_out_of_date = '1'
      phase.input_paths = ['${BUILT_PRODUCTS_DIR}/PackageFrameworks']
      phase.output_paths = ['${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}']
      project_modified = true
    end

    # Only rewrite the pbxproj when we actually touched a target in it --
    # avoids an unconditional save on every aggregate target whenever any
    # podspec uses SPM, even ones with no '[CP] Embed Pods Frameworks' phase.
    aggregate_target.user_project.save if project_modified
  end
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
