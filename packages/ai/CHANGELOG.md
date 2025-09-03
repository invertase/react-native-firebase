# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [23.2.2](https://github.com/invertase/react-native-firebase/compare/v23.2.1...v23.2.2) (2025-09-03)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.2.1](https://github.com/invertase/react-native-firebase/compare/v23.2.0...v23.2.1) (2025-09-01)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.2.0](https://github.com/invertase/react-native-firebase/compare/v23.1.2...v23.2.0) (2025-08-29)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.1.2](https://github.com/invertase/react-native-firebase/compare/v23.1.1...v23.1.2) (2025-08-25)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.1.1](https://github.com/invertase/react-native-firebase/compare/v23.1.0...v23.1.1) (2025-08-22)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.1.0](https://github.com/invertase/react-native-firebase/compare/v23.0.1...v23.1.0) (2025-08-19)

### Features

- **ai:** create `ai` package, `vertexai` wraps around it ([#8555](https://github.com/invertase/react-native-firebase/issues/8555)) ([50c9e0d](https://github.com/invertase/react-native-firebase/commit/50c9e0d8a361b575c6cbf86f028165906d819162))

## Feature

Initial release of the Firebase AI Logic SDK (`FirebaseAI`). This SDK _replaces_ the previous Vertex AI in Firebase SDK (`FirebaseVertexAI`) to accommodate the evolving set of supported features and services.
The new Firebase AI Logic SDK provides **preview** support for the Gemini Developer API, including its free tier offering.
Using the Firebase AI Logic SDK with the Vertex AI Gemini API is still generally available (GA).

To start using the new SDK, import the `@react-native-firebase/ai` package and use the modular method `getAI()` to initialize. See details in the [migration guide](https://firebase.google.com/docs/vertex-ai/migrate-to-latest-sdk).

Please update the following to move from VertexAI to FirebaseAI:

```js
// BEFORE - using firebase/vertexai
import { initializeApp } from "firebase/app";
~~import { getVertexAI, getGenerativeModel } from "firebase/vertexai";~~


// AFTER - using firebase/ai
import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel } from "firebase/ai";
```
