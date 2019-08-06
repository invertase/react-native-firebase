require 'json'
require '../app/firebase_json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

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
  s.source_files        = 'ios/**/*.{h,m}'
  s.dependency          'RNFBApp'
  s.dependency          'React'
  s.dependency          'Firebase/Core', '~> 6.5.0'
  s.dependency          'Firebase/MLVision', '~> 6.5.0'

  if FirebaseJSON::Config.get_value_or_default('ml_vision_face_model', false)
    s.dependency          'Firebase/MLVisionFaceModel', '~> 6.5.0'
  end

  if FirebaseJSON::Config.get_value_or_default('ml_vision_ocr_model', false)
    s.dependency          'Firebase/MLVisionTextModel', '~> 6.5.0'
  end

  if FirebaseJSON::Config.get_value_or_default('ml_vision_barcode_model', false)
    s.dependency          'Firebase/MLVisionBarcodeModel', '~> 6.5.0'
  end

  if FirebaseJSON::Config.get_value_or_default('ml_vision_image_label_model', false)
    s.dependency          'Firebase/MLVisionLabelModel', '~> 6.5.0'
  end

  s.static_framework    = false
end
