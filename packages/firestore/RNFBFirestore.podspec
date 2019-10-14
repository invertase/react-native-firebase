require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

firebase_sdk_version = '~> 6.8.1'
using_custom_firebase_sdk_version = defined? $FirebaseSDKVersion
if using_custom_firebase_sdk_version
  Pod::UI.puts "RNFBDynamicLinks: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
  firebase_sdk_version = $FirebaseSDKVersion
end

Pod::Spec.new do |s|
  s.name                = "RNFBFirestore"
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
  s.dependency          'React'
  s.dependency          'Firebase/Core', firebase_sdk_version
  s.dependency          'Firebase/Firestore', firebase_sdk_version
  s.dependency          'RNFBApp'
  s.static_framework    = false
end
