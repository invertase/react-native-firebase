require 'json'
require '../app/firebase_json'
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
  s.name                = "RNFBML"
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
  s.source_files        = 'ios/**/*.{h,m}'

  s.dependency          'RNFBApp'

  # React Native dependencies
  if defined?(install_modules_dependencies()) != nil
    install_modules_dependencies(s);
  else
    s.dependency "React-Core"
  end

  # Wire up prebuilt React-Core (RN 0.83+, default on 0.84+) so the legacy
  # <React/...> header imports resolve when RCT_USE_PREBUILT_RNCORE=1.
  if defined?(add_rncore_dependency)
    add_rncore_dependency(s)
  end

  # RNFB public headers re-export non-modular <React/...> imports. Required so
  # the framework module validates when consumers build with use_frameworks!.
  s.pod_target_xcconfig = {
    "CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES" => "YES",
  }

  if defined?($FirebaseSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
    firebase_sdk_version = $FirebaseSDKVersion
  end

  # Firebase dependencies
  # s.dependency          'Firebase/MLModelDownloader', firebase_sdk_version

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    # raise "#{s.name}: Underlying Firebase/MLModelDownloader requires $RNFirebaseAsStaticFrameworks = true and !use_frameworks in your Podfile"
    s.static_framework = false
  end
end
