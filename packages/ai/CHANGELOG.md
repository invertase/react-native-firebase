# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## Feature

Initial release of the Firebase AI Logic SDK (`FirebaseAI`). This SDK *replaces* the previous Vertex AI in Firebase SDK (`FirebaseVertexAI`) to accommodate the evolving set of supported features and services.
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
