require 'json'
package = JSON.parse(File.read('package.json'))

Pod::Spec.new do |s|
  s.name                = "RNFirebase"
  s.version             = package["version"]
  s.summary             = package["description"]
  s.description         = <<-DESC
                            Integrate firebase into your app using the React Native SDKs.
                          DESC
  s.homepage            = "http://invertase.io"
  s.license             = package['license']
  s.author              = "Mike Diarmid"
  s.source              = { :git => "https://github.com/invertase/react-native-firebase.git", :tag => "v#{s.version}" }
  s.social_media_url    = 'http://twitter.com/mikediarmid'
  s.platform            = :ios, "8.0"
  s.preserve_paths      = 'README.md', 'package.json', '*.js'
  s.source_files        = 'ios/RNFirebase/**/*.{h,m}'
  s.dependency          'React'
end
