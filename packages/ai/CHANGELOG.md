# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [25.0.1](https://github.com/invertase/react-native-firebase/compare/v25.0.0...v25.0.1) (2026-06-23)

**Note:** Version bump only for package @react-native-firebase/ai

## [25.0.0](https://github.com/invertase/react-native-firebase/compare/v24.0.0...v25.0.0) (2026-06-23)

### ⚠ BREAKING CHANGES

- **auth:** migrate to TypeScript and bring auth closer in alignment with firebase-js-sdk API (#8991)
- **app-check:** AppCheck has had all types moved to conform to firebase-js-sdk typescript types

Please see https://rnfirebase.io/migrating-to-v25 for help migrating if needed

react-native-firebase has a goal to be a drop-in replacement for firebase-js-sdk, with native extensions and performance. It has always worked that way at the javascript level but the typescript types have been divergent

We are fixing that as we refactor to typescript. Please bear with us as we get closer to our goal of react-native-firebase matching firebase-js-sdk both in functionality where possible, but also in exact typescript typing.

Specifics for AppCheck:

modular AppCheck now matches firebase-js-sdk (no instance methods); use modular functions like initializeAppCheck, getToken, getLimitedUseToken, setTokenAutoRefreshEnabled, onTokenChanged instead, matching firebase-js-sdk.
modular onTokenChanged callback result type changed from AppCheckListenerResult to AppCheckTokenResult
FirebaseApp is no longer exported from @react-native-firebase/app-check; import FirebaseApp from @react-native-firebase/app
modular type exports no longer include the old statics-based surface (e.g. AppCheckStatics), aligning closer to firebase-js-sdk
FirebaseAppCheckTypes is now a type-only export (no runtime export); update any value imports to import type
chore React-Native-Specific provider classes were moved into lib/providers.ts (exports updated)

### Features

- **ai:** add AnyOfSchema support ([e037945](https://github.com/invertase/react-native-firebase/commit/e037945822ef7302dfc7f9f02e084c77e075d1ec))
- **ai:** expose automatic function calling options ([152704d](https://github.com/invertase/react-native-firebase/commit/152704df1ae6fb83ede82636ebe3365fca3297cd))
- **ai:** expose LiveServerGoingAwayNotice ([211db68](https://github.com/invertase/react-native-firebase/commit/211db6868d555a539ae8a9b3c25cd241166f1d2b))
- **ai:** expose ObjectSchemaRequest ([6432f73](https://github.com/invertase/react-native-firebase/commit/6432f73a3b2d4166a232f3e6bfa0e3bde389fe2c))
- **ai:** expose TemplateChat APIs ([1096452](https://github.com/invertase/react-native-firebase/commit/10964520053c1432fba15d3ab538b9ebff313a58))
- **ai:** expose ThinkingLevel and ThinkingConfig.thinkingLevel ([a064c23](https://github.com/invertase/react-native-firebase/commit/a064c236bc8ed1030003ff7e5790f9cafc62927e))
- **ai:** expose UsageMetadata token details ([23d1095](https://github.com/invertase/react-native-firebase/commit/23d109585e9de8397f5ce3bf3aba9a20c052d1f8))
- **ai:** implement Firebase JS SDK 12.15.0 portable API parity ([7eb76f3](https://github.com/invertase/react-native-firebase/commit/7eb76f39d4fae31db3c68c281b403f84ac00809a))
- **ai:** support chat function auto-calling ([193df56](https://github.com/invertase/react-native-firebase/commit/193df56449e72d9a080e86b21eef3aadaaa4677b))
- **ai:** support FunctionResponse parts ([c2127a9](https://github.com/invertase/react-native-firebase/commit/c2127a9838b57dfcabd8548bd519774be44ee5f9))
- **ai:** support generateContent function auto-calling ([35d1794](https://github.com/invertase/react-native-firebase/commit/35d179495a7ad197ed6749ef75e6328e5ffb8f48))
- **ai:** support per-call request options ([163e8c0](https://github.com/invertase/react-native-firebase/commit/163e8c0d140e72d55d86bc5fdb785f1160ec49d7))
- **ai:** support responseJsonSchema generation config ([6b54462](https://github.com/invertase/react-native-firebase/commit/6b54462196e4d548b9bc4a8efb4144a1596377ac))
- **ai:** support streaming chat function auto-calling ([6d65d5f](https://github.com/invertase/react-native-firebase/commit/6d65d5f771010c8d87985ed3cd5b13f4e5ebf536))
- **ai:** support template chat function auto-calling ([7f31d9c](https://github.com/invertase/react-native-firebase/commit/7f31d9cf8a2fe40e399098677c041bcb4fcbbbb3))

### Code Refactoring

- **app-check:** match AppCheck type with firebase-js-sdk ([#8889](https://github.com/invertase/react-native-firebase/issues/8889)) ([71e8eb5](https://github.com/invertase/react-native-firebase/commit/71e8eb5773851846be3abe97632f7b6f60f68a6c))
- **auth:** migrate to TypeScript and bring auth closer in alignment with firebase-js-sdk API ([#8991](https://github.com/invertase/react-native-firebase/issues/8991)) ([7cf7c1a](https://github.com/invertase/react-native-firebase/commit/7cf7c1ac0d31d09ade581deb027d4ed8126bb7cf))

## [24.1.1](https://github.com/invertase/react-native-firebase/compare/v24.1.0...v24.1.1) (2026-06-10)

**Note:** Version bump only for package @react-native-firebase/ai

## [24.1.0](https://github.com/invertase/react-native-firebase/compare/v24.0.0...v24.1.0) (2026-06-05)

**Note:** Version bump only for package @react-native-firebase/ai

## [24.0.0](https://github.com/invertase/react-native-firebase/compare/v23.8.6...v24.0.0) (2026-04-01)

### ⚠ BREAKING CHANGES

- **firestore:** migrate to TypeScript and match firebase-js-sdk (#8892)

### Features

- **ai:** `CodeExecutionTool` types for allowing model to run code ([#8866](https://github.com/invertase/react-native-firebase/issues/8866)) ([81a0f19](https://github.com/invertase/react-native-firebase/commit/81a0f1910955a0295b6b308d5c08c17af0384b04))
- **ai:** `SearchEntryPoint` in grounding metadata responses ([#8894](https://github.com/invertase/react-native-firebase/issues/8894)) ([6a35bec](https://github.com/invertase/react-native-firebase/commit/6a35bec5a252bd1d080cce6e0353956a74b860cf))
- **ai:** `UrlContextTool` to inform responses from provided URLs ([#8893](https://github.com/invertase/react-native-firebase/issues/8893)) ([29cad20](https://github.com/invertase/react-native-firebase/commit/29cad202a1b9c08045d76f7b7ecf529fa3546c95))
- **firestore:** Support for Firestore pipelines API ([#8931](https://github.com/invertase/react-native-firebase/issues/8931)) ([54021c4](https://github.com/invertase/react-native-firebase/commit/54021c4af427abc3c8e224b546d68661aa1fc590))

### Bug Fixes

- **web:** avoid react-native-specific polyfills on the web ([e5685a0](https://github.com/invertase/react-native-firebase/commit/e5685a0beecff912a92f9c9cb3cb508a6b9d7ae2))

### Code Refactoring

- **firestore:** migrate to TypeScript and match firebase-js-sdk ([#8892](https://github.com/invertase/react-native-firebase/issues/8892)) ([dba7a2a](https://github.com/invertase/react-native-firebase/commit/dba7a2accd55e7d9146c9abf38e6f31965a53c17))

## [23.8.8](https://github.com/invertase/react-native-firebase/compare/v23.8.6...v23.8.8) (2026-03-12)

### Bug Fixes

- **web:** avoid react-native-specific polyfills on the web ([70ce925](https://github.com/invertase/react-native-firebase/commit/70ce925023872cf135a132f99adf80d7bc926296))

## [23.8.7](https://github.com/invertase/react-native-firebase/compare/v23.8.6...v23.8.7) (2026-03-12)

### Bug Fixes

- **web:** avoid react-native-specific polyfills on the web ([70ce925](https://github.com/invertase/react-native-firebase/commit/70ce925023872cf135a132f99adf80d7bc926296))

## [23.8.6](https://github.com/invertase/react-native-firebase/compare/v23.8.5...v23.8.6) (2026-02-03)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.8.5](https://github.com/invertase/react-native-firebase/compare/v23.8.4...v23.8.5) (2026-01-31)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.8.4](https://github.com/invertase/react-native-firebase/compare/v23.8.3...v23.8.4) (2026-01-24)

### Bug Fixes

- internal cross-module references to transpiled code must be dist not src ([b03db0a](https://github.com/invertase/react-native-firebase/commit/b03db0aa3fb748ee039826ccd9c7e73bc3c78f6f))
- transpile typescript to module only, not module and commonjs ([c1ba2a8](https://github.com/invertase/react-native-firebase/commit/c1ba2a8ae84b564679dec82253cea728b2a7aabe))

## [23.8.3](https://github.com/invertase/react-native-firebase/compare/v23.8.2...v23.8.3) (2026-01-16)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.8.2](https://github.com/invertase/react-native-firebase/compare/v23.8.1...v23.8.2) (2026-01-14)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.8.1](https://github.com/invertase/react-native-firebase/compare/v23.8.0...v23.8.1) (2026-01-13)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.8.0](https://github.com/invertase/react-native-firebase/compare/v23.7.0...v23.8.0) (2026-01-13)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.7.0](https://github.com/invertase/react-native-firebase/compare/v23.6.0...v23.7.0) (2025-12-08)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.6.0](https://github.com/invertase/react-native-firebase/compare/v23.5.0...v23.6.0) (2025-12-08)

### Features

- **ai:** firebase-js-sdk parity: template models and live API ([6572aa5](https://github.com/invertase/react-native-firebase/commit/6572aa5e06707ef47fad734b48c17da5d1ee943d))

## [23.5.0](https://github.com/invertase/react-native-firebase/compare/v23.4.1...v23.5.0) (2025-10-30)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.4.1](https://github.com/invertase/react-native-firebase/compare/v23.4.0...v23.4.1) (2025-10-14)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.4.0](https://github.com/invertase/react-native-firebase/compare/v23.3.1...v23.4.0) (2025-09-24)

### Features

- **ai:** feature parity for AI package with Web SDK ([2eaee5b](https://github.com/invertase/react-native-firebase/commit/2eaee5bf61745aa2806c7b023d963409a14b70c0))

## [23.3.1](https://github.com/invertase/react-native-firebase/compare/v23.3.0...v23.3.1) (2025-09-08)

**Note:** Version bump only for package @react-native-firebase/ai

## [23.3.0](https://github.com/invertase/react-native-firebase/compare/v23.2.2...v23.3.0) (2025-09-04)

### Features

- **firebase-ai:** Imagen model support ([fb364ed](https://github.com/invertase/react-native-firebase/commit/fb364ed0dfc7e38d9a84ecd4fb13e18b54fba995))

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
