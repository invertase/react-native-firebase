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

Pod::Spec.new do |s|
  s.name                = "RNFBMessaging"
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
  s.public_header_files = [
    'ios/RNFBMessaging/RNFBMessagingModule.h',
  ]
  s.private_header_files = [
    'ios/RNFBMessaging/RNFBMessaging+*.h',
    'ios/RNFBMessaging/RNFBMessagingSerializer.h',
    'ios/generated/**/*.h',
  ]
  s.exclude_files       = 'ios/generated/RCTThirdPartyComponentsProvider.*', 'ios/generated/RCTAppDependencyProvider.*', 'ios/generated/RCTModuleProviders.*', 'ios/generated/RCTModulesConformingToProtocolsProvider.*', 'ios/generated/RCTUnstableModulesRequiringMainQueueSetupProvider.*'

  s.pod_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/ios/generated/RNFBMessagingTurboModules" "$(PODS_TARGET_SRCROOT)/ios/generated"',
    "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES" => "YES",
  }

  s.dependency          'RNFBApp'

  install_modules_dependencies(s);

  if defined?(ENV["RCT_NEW_ARCH_ENABLED"]) != nil && (ENV["RCT_NEW_ARCH_ENABLED"] == '0')
     raise "#{s.name} requires New Architecture. Enable New Architecture to use this module"
  end

  if defined?($FirebaseSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
    firebase_sdk_version = $FirebaseSDKVersion
  end

  # Firebase dependencies
  # FirebaseCoreExtension is a transitive dependency of FirebaseMessaging in SPM,
  # so it only needs to be declared explicitly for CocoaPods.
  firebase_dependency(s, firebase_sdk_version,
    ['FirebaseMessaging'],
    ['Firebase/Messaging', 'FirebaseCoreExtension']
  )

  # SPM: fix for #9322 -- see the matching comment in RNFBAnalytics.podspec
  # for the full writeup, including what's actually confirmed vs. still an
  # open question about *why* Xcode's SPM integration behaves this way.
  # RNFBMessaging needs the same explicit top-level declaration for Xcode to
  # share a single dynamic framework per product instead of privately
  # duplicating GULNetwork/GULReachabilityChecker/GULSwizzler into
  # RNFBMessaging.framework too.
  if defined?(spm_dependency) && !rnfirebase_spm_disabled?
    # 8.1.3 floor matches the GoogleUtilities version firebase-ios-sdk 12.x
    # resolves transitively; bump this alongside firebase_sdk_version if
    # firebase-ios-sdk ever moves to GoogleUtilities 9.x.
    spm_dependency(s,
      url: 'https://github.com/google/GoogleUtilities.git',
      requirement: { kind: 'upToNextMajorVersion', minimumVersion: '8.1.3' },
      products: ['GULNetwork', 'GULReachability', 'GULMethodSwizzler']
    )
  end

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    s.static_framework = false
  end
end
