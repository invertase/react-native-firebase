# Introduction

This document is an attempt to write down all the steps in the release process for the v5 branch.

## Testing

- Make sure android and ios e2e tests work locally. If you aren't sure it works locally, it isn't ready.
- Make sure full CI runs complete successfully

## Documentation

- Make sure there is an entry in docs for the new release: <https://github.com/invertase/react-native-firebase-docs/tree/v5.x.x/docs/releases>
- Traditionally the new minor versions get a new page (e.g. v5.4.x.md)

## SDK Version numbers

1. Update and commit the firebase registration version numbers to match the next version number
   - iOS here: <https://github.com/invertase/react-native-firebase/blob/v5.x.x/ios/RNFirebase/RNFirebase.m#L20>
   - Android here: <https://github.com/invertase/react-native-firebase/blob/v5.x.x/android/src/main/java/io/invertase/firebase/ReactNativeFirebaseAppRegistrar.java#L36>

## Package and Deploy

1. Create git tag and alter package.json with `npm version 5.x.x` (e.g. `npm version 5.4.3`)
1. Publish with `npm publish`
1. Commit changes with `git add -A && git commit -a`
1. Push changes back to repo with `git push --follow-tags upstream` (substitute your remote ref for `upstream` if the main repository has a different reference name in your local repo)
1. For new minor versions make an entry github releases page pointing to the new v5.5.x (or v5.6.x etc) releases page on rnfirebase.io

## Release notification

1. Discord announcement: Invertase OSS > React Native Firebase > Announcements (use `@here` in the announcement to notify anyone watching the channel)
1. twitter?
1. anyone else?
