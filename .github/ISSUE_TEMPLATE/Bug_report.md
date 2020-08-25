---
name: "⚠️ Bug/Issue report - React Native"
about: Please provide as much detail as possible. Issues may be closed if they do
  not follow the template.
title: "[\U0001F41B] Bug Report Title - CHANGE ME "
labels: 'Help: Needs Triage, Impact: Bug'
assignees: ''

---

<!---
**Note <= v5 is deprecated, v5 issues are unlikely to get attention. Feel free to ask in discussions instead.**

Hello there you awesome person;

Please note that the issue list of this repo is exclusively for bug reports;

1) For feature requests, questions and general support please use [GitHub Discussions](https://github.com/invertase/react-native-firebase/discussions).
2) If this is a setup issue then please make sure you've correctly followed the setup guides, most setup issues such as 'duplicate dex files', 'default app has not been initialized' etc are all down to an incorrect setup as the guides haven't been correctly followed.
-->

<!-- NOTE: You can change any of the `[ ]` to `[x]` to mark an option(s) as selected -->

<!-- PLEASE DO NOT REMOVE ANY SECTIONS FROM THIS ISSUE TEMPLATE   -->
<!--   Leave them as they are even if they're irrelevant to your issue -->

## Issue

<!-- Please describe your issue here --^ and provide as much detail as you can. -->
<!-- Include code snippets that show your usages of the library in the context of your project. -->
<!-- Snippets that also show how and where the library is imported in JS are useful to debug issues relating to importing or methods not found issues -->

Describe your issue here

---

## Project Files

<!-- Provide the contents of key project files which will help to debug -->
<!--     For Example: -->
<!--        - iOS: `Podfile` contents. -->
<!--        - Android: `android/build.gradle` contents. -->
<!--        - Android: `android/app/build.gradle` contents. -->
<!--        - Android: `AndroidManifest.xml` contents. -->

<!-- ADD THE CONTENTS OF THE FILES IN THE PROVIDED CODE BLOCKS BELOW -->

### Javascript

<details><summary>Click To Expand</summary>
<p>

#### `package.json`:

```json
# N/A
```

#### `firebase.json` for react-native-firebase v6:

```json
# N/A
```

</details>

### iOS

<details><summary>Click To Expand</summary>
<p>

#### `ios/Podfile`:

- [ ] I'm not using Pods
- [x] I'm using Pods and my Podfile looks like:

```ruby
# N/A
```

#### `AppDelegate.m`:

```objc
// N/A
```

</p>
</details>

---

### Android

<details><summary>Click To Expand</summary>
<p>

#### Have you converted to AndroidX?

<!--- Mark any options that apply below -->

- [ ] my application is an AndroidX application?
- [ ] I am using `android/gradle.settings` `jetifier=true` for Android compatibility?
- [ ] I am using the NPM package `jetifier` for react-native compatibility?

#### `android/build.gradle`:

```groovy
// N/A
```

#### `android/app/build.gradle`:

```groovy
// N/A
```

#### `android/settings.gradle`:

```groovy
// N/A
```

#### `MainApplication.java`:

```java
// N/A
```

#### `AndroidManifest.xml`:

```xml
<!-- N/A -->
```

</p>
</details>

---

## Environment

<details><summary>Click To Expand</summary>
<p>

**`react-native info` output:**

<!-- Please run `react-native info` on your terminal and paste the contents into the code block below -->

```
 OUTPUT GOES HERE
```

<!-- change `[ ]` to `[x]` to select an option(s) -->

- **Platform that you're experiencing the issue on**:
  - [ ] iOS
  - [ ] Android
  - [ ] **iOS** but have not tested behavior on Android
  - [ ] **Android** but have not tested behavior on iOS
  - [ ] Both
- **`react-native-firebase` version you're using that has this issue:**
  - `e.g. 5.4.3`
- **`Firebase` module(s) you're using that has the issue:**
  - `e.g. Instance ID`
- **Are you using `TypeScript`?**
  - `Y/N` & `VERSION`

</p>
</details>

<!-- Thanks for reading this far down ❤️  -->
<!-- High quality, detailed issues are much easier to triage for maintainers -->

<!-- For bonus points, if you put a 🔥 (:fire:) emojii at the start of the issue title we'll know -->
<!-- that you took the time to fill this out correctly, or, at least read this far -->

---

- 👉 Check out [`React Native Firebase`](https://twitter.com/rnfirebase) and [`Invertase`](https://twitter.com/invertaseio) on Twitter for updates on the library.
