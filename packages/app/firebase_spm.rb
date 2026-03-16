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

# Read Firebase SPM URL from app package.json (single source of truth)
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
# dependency resolution. This is required when using `use_frameworks! :linkage => :static`
# because static frameworks cause each pod to embed Firebase SPM products,
# resulting in duplicate symbol linker errors.
#
# @param spec [Pod::Specification] The podspec object (the `s` in podspec DSL)
# @param version [String] Firebase SDK version (e.g., '12.10.0')
# @param spm_products [Array<String>] SPM product names (e.g., ['FirebaseAuth'])
# @param pods [Array<String>, String] CocoaPods dependency names with optional version
#   Can be a single string like 'Firebase/Auth' or an array like ['Firebase/Messaging', 'FirebaseCoreExtension']
def firebase_dependency(spec, version, spm_products, pods)
  if defined?(spm_dependency) && !defined?($RNFirebaseDisableSPM)
    Pod::UI.puts "[react-native-firebase] #{spec.name}: ".yellow +
      "Using SPM for Firebase dependency resolution (products: #{spm_products.join(', ')})"
    spm_dependency(spec,
      url: $firebase_spm_url,
      requirement: { kind: 'upToNextMajorVersion', minimumVersion: version },
      products: spm_products
    )
  else
    if defined?($RNFirebaseDisableSPM)
      Pod::UI.puts "[react-native-firebase] #{spec.name}: ".yellow +
        "SPM disabled ($RNFirebaseDisableSPM = true), using CocoaPods for Firebase dependencies"
    elsif !defined?(spm_dependency)
      Pod::UI.puts "[react-native-firebase] #{spec.name}: ".yellow +
        "SPM not available (React Native < 0.75), using CocoaPods for Firebase dependencies"
    end
    pods = [pods] unless pods.is_a?(Array)
    pods.each do |pod|
      spec.dependency pod, version
    end
  end
end
