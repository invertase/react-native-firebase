# test-expo

Expo Router example for React Native Firebase, with one route per included package.

This app does not run in Expo Go. It needs a development or prebuild build (`expo-dev-client` is already a dependency).

Replace the placeholder `GoogleService-Info.plist` and `google-services.json` with files from your Firebase project. The committed files are fake; Auth and other live Firebase calls fail until you replace them.

```bash
npx expo run:ios
npx expo run:android
```

Maintainers: the documented-path iOS link closer is `yarn test-expo:ios:link` from the repo root (build only).
