---
title: Migrating to v23
description: Migrate to React Native Firebase v23.
previous: /migrate-to-v22
next: /typescript
---

# Firebase App

- `gaMeasurementId` property from `FirebaseOptions` has been replaced with `measurementId` to match Firebase web JS SDK.

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

# iOS platform

- Minimum iOS deployment target has now been bumped to `15` from `13`.
- Minimum Xcode version required for iOS development is now Xcode `16.2`, previous was Xcode `15.2`.
- `gaMeasurementId` property from `FirebaseOptions` (now `measurementId` in React Native Firebase) has been removed from firebase-ios-sdk as it wasn't used.
