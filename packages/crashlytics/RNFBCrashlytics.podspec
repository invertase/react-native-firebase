require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

# Firebase SDK Override
firebase_sdk_version = '~> 6.13.0'

# Fabric SDK Override
fabric_sdk_version = '~> 1.10.2'

# Crashlytics SDK Override
crashlytics_sdk_version = '~> 3.14.0'

Pod::Spec.new do |s|
  s.name                = "RNFBCrashlytics"
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
  s.ios.deployment_target = "9.0"
  s.source_files        = 'ios/**/*.{h,m}'

  # React Native dependencies
  s.dependency          'React'
  s.dependency          'RNFBApp'

  if defined?($FirebaseSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
    firebase_sdk_version = $FirebaseSDKVersion
  end

  if defined?($CrashlyticsSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Crashlytics SDK version '#{$CrashlyticsSDKVersion}'"
    crashlytics_sdk_version = $CrashlyticsSDKVersion
  end

  if defined?($FabricSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Fabric SDK version '#{$FabricSDKVersion}'"
    fabric_sdk_version = $FabricSDKVersion
  end

  # Firebase dependencies
  s.dependency          'Fabric', fabric_sdk_version
  s.dependency          'Firebase/Core', firebase_sdk_version
  s.dependency          'Crashlytics', crashlytics_sdk_version

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    s.static_framework = false
  end

end
