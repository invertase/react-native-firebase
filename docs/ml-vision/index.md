---
title: ML Kit Vision
description: ML Kit Vision APIs lets you bring powerful machine learning vision APIs into your React Native app.
---

# ML Kit - Vision

Firebase ML Kit brings the power of machine learning vision to your React Native application, supporting both Android & iOS.

<Youtube id="ejrn_JHksws" />

ML Kit Vision for React Native currently supports the following Firebase APIs. APIs marked with ❌ will be support in a later release.

| API                                 | Cloud Model | On Device |
|-------------------------------------|-------------|-----------|
| [Text Recognition](https://firebase.google.com/docs/ml-kit/recognize-text)                    | ✅          | ✅        |
| [Document Text Recognition](https://firebase.google.com/docs/ml-kit/recognize-text))           | ✅          |           |
| [Face Detection](https://firebase.google.com/docs/ml-kit/detect-faces)                      |             | ✅        |
| [Barcode Scanning](https://firebase.google.com/docs/ml-kit/read-barcodes)                   |             | ✅        |
| [Image Labelling](https://firebase.google.com/docs/ml-kit/label-images)                     | ✅          | ✅        |
| [Landmark Recognition](https://firebase.google.com/docs/ml-kit/recognize-landmarks)                |             | ✅        |
| [AutoML Vision Edge](https://firebase.google.com/docs/ml-kit/automl-image-labeling)                  | ❌          | ❌        |
| [Object Detection/Tracking](https://firebase.google.com/docs/ml-kit/object-detection)           | ❌          | ❌        |
| Image Labelling (with [Custom Model]((https://firebase.google.com/docs/ml-kit/label-images))) | ❌          | ❌        |

## Getting Started

<Grid columns="3">
	<Block
		icon="build"
		color="#ffc107"
		title="Quick Start"
		to="/quick-start"
	>
    Install & start using the power of Machine Learning in your app.
	</Block>
	<Block
		icon="school"
		color="#4CAF50"
		title="Guides"
		version={false}
		to="/guides?tags=mlkit"
	>
	  Our guides
	</Block>
  <Block
		icon="layers"
		color="#03A9F4"
		title="Reference"
		to="/reference"
	>
    The API reference covers everything required to successfully integrate ML Kit Vision into your React Native app.
	</Block>
</Grid>

## Learn more

Our documentation is a great place to start, however if you're looking for more help or want to help others,
check out the resources below:

- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native-firebase-mlkit)
- [Github Issues](https://github.com/invertase/react-native-firebase/labels/Service%3A%20ML%20Vision)
- [Firebase Documentation](https://firebase.google.com/docs/ml-kit?utm_source=invertase&utm_medium=react-native-firebase&utm_campaign=mlkit)
