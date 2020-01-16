---
title: Quick Start
description: Using Instance ID in your React Native application.
---

# Instance ID Quick Start

## Installation

This module depends on the `@react-native-firebase/app` module. To get started and install `app`,
visit the project's <Anchor version={false} group={false} href="/quick-start">quick start</Anchor> guide.

Install this module with Yarn:

```bash
yarn add @react-native-firebase/iid

# Using iOS
cd ios/ && pod install
```

> Integrating manually and not via React Native auto-linking? Check the setup instructions for <Anchor version group href="/android">Android</Anchor>. iOS requires no additional steps.

## Module usage

Import the Instance ID package into your project:

```js
import iid from '@react-native-firebase/iid';
```

The package also provides access to the firebase instance:

```js
import { firebase } from '@react-native-firebase/perf';
```

### Retrieving the instance token

To retrieve the current instance ID, call the `get` method:

```js
import iid from '@react-native-firebase/iid';

async function getInstanceId() {
  const id = await iid().get();
  console.log('Current Instance ID: ', id);
}
```
