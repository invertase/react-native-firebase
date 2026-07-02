require 'json'
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
  s.exclude_files       = 'ios/generated/RCTThirdPartyComponentsProvider.*', 'ios/generated/RCTAppDependencyProvider.*', 'ios/generated/RCTModuleProviders.*', 'ios/generated/RCTModulesConformingToProtocolsProvider.*', 'ios/generated/RCTUnstableModulesRequiringMainQueueSetupProvider.*'

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
  s.dependency          'Firebase/Messaging', firebase_sdk_version
  s.dependency          'FirebaseCoreExtension'

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    s.static_framework = false
  end
end
