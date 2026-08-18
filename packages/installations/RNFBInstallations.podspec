require 'json'
require_relative '../app/firebase_spm'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
appPackage = JSON.parse(File.read(File.join('..', 'app', 'package.json')))

coreVersionDetected = appPackage['version']
coreVersionRequired = package['peerDependencies'][appPackage['name']]
firebase_sdk_version = appPackage['sdkVersions']['ios']['firebase']
if coreVersionDetected != coreVersionRequired
  Pod::UI.warn "NPM package '#{package['name']}' depends on '#{appPackage['name']}' v#{coreVersionRequired} but found v#{coreVersionDetected}, this might cause build issues or runtime crashes."
end
firebase_ios_target = appPackage['sdkVersions']['ios']['iosTarget']
firebase_macos_target = appPackage['sdkVersions']['ios']['macosTarget']
firebase_tvos_target = appPackage['sdkVersions']['ios']['tvosTarget']
firebase_sdk_version = appPackage['sdkVersions']['ios']['firebase']

Pod::Spec.new do |s|
  s.name                = "RNFBInstallations"
  s.version             = package["version"]
  s.description         = package["description"]
  s.summary             = <<-DESC
                            A well tested feature rich Firebase implementation for React Native, supporting iOS & Android.
                          DESC
  s.homepage            = "http://invertase.io/oss/react-native-firebase"
  s.license             = package['license']
  s.authors             = "Invertase Limited"
  s.source              = { :git => "https://github.com/invertase/react-native-firebase.git", :tag => "v#{s.version}" }
  s.social_media_url    = 'http://twitter.com/invertaseio'
  s.ios.deployment_target = firebase_ios_target
  s.macos.deployment_target = firebase_macos_target
  s.tvos.deployment_target = firebase_tvos_target
  s.source_files        = 'ios/**/*.{h,m,mm,cpp,swift}'
  s.private_header_files = "ios/**/*.h"
  s.exclude_files       = 'ios/generated/RCTThirdPartyComponentsProvider.*', 'ios/generated/RCTAppDependencyProvider.*', 'ios/generated/RCTModuleProviders.*', 'ios/generated/RCTModulesConformingToProtocolsProvider.*', 'ios/generated/RCTUnstableModulesRequiringMainQueueSetupProvider.*'

  # Must be set before install_modules_dependencies so RN can append use_frameworks
  # HEADER_SEARCH_PATHS (React-debug etc.). Assigning after overwrites those paths
  # and breaks from-source builds: react/timing/primitives.h → react/debug/flags.h.
  # CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES is required so the
  # framework module validates when consumers build with use_frameworks!.
  s.pod_target_xcconfig = {
    "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES" => "YES",
  }

  s.dependency          'RNFBApp'

  install_modules_dependencies(s);

  # Wire up prebuilt React-Core (RN 0.83+, default on 0.84+) so the legacy
  # <React/...> header imports resolve when RCT_USE_PREBUILT_RNCORE=1.
  if defined?(add_rncore_dependency)
    add_rncore_dependency(s)
  end

  if defined?(ENV["RCT_NEW_ARCH_ENABLED"]) != nil && (ENV["RCT_NEW_ARCH_ENABLED"] == '0')
     raise "#{s.name} requires New Architecture. Enable New Architecture to use this module"
  end

  if defined?($FirebaseSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
    firebase_sdk_version = $FirebaseSDKVersion
  end

  # Firebase dependencies
  firebase_dependency(s, firebase_sdk_version, ['FirebaseInstallations'], 'Firebase/Installations')

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    s.static_framework = false
  end
end
