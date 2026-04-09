require 'json'
require '../app/firebase_spm'
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
  s.name                = "RNFBAnalytics"
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
  s.swift_version       = '5.0'

  s.dependency          'RNFBApp'

  # React Native dependencies
  if defined?(install_modules_dependencies()) != nil
    install_modules_dependencies(s);
  else
    s.dependency "React-Core"
  end

  if defined?($FirebaseSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
    firebase_sdk_version = $FirebaseSDKVersion
  end

  # Firebase dependencies
  # Analytics has conditional dependencies that vary between SPM and CocoaPods.
  # SPM: use FirebaseAnalyticsWithoutAdIdSupport when $RNFirebaseAnalyticsWithoutAdIdSupport = true
  #      to avoid GoogleAppMeasurement APM symbols that require FirebaseRemoteConfig (linker error).
  # CocoaPods: IdentitySupport is a separate subspec controlled by $RNFirebaseAnalyticsWithoutAdIdSupport.
  if defined?(spm_dependency) && !defined?($RNFirebaseDisableSPM) &&
     defined?($RNFirebaseAnalyticsWithoutAdIdSupport) && $RNFirebaseAnalyticsWithoutAdIdSupport
    # FirebaseAnalyticsCore uses GoogleAppMeasurementCore (no IDFA, no APM objects).
    # FirebaseAnalytics uses GoogleAppMeasurement which has APMETaskManager/APMMeasurement
    # cross-references that cause linker errors when FirebasePerformance is not linked.
    Pod::UI.puts "#{s.name}: Using FirebaseAnalyticsCore SPM product (no IDFA, uses GoogleAppMeasurementCore)."
    firebase_dependency(s, firebase_sdk_version, ['FirebaseAnalyticsCore'], 'FirebaseAnalytics/Core')
  else
    firebase_dependency(s, firebase_sdk_version, ['FirebaseAnalytics'], 'FirebaseAnalytics/Core')
  end

  unless defined?(spm_dependency)
    # CocoaPods-only: conditional IdentitySupport subspec
    if defined?($RNFirebaseAnalyticsWithoutAdIdSupport) && ($RNFirebaseAnalyticsWithoutAdIdSupport == true)
      Pod::UI.puts "#{s.name}: Not installing FirebaseAnalytics/IdentitySupport Pod, no IDFA will be collected."
    else
      if !defined?($RNFirebaseAnalyticsWithoutAdIdSupport)
        Pod::UI.puts "#{s.name}: Using FirebaseAnalytics/IdentitySupport with Ad Ids. May require App Tracking Transparency. Not allowed for Kids apps."
        Pod::UI.puts "#{s.name}: You may set variable `$RNFirebaseAnalyticsWithoutAdIdSupport=true` in Podfile to use analytics without ad ids."
      end
      s.dependency          'FirebaseAnalytics/IdentitySupport', firebase_sdk_version
    end
  end

  # AdSupport framework (works with both SPM and CocoaPods)
  if defined?($RNFirebaseAnalyticsEnableAdSupport) && ($RNFirebaseAnalyticsEnableAdSupport == true)
    Pod::UI.puts "#{s.name}: Adding Apple AdSupport.framework dependency for optional analytics features"
    s.frameworks =       'AdSupport'
  end

  # GoogleAdsOnDeviceConversion (CocoaPods only, not available in firebase-ios-sdk SPM)
  if defined?($RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion) && ($RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion == true)
    Pod::UI.puts "#{s.name}: GoogleAdsOnDeviceConversion pod added"
    s.dependency          'GoogleAdsOnDeviceConversion'
  end

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    s.static_framework = false
  end
end
