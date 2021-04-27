require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
appPackage = JSON.parse(File.read(File.join('..', 'app', 'package.json')))

coreVersionDetected = appPackage['version']
coreVersionRequired = package['peerDependencies'][appPackage['name']]
firebase_sdk_version = appPackage['sdkVersions']['ios']['firebase']
if coreVersionDetected != coreVersionRequired
  Pod::UI.warn "NPM package '#{package['name']}' depends on '#{appPackage['name']}' v#{coreVersionRequired} but found v#{coreVersionDetected}, this might cause build issues or runtime crashes."
end

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
  s.ios.deployment_target = "10.0"
  s.source_files        = 'ios/**/*.{h,m}'

  # React Native dependencies
  s.dependency          'React-Core'
  s.dependency          'RNFBApp'

  if defined?($FirebaseSDKVersion)
    Pod::UI.puts "#{s.name}: Using user specified Firebase SDK version '#{$FirebaseSDKVersion}'"
    firebase_sdk_version = $FirebaseSDKVersion
  end

  # Firebase dependencies
  if defined?($RNFirebaseAnalyticsWithoutAdIdSupport)
    Pod::UI.puts "#{s.name}: Using Firebase/AnalyticsWithoutAdIdSupport pod in place of default Firebase/Analytics"

    # Releasing as non-breaking change as it is optional but it raises minimum requirements, validate just in case
    if (Gem::Version.new(firebase_sdk_version) < Gem::Version.new("7.11.0"))
      raise "Firebase/AnalyticsWithoutAdIdSupport requires firebase-ios-sdk 7.11.0 or greater."
    end

    s.dependency          'Firebase/AnalyticsWithoutAdIdSupport', firebase_sdk_version
  else
    Pod::UI.puts "#{s.name}: Using default Firebase/Analytics with Ad Ids. May require App Tracking Transparency. Not allowed for Kids apps."
    Pod::UI.puts "#{s.name}: You may set variable `$RNFirebaseAnalyticsWithoutAdIdSupport=true` in Podfile to use analytics without ad ids."
    s.dependency          'Firebase/Analytics', firebase_sdk_version
  end

  if defined?($RNFirebaseAsStaticFramework)
    Pod::UI.puts "#{s.name}: Using overridden static_framework value of '#{$RNFirebaseAsStaticFramework}'"
    s.static_framework = $RNFirebaseAsStaticFramework
  else
    s.static_framework = false
  end
end
