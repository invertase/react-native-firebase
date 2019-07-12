require 'json'
require '../app/firebase_json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

FirebaseJSON::Config.get_value_or_default('crashlytics_ndk_enabled', false)


Pod::Spec.new do |s|
  s.name                = "RNFBMlNaturalLanguage"
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
  s.source_files        = 'RNFBMlNaturalLanguage/**/*.{h,m}'
  s.dependency          'RNFBApp'
  s.dependency          'React'
  s.dependency          'Firebase/Core', '~> 6.3.0'

  if FirebaseJSON::Config.get_value_or_default('ml_natural_language_language_id_model', false)
    s.dependency          'Firebase/MLNaturalLanguage', '~> 6.3.0'
    s.dependency          'Firebase/MLNLLanguageID', '~> 6.3.0'
  end

  # ignore until after v6 release, add support in a feature release
  # if FirebaseJSON::Config.get_value_or_default('ml_natural_language_translate_model', false)
  #  s.dependency          'Firebase/MLNLTranslate', '~> 6.3.0'
  # end

  if FirebaseJSON::Config.get_value_or_default('ml_natural_language_smart_reply_model', false)
    s.dependency          'Firebase/MLCommon', '~> 6.3.0'
    s.dependency          'Firebase/MLNLSmartReply', '~> 6.3.0'
  end

  s.static_framework    = true
end
