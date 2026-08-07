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
  s.name                = "RNFBDatabase"
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
  s.source_files        = 'ios/**/*.{h,m,mm,cpp}'
  s.private_header_files = [
    'ios/RNFBDatabase/RNFBDatabaseModule.h',
    'ios/RNFBDatabase/RNFBDatabaseReferenceModule.h',
    'ios/RNFBDatabase/RNFBDatabaseQueryModule.h',
    'ios/RNFBDatabase/RNFBDatabaseOnDisconnectModule.h',
    'ios/RNFBDatabase/RNFBDatabaseTransactionModule.h',
    'ios/generated/**/*.h',
  ]
  s.exclude_files       = 'ios/generated/RCTThirdPartyComponentsProvider.*', 'ios/generated/RCTAppDependencyProvider.*', 'ios/generated/RCTModuleProviders.*', 'ios/generated/RCTModulesConformingToProtocolsProvider.*', 'ios/generated/RCTUnstableModulesRequiringMainQueueSetupProvider.*'

  s.pod_target_xcconfig = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)/ios/generated/RNFBDatabaseTurboModules\" \"$(PODS_TARGET_SRCROOT)/ios/generated\"",
  }

  s.dependency          'RNFBApp'

  install_modules_dependencies(s);

  # RN 0.83+ (default on 0.84+) ships a prebuilt React-Core (RCT_USE_PREBUILT_RNCORE=1).
  # Wire it up so the legacy <React/...> header imports resolve against the prebuilt
  # framework. Guarded for older react-native versions where the helper is absent.
  if defined?(add_rncore_dependency)
    add_rncore_dependency(s)
  end

  # RNFB's Objective-C sources import <React/...> headers non-modularly. When a consumer
  # builds with use_frameworks! (Expo's default, and required by the firebase-ios-sdk),
  # RNFB is compiled as a framework module and Clang rejects those imports with
  # -Wnon-modular-include-in-framework-module ("must be imported from module 'React'").
  # Allow them so the framework module validates. Merge so any existing config is kept.
  s.pod_target_xcconfig = (s.to_hash["pod_target_xcconfig"] || {}).merge({
    "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES" => "YES",
  })

  if defined?(ENV["RCT_NEW_ARCH_ENABLED"]) != nil && (ENV["RCT_NEW_ARCH_ENABLED"] == '0')
     raise "#{s.name} requires New Architecture. Enable New Architecture to use this module"
  end

  if defined?($FirebaseSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
    firebase_sdk_version = $FirebaseSDKVersion
  end

  # Firebase dependencies
  firebase_dependency(s, firebase_sdk_version, ['FirebaseDatabase'], 'Firebase/Database')

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    s.static_framework = false
  end
end
