---
title: iOS Setup
description: Additional iOS steps for Crashlytics integration.
---

# iOS Setup

## Additional Installation Steps

### Add the Crashlytics run script

Crashlytics for iOS requires an additional manual step once the NPM package has been installed.
You'll need XCode for the following steps.

Open your project in XCode, and select the project file in the Navigator. Select the 'Build Phases' tab &
add a 'New Run Script Phase':

![Run Script](https://prismic-io.s3.amazonaws.com/invertase%2F96f32c96-0aca-4054-bf30-bd2448ca2462_new+project.png)

In the new build phase, add a new script into the text box:

```
"${PODS_ROOT}/Fabric/run"
```

![Script](https://prismic-io.s3.amazonaws.com/invertase%2Ff06cf5b3-884e-4cbc-8c3d-81072a254f1d_new+project+%281%29.png)

Once added, rebuild your project:

```bash
npx react-native run-ios
```
