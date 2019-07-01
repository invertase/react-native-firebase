---
title: iOS Setup
description: Manually integrate Crashlytics into your iOS application. 
---

# iOS Setup
> The following steps are only required if your environment does not have access to React Native
auto-linking. 

## Update Podfile

```ruby{9-10}
# Uncomment the next line to define a global platform for your project
# platform :ios, '9.0'

target 'MyProject' do
# Comment the next line if you're not using Swift and don't want to use dynamic frameworks
use_frameworks!

# Pods for PodTest
pod 'Fabric', {{ ios.fabric.tools }}'
pod 'Crashlytics', '~> {{ ios.firebase.crashlytics }}'

end
```

## Run pod install
```
pod install
```

or you might need to update the pod repo also if it fails
```
pod install --repo-update
```


