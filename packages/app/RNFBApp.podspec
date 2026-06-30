require 'json'
require './firebase_json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
firebase_sdk_version = package['sdkVersions']['ios']['firebase']
firebase_ios_target = package['sdkVersions']['ios']['iosTarget']
firebase_macos_target = package['sdkVersions']['ios']['macosTarget']
firebase_tvos_target = package['sdkVersions']['ios']['tvosTarget']

Pod::Spec.new do |s|
  s.name                = "RNFBApp"
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
  s.cocoapods_version   = '>= 1.12.0'
  s.source_files        = "ios/**/*.{h,m,mm,cpp}"
  s.private_header_files = "ios/**/*.h"
  s.exclude_files       = 'ios/generated/RCTThirdPartyComponentsProvider.*', 'ios/generated/RCTAppDependencyProvider.*', 'ios/generated/RCTModuleProviders.*', 'ios/generated/RCTModulesConformingToProtocolsProvider.*', 'ios/generated/RCTUnstableModulesRequiringMainQueueSetupProvider.*'

  # Fail fast for old architecture users, but safely in case the variable goes away
  # completely in future react-native versions
  if defined?(ENV["RCT_NEW_ARCH_ENABLED"]) != nil && (ENV["RCT_NEW_ARCH_ENABLED"] == '0')
     raise "#{s.name} requires New Architecture. Enable New Architecture to use this module"
  end

  # App must define modules for static framework integration of other packages to work
  s.pod_target_xcconfig = {
    "DEFINES_MODULE" => "YES",
  }

  # React Native dependencies
  if defined?(install_modules_dependencies()) != nil
    install_modules_dependencies(s);
  else
    s.dependency "React-Core"
  end

  if (ENV.include?('FIREBASE_SDK_VERSION'))
    Pod::UI.puts "#{s.name}: Found Firebase SDK version in environment '#{ENV['FIREBASE_SDK_VERSION']}'"
    $FirebaseSDKVersion = ENV['FIREBASE_SDK_VERSION']
  end

  if defined?($FirebaseSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
    firebase_sdk_version = $FirebaseSDKVersion
  end

  # Firebase dependencies
  s.dependency          'Firebase/CoreOnly', firebase_sdk_version

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    s.static_framework = false
  end
end
