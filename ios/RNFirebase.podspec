require 'json'
package = JSON.parse(File.read('../package.json'))

Pod::Spec.new do |s|
  s.name                = "RNFirebase"
  s.version             = package["version"]
  s.summary             = package["description"]
  s.description         = <<-DESC
                            A well tested feature rich Firebase implementation for React Native, supporting iOS & Android.
                          DESC
  s.homepage            = "http://invertase.io/react-native-firebase"
  s.license             = package['license']
  s.authors             = "Invertase Limited"
  s.source              = { :git => "https://github.com/invertase/react-native-firebase.git", :tag => "v#{s.version}" }
  s.social_media_url    = 'http://twitter.com/RNFirebase'
  s.platform            = :ios, "9.0"
  s.source_files        = 'RNFirebase/**/*.{h,m}'
  s.dependency          'React'
end
