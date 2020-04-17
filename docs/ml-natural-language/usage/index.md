---
title: ML Natural Language
description: Installation and getting started with ML Natural Language.
icon: //static.invertase.io/assets/firebase/ml-kit.svg
next: /ml-vision/usage
previous: /in-app-messaging/usage
---

# Installation

This module requires that the `@react-native-firebase/app` module is already setup and installed. To install the "app" module, view the
[Getting Started](/) documentation.

```bash
# Install & setup the app module
yarn add @react-native-firebase/app

# Install the ml-natural-language module
yarn add @react-native-firebase/ml-natural-language

# If you're developing your app using iOS, run this command
cd ios/ && pod install
```

If you're using an older version of React Native without autolinking support, or wish to integrate into an existing project,
you can follow the manual installation steps for [iOS](/ml-natural-language/usage/installation/ios) and [Android](/ml-natural-language/usage/installation/android).

# What does it do

The React Native Firebase ML Natural Language module supports [Smart Replies](https://firebase.google.com/docs/ml-kit/generate-smart-replies)
& [Language Identification](https://firebase.google.com/docs/ml-kit/identify-languages) provided by Firebase ML kit.
At this moment, the [Translation](https://firebase.google.com/docs/ml-kit/translation) module is not supported

<Youtube id="ejrn_JHksws" />

Smart reply can automatically generate relevant replies to messages. It helps your users respond to messages quickly,
and makes it easier to reply to messages on devices with limited input capabilities.

Language identification can be used to determine the language of a string of text. It can be useful when working with
user-provided text, which often doesn't come with any language information.

# Usage

Each services requires enabling before it can be used within your app. The sections below show how to enable the models
for each service and usage examples of each.

## Smart Replies

The [Smart Replies](https://firebase.google.com/docs/ml-kit/generate-smart-replies) service from Firebase allows you to
generate suggested replies based on a list of on-going conversation data.

Before using the API, the Smart Reply model must be installed on your device. To enable installation of the model, set
the `ml_natural_language_smart_reply_model` to `true` in your `firebase.json` file:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "ml_natural_language_smart_reply_model": true
  }
}
```

Once added, rebuild your application:

```bash
// For Android
npx react-native run-ios

// For iOS
cd ios/ && pod install
npx react-native run-ios
```

Once complete, the `suggestReplies` method allows you to generate potential replies by providing it with an array of text input(s)
which may generate three responses per input as example below:

```jsx
const replies = await firebase
  .naturalLanguage()
  .suggestReplies([
    { text: 'Hey, long time no speak!' },
    { text: 'I know right, it has been a while..', userId: '123', isLocalUser: false },
    { text: 'We should catchup some time!' },
    { text: 'Definitely, how about we go for lunch this week?', userId: '123', isLocalUser: false },
  ]);

replies.forEach(reply => {
  console.log(reply.text);
});
```

Each array item an is an instance of a [`TextMessage`](/reference/ml-natural-language/textmessage). At a minimum you
must provide the a `text` property. To help the Machine Learning service identify various users in the conversation, you
can set the `isLocalUser` flag to `false` if the message is from an external user, along with a unique ID.

Once returned, if the service is able to generate suggested replies you can iterate over the response to extract the `text`
property from the returned [`SuggestedReply`](/reference/ml-natural-language/suggestedreply) instance.

## Identify language

The [Language Identification](https://firebase.google.com/docs/ml-kit/identify-languages) service from Firebase allows you to
identify a language from any given string of text.

Before using the API, the Language Identification model must be installed on your device. To enable installation of the model, set
the `ml_natural_language_language_id_model` to `true` in your `firebase.json` file:

```json
// <project-root>/firebase.json
{
  "react-native": {
    "ml_natural_language_language_id_model": true
  }
}
```

Once added, rebuild your application:

```bash
// For Android
npx react-native run-ios

// For iOS
cd ios/ && pod install
npx react-native run-ios
```

The `identifyLanguage` method allows then allows you to identify a language, for example:

```jsx
const language = await firebase.naturalLanguage().identifyLanguage('Hello there. General Kenobi.');

console.log('Identified language: ', language); // en
```

# firebase.json

Add any of the keys indicated below to your `firebase.json` file at the root of your project directory, and set them to
true to enable them. All models and APIs are disabled (false) by default.

> If you are manually linking on iOS (e.g. not using CocoaPods) then it's up to you to manage these models and dependencies
> yourself - firebase.json support is only for Android and iOS (via Pods).

```json
// <project-root>/firebase.json
{
  "react-native": {
    // Language Identification
    "ml_natural_language_language_id_model": true,
    // Smart Replies
    "ml_natural_language_smart_reply_model": true
  }
}
```
