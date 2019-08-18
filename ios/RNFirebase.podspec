require 'json'
package = JSON.parse(File.read('../package.json'))

Pod::Spec.new do |s|
  s.name                = "RNFirebase"
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
  s.platform            = :ios, "9.0"
  s.default_subspecs    = 'Core'
  s.subspec 'Core' do |cs|
    cs.source_files = 'RNFirebase/**/*.{h,m}'
    cs.exclude_files = 'RNFirebase/fabric/**/*.{h,m}'

    cs.dependency 'React'
    cs.dependency 'Firebase/Core'
  end
  s.subspec 'Crashlytics' do |cs|
    cs.source_files = 'RNFirebase/fabric/**/*.{h,m}'

    cs.dependency 'Fabric'
    cs.dependency 'Crashlytics'
  end
  # allow this package to be used with use_frameworks!
  s.static_framework = true
end
