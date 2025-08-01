---
title: Migrating to v23
description: Migrate to React Native Firebase v23.
previous: /migrate-to-v22
next: /typescript
---

⚠️ **REMOVED** ⚠️

# Firebase Dynamic Links has been Removed

This package has been deprecated and removed from the React Native Firebase repository.

## Why was it deprecated?

Firebase Dynamic Links has been deprecated by Google and will be shut down on August 25th, 2025. For more information about the deprecation and migration options, please visit:

**[Firebase Dynamic Links Deprecation FAQ](https://firebase.google.com/support/dynamic-links-faq)**

## Migration Options

The deprecation FAQ provides detailed guidance on how to migrate from Firebase Dynamic Links, including:

- **Full feature parity**: Use alternative deep-linking service providers
- **Simple deep-linking**: Migrate to App Links and Universal Links. [See Firebase documentation](https://firebase.google.com/support/guides/app-links-universal-links).
- **No replacement needed**: Remove the package entirely

## Timeline

- **August 25th, 2025**: Firebase Dynamic Links service will be completely shut down
- All existing links will stop working
- All APIs will return error responses

Please refer to the official deprecation FAQ for complete migration guidance and support.

# Android Platform

- Android `minSdk` has been bumped from `21` to `23` (except Auth which already had a `minSdk` of `23`).
- Auth play services has been bumped from `21.3.0` to `21.4.0`.
- Crashlytics gradle plugin has been bumped from `3.0.4` to `3.0.5`.
- Performance gradle plugin has been bumped from `1.4.2` to `2.0.0`.
- App distribution gradle plugin has been bumped from `5.1.1` to `5.1.2`.
