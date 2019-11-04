---
title: Quick Start
description: Getting started with Messaging in React Native Firebase
---

# Messaging Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/messaging

# Using iOS
cd ios/ && pod install
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor> & <Anchor version group href="/ios">iOS</Anchor>.

## Module usage

Import the Messaging package into your project:

```js
import messaging from '@react-native-firebase/messaging';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/messaging';
```

### TODO
