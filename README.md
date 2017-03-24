# React Native Firebase<img align="left" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgzIiBoZWlnaHQ9IjE5NyIgdmlld0JveD0iMCAwIDE4MyAxOTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRpdGxlPlNsaWNlIDE8L3RpdGxlPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZmlsbD0iI0Y0QTkzRiIgZD0iTTgwLjk1IDc2bDE5LjIwMiAzMy40NS0yNC4yNDMtLjg3MnoiLz48cGF0aCBmaWxsPSIjRjRBODNFIiBkPSJNOTAuMTYgODIuNGwxNC4yMzQgMjcuMDUtMjkuMDkxLS44NzJ6Ii8+PHBhdGggZmlsbD0iI0U4ODYzNCIgZD0iTTg3LjQ4OSA4Ny4wMzhMOTkuOTQgMTA5LjQ1bC0yNC4zMzQtLjI0M3oiLz48cGF0aCBmaWxsPSIjRjhDQTUxIiBkPSJNMTAwLjU0NiA4NC43NThsMy44NDggMjQuNjkyTDc1IDEwOS4xNTN6Ii8+PHBhdGggZmlsbD0iI0Y4Q0E1MSIgZD0iTTkwLjE2IDExN2wxNC41NTUtNy44NDdMNzUgMTA4Ljg3NXoiLz48cGF0aCBkPSJNMS4wMDggOThDMS42NDMgMTE4LjcxMiA0MS42OSAxMzUgOTEgMTM1di04LjAwMkM1MS4zMDkgMTI2LjggOS42NzUgMTE0LjY0MiA5LjAwOCA5OGgtOHoiIGZpbGw9IiNFODg2MzQiLz48cGF0aCBkPSJNMTM1LjUyMyAyMS43ODJDMTE3LjI3IDExLjk3NiA4My4xNCAzOC41MTUgNTguNDg0IDgxLjIxOGw2LjkzIDQuMDAxYzIwLjAxNi0zNC4yNzUgNTEuMzY0LTY0LjI1MiA2Ni4xMS01Ni41MDhsNC02LjkyOXoiIGZpbGw9IiNGOUNCNTIiLz48cGF0aCBkPSJNMS4wMDggOThDMS42NDMgNzcuMjg4IDQxLjY5IDYxIDkxIDYxdjguMDAyQzUxLjMwOSA2OS4yIDkuNjc1IDgxLjM1OCA5LjAwOCA5OGgtOHoiIGZpbGw9IiNFODg2MzQiLz48cGF0aCBkPSJNNDYuMDQzIDIwYy0xNy42MiAxMC45MDYtMTEuNzAyIDUzLjczMiAxMi45NTMgOTYuNDM2bDYuOTMtNC4wMDJDNDYuMjUxIDc3Ljk2MyAzNS45NjQgMzUuODI3IDUwLjA0MyAyNi45M2wtNC02LjkyOXoiIGZpbGw9IiNGNEE3M0UiLz48cGF0aCBkPSJNNDYuMDQzIDE3Ni40MzZDMjguNDIzIDE2NS41MyAzNC4zNCAxMjIuNzAzIDU4Ljk5NiA4MGw2LjkzIDQuMDAxYy0xOS42NzUgMzQuNDcyLTI5Ljk2MiA3Ni42MDgtMTUuODgzIDg1LjUwNmwtNCA2LjkyOXoiIGZpbGw9IiNGOUNCNTIiLz48cGF0aCBkPSJNNDUgMjAuNWMxOC4yNTUtOS44MDYgNTIuMzg0IDE2LjczMiA3Ny4wNCA1OS40MzZsLTYuOTMxIDRDOTUuMDkzIDQ5LjY2MiA2My43NDYgMTkuNjg3IDQ5IDI3LjQzTDQ1IDIwLjV6IiBmaWxsPSIjRjRBNzNFIi8+PHBhdGggZD0iTTE4MSA5OGMtLjYzNS0yMC43MTItNDAuNjgzLTM3LTg5Ljk5Mi0zN3Y4LjAwMkMxMzAuNjk4IDY5LjIgMTcyLjMzMyA4MS4zNTggMTczIDk4aDh6IiBmaWxsPSIjRTg4NjM0Ii8+PHBhdGggZD0iTTQ1LjI0MSAxNzYuNTAxYy4xMDcuMDY1LjIxNC4xMjkuMzIyLjE5MSAxOC4xNDMgMTAuNDc1IDUyLjYyMy0xNi4xNDYgNzcuNDc2LTU5LjE5MmwtNi44OTItNC4wNjdjLTIwLjE3NSAzNC41OC01MS45IDY0LjgwOC02Ni41MDIgNTYuMzc4YTEwLjExIDEwLjExIDAgMCAxLS40MzctLjI2N0w0NS4yNCAxNzYuNXoiIGZpbGw9IiNGOUNCNTIiLz48cGF0aCBkPSJNMTM2LjAzNiAxNzUuOTM4QzExNy43OCAxODUuNzM4IDgzLjY1MyAxNTkuMiA1OSAxMTYuNWwtLjI2LS40NSA2LjgzNi00LjE2YzE5Ljk4NCAzNC41MDMgNTEuNTg1IDY0Ljg2MyA2Ni40MzEgNTcuMTM0bDQuMDI5IDYuOTE0eiIgZmlsbD0iI0Y0QTczRSIvPjxwYXRoIGQ9Ik0xODEgOTdjLjAwNS4xNjYuMDA4LjMzMy4wMDguNSAwIDIwLjk1LTQwLjI5NSAzNy41LTkwIDM3LjV2LTguMDAyYzQwLjAxMi0uMTk4IDgyLTEyLjU1NCA4Mi0yOS40MDMgMC0uMi0uMDA2LS4zOTgtLjAxOC0uNTk1SDE4MXoiIGZpbGw9IiNFODg2MzQiLz48cGF0aCBkPSJNMTM1LjAwNSAxNzYuNDNjMTcuNjA5LTEwLjkxNSAxMS42ODgtNTMuNzM0LTEyLjk2Mi05Ni40M2wtLjQ0LS43Ni03LjAyMiAzLjgzNS4wNDcuMDgyYzE5Ljk1MiAzNC41NTggMzAuNTIgNzcuMjE0IDE2LjQ1IDg2LjI5OGwzLjkyNyA2Ljk3NXoiIGZpbGw9IiNGNEE3M0UiLz48cGF0aCBkPSJNMTM1LjQ4IDIxLjI4MmMxNy42MiAxMC45MDYgMTEuNzAyIDUzLjczMy0xMi45NTMgOTYuNDM2bC02LjkzLTQuMDAxYzE5LjY3Ni0zNC40NzIgMjkuOTYyLTc2LjYwOCAxNS44ODMtODUuNTA2bDQtNi45Mjl6IiBmaWxsPSIjRjlDQjUyIi8+PC9nPjwvc3ZnPg==g">

[![Gitter](https://badges.gitter.im/invertase/react-native-firebase.svg)](https://gitter.im/invertase/react-native-firebase?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![npm version](https://img.shields.io/npm/v/react-native-firebase.svg)](https://www.npmjs.com/package/react-native-firebase)
[![License](https://img.shields.io/npm/l/react-native-firebase.svg)](/LICENSE)

**RNFirebase** makes using [Firebase](http://firebase.com) with React Native simple.
<hr>

### Install
```
npm i react-native-firebase --save
```

#### Platform specific setup guides:
[![ios](https://a.fsdn.com/sd/topics/ios_64.png)](docs/installation.ios.md)   [![android](https://a.fsdn.com/sd/topics/android_64.png)](docs/installation.android.md)

<hr>

### Why

RNFirebase is a _light-weight_ layer sitting on-top of the native Firebase libraries for both iOS and Android which mirrors the Firebase Web SDK as closely as possible.

Although the [Firebase Web SDK](https://www.npmjs.com/package/firebase) library will work with React Native, it is mainly built for the web.

RNFirebase provides a JavaScript bridge to the native Firebase SDKs for both iOS and Android. Firebase will run on the native thread, allowing the rest of your app to run on the [JS thread](https://facebook.github.io/react-native/docs/performance.html#javascript-frame-rate). The Firebase Web SDK also runs on the JS thread, therefore potentially affecting the frame rate causing jank with animations, touch events etc. All in all, RNFirebase provides much faster performance (~2x) over the web SDK.

The native SDKs also allow us to hook into device sdk's which are not possible with the web SDK, for example crash reporting, offline realtime database support, analyics and more!

<hr>

### Test app

To help ensure changes and features work across both iOS & Android, we've developed an app specifically to test `react-native-firebase` against the [`firebase` web SDK](https://www.npmjs.com/package/firebase). Please see the [`react-native-firebase-tests`](https://github.com/invertase/react-native-firebase-tests) repository for more information.

<hr>

### Examples app

There's currently a work in progress [examples app](https://github.com/invertase/react-native-firebase-examples) which aims to demonstrate various real world use-case scenarios with React Native & Firebase. We welcome any new examples or updates to existing ones.

<hr>

### Documentation

RNFirebase aims to replicate the Firebase Web SDK as closely as possible. Because of this, the documentation focuses around the installation, differences & best practices of this library. Please see the [Firebase Web SDK](https://firebase.google.com/docs/reference/js/) documentation for Firebase functionality.

> If you find any discrepancies between the two libraries, please raise an issue or PR.

* [Firebase Setup](docs/firebase-setup.md)
* API
  * [Authentication](docs/api/authentication.md)
  * [Realtime Database](docs/api/database.md)
  * [Analytics](docs/api/analytics.md)
  * [Storage](docs/api/storage.md)
  * [Messaging](docs/api/cloud-messaging.md)
  * [Crash](docs/api/crash.md)

<hr>

### Contributing

We welcome any contribution to the repository. Please ensure your changes to the JavaScript code follow the styling guides controlled by ESlint. Changes to native code should be kept clean and follow the standard of existing code.

Changes to existing code should ensure all relevant tests on the test app pass. Any new features should have new tests created and ensure all existing tests pass.

**Project board:** https://github.com/invertase/react-native-firebase/projects

<hr>

### License

- MIT
