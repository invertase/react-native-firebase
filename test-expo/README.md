# test-expo

Expo Router example for React Native Firebase, with one route per included package.

This app does not run in Expo Go. It needs a development or prebuild build (`expo-dev-client` is already a dependency).

The committed `GoogleService-Info.plist` and `google-services.json` point at the `react-native-firebase-testing` project (the same one `tests/` uses), so live Firebase calls work out of the box. Replace them with files from your own Firebase project if you'd rather not share that one.

```bash
npx expo run:ios
npx expo run:android
```

Maintainers: the documented-path iOS link closer is `yarn test-expo:ios:link` from the repo root (build only).
