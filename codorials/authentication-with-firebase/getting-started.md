# Getting Started

Welcome to the 'Authentication with Firebase' Codorial using the [react-native-firebase](https://rnfirebase.io) library.
The various steps of the Codorial will cover how to setup your application to require both email/password login and social login using Facebook,
 to handling the users authenticated state using the popular [redux](https://redux.js.org/introduction) library whilst also considering integrate routing
 using [react-navigation](https://reactnavigation.org/).

## Prerequisites

This Codorial assumes you know the basics of the following topics:

- ES6 JavaScript.
- Starting your app using an emulator on Android/iOS.
- Understand how to setup a new Firebase project.
- Debugging with React Native.
- Managing your project using Android Stuido and/or XCode.
- Installation of the [react-native-firebase](https://rnfirebase.io) library (see "Creating a base project" below).

This Codorial was created with React Native version `0.53.0`.

## Creating a base project

This project will take a bare bones React Native setup and explain every step required to implement a solid authentication flow in your application.
To start we need a base project to work from.

Both options below require you to setup a new Firebase project and add the configuration file to your project - check out the [documentation](https://rnfirebase.io/docs/v3.2.x/installation/initial-setup) on how to do that if needed.

### Option 1: Using `react-native init`

You can quickly create a base React Native project using `react-native init` by following the React Native [documentation](http://facebook.github.io/react-native/docs/getting-started.html).

> Ensure you follow the "Building Projects with Native Code" tab, as the project won't work using Expo due to requiring native modules.

Once installed, you need to install the [react-native-firebase](https://rnfirebase.io/docs/v3.2.x/installation/initial-setup) library. Ensure you've
also installed the Authentication module on your platform ([Android](https://rnfirebase.io/docs/v3.2.x/auth/android) or [iOS](https://rnfirebase.io/docs/v3.2.x/auth/ios))!

### Option 2: Using [react-native-firebase-starter](https://github.com/invertase/react-native-firebase-starter)

A starter kit has been created to help you get up and running with minimal setup needed. If you're new to React Native this will be perfect starting point.

> Keep in mind every Firebase module is installed in this starter kit. You can refer to the react-native-firebase [documentation](https://rnfirebase.io/docs) if you want to remove
any unwanted modules.

