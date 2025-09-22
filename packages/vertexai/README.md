<p align="center">
  <a href="https://rnfirebase.io">
    <img width="160px" src="https://i.imgur.com/JIyBtKW.png"><br/>
  </a>
  <h2 align="center">React Native Firebase - Vertex AI ⚠️ **DEPRECATED** ⚠️</h2>
</p>

---

Vertex AI has been deprecated by Google in favor of the Firebase AI Logic SDK.

Using the Firebase AI Logic SDK with the Vertex AI Gemini API is still generally available (GA).

To start using the new SDK, import the `@react-native-firebase/ai` package and use the modular method `getAI()` to initialize. See details in the [migration guide](https://firebase.google.com/docs/vertex-ai/migrate-to-latest-sdk).

```javascript
// BEFORE - using firebase/vertexai
import { initializeApp } from "firebase/app";
import { getVertexAI, getGenerativeModel } from "firebase/vertexai"; // Remove this

// AFTER - using firebase/ai
import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel } from "firebase/ai"; // Add this
```

---

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase-logo-small.png">
  <p align="left">
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
</p>

---
