require 'json'
require '../../app/firebase_json'
package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

firebase_sdk_version = firebase_sdk_version
using_custom_firebase_sdk_version = defined? $FirebaseSDKVersion
if using_custom_firebase_sdk_version
  Pod::UI.puts "RNFBMLVision: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
  firebase_sdk_version = $FirebaseSDKVersion
end

Pod::Spec.new do |s|
  s.name                = "RNFBMLVision"
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
  s.source_files        = '**/*.{h,m}'
  s.dependency          'RNFBApp'
  s.dependency          'React'
  s.dependency          'Firebase/Core', firebase_sdk_version
  s.dependency          'Firebase/MLVision', firebase_sdk_version

  if FirebaseJSON::Config.get_value_or_default('ml_vision_face_model', false)
    s.dependency          'Firebase/MLVisionFaceModel', firebase_sdk_version
  end

  if FirebaseJSON::Config.get_value_or_default('ml_vision_ocr_model', false)
    s.dependency          'Firebase/MLVisionTextModel', firebase_sdk_version
  end

  if FirebaseJSON::Config.get_value_or_default('ml_vision_barcode_model', false)
    s.dependency          'Firebase/MLVisionBarcodeModel', firebase_sdk_version
  end

  if FirebaseJSON::Config.get_value_or_default('ml_vision_image_label_model', false)
    s.dependency          'Firebase/MLVisionLabelModel', firebase_sdk_version
  end

  s.static_framework    = false
end
