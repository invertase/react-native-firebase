<p align="center">
  <a href="https://invertase.io/oss/react-native-firebase">
    <img width="160px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h2 align="center">React Native Firebase - ML Kit Vision</h2>
</p>

<p align="center">
  <a href="https://api.rnfirebase.io/coverage/ml-vision/detail"><img src="https://api.rnfirebase.io/coverage/ml-vision/badge?style=flat-square" alt="Coverage"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/ml-vision"><img src="https://img.shields.io/npm/dm/@react-native-firebase/ml-vision.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/@react-native-firebase/ml-vision"><img src="https://img.shields.io/npm/v/@react-native-firebase/ml-vision.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square" alt="License"></a>
  <a href="https://lerna.js.org/"><img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=flat-square" alt="Maintained with Lerna"></a>
</p>

<p align="center">
  <a href="https://invertase.link/discord"><img src="https://img.shields.io/discord/295953187817521152.svg?style=flat-square&colorA=7289da&label=Chat%20on%20Discord" alt="Chat on Discord"></a>
  <a href="https://twitter.com/rnfirebase"><img src="https://img.shields.io/twitter/follow/rnfirebase.svg?style=flat-square&colorA=1da1f2&colorB=&label=Follow%20on%20Twitter" alt="Follow on Twitter"></a>
</p>

---

> This is for the upcoming v6.0.0 release of React Native Firebase, please use the [react-native-firebase](https://www.npmjs.com/package/react-native-firebase) package instead, unless you're early adopting/testing the new packages - in which case please use the `latest` tagged patch-only release for this package.

Bring powerful machine learning vision APIs to your mobile app whether you're new or experienced in ML. Get started easily by using ready-to-use APIs from Firebase for common mobile use cases, or import your own custom models which can be hosted and served to your apps by Firebase. ML Kit APIs can run on-device or in the cloud, depending on the functionality, and some give you both choices.

This module currently supports the following Firebase ML Kit Vision APIs:

- [Text Recognition](https://firebase.google.com/docs/ml-kit/recognize-text)
  - [x] Cloud
  - [x] On Device
- [Document Text Recognition](https://firebase.google.com/docs/ml-kit/recognize-text)
  - [x] Cloud
- [Face Detection](https://firebase.google.com/docs/ml-kit/detect-faces)
  - [x] On Device
- [Barcode Detection](https://firebase.google.com/docs/ml-kit/read-barcodes)
  - [x] On Device
- [Image Labelling](https://firebase.google.com/docs/ml-kit/label-images)
  - [x] Cloud
  - [x] On Device
- [Landmark Recognition](https://firebase.google.com/docs/ml-kit/recognize-landmarks)
  - [x] Cloud

The following APIs are **unsupported**, with support coming in a future release;

- AutoML Vision Edge
- Object detection & tracking
- Image Labeling with a custom model

[> Learn More](https://firebase.google.com/products/ml-kit/)

## Installation

Requires `@react-native-firebase/app` to be installed.

```bash
yarn add @react-native-firebase/ml-vision
react-native link @react-native-firebase/ml-vision
```

## Documentation

- [Guides](https://invertase.io/oss/react-native-firebase/guides?tags=ml-vision)
- [Installation](https://invertase.io/oss/react-native-firebase/v6/ml-vision)
- [Reference](https://invertase.io/oss/react-native-firebase/v6/ml-vision/reference)

## License

- See [LICENSE](/LICENSE)

---

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase-logo-small.png"> 
  <p align="left">  
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
  <p align="left">  
    <a href="https://invertase.io/hire-us">💼 Hire Us</a> | 
    <a href="https://opencollective.com/react-native-firebase">☕️ Sponsor Us</a> | 
    <a href="https://opencollective.com/jobs">‍💻 Work With Us</a>
  </p>
</p>

---
