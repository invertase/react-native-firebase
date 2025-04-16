# React Native Firebase Example App

## Setup

1. Follow the steps in the [test README](../README.md) up to and including step one (i.e. `Requirements`, `Cleaning dependencies` and `Install test project dependencies`).

2. Choose which example app to run in the [index file](./index.js) by commenting out the apps you don't want to use.

3. In your terminal, run the following to start the test app bundler:
```bash
yarn example:app:bundler
```

4. For vertexAI example, we have enforced Firebase App Check so the APIs will fail, and you will have to update the relevant service files (i.e. `../ios/GoogleService-Info.plist` and `../android/app/google-services.json`) for your Firebase project.

## Run and build app for android

Open a new terminal and run:

```bash
yarn example:app:run:android
```

## Run and build app for iOS

Open a new terminal and run:

```bash
yarn example:app:run:ios
```
