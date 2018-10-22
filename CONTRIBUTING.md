# Introduction

First, thank you for considering contributing to react-native-firebase! It's people like you that make the open source community such a great community! 😊

We welcome any type of contribution, not just code. You can help with;

- **QA**: file bug reports, the more details you can give the better (e.g. platform versions, screenshots sdk versions & logs)
- **Docs**: improve reference coverage, add more examples, fix typos or anything else you can spot. At the top of every page on our docs site you can click the `Edit` pencil to go to that pages markdown file, or view the [Docs Repo](https://github.com/invertase/react-native-firebase-docs) directly
- **Marketing**: writing blog posts, howto's, ...
- **Community**: presenting the project at meetups, organizing a dedicated meetup for the local community, ...
- **Code**: take a look at the [open issues](issues). Even if you can't write code, commenting on them, showing that you care about a given issue matters.
- **Donations**: we welcome financial contributions in full transparency on our [open collective](https://opencollective.com/react-native-firebase).

---

## Project Guidelines

As the creators and maintainers of this project, we want to ensure that the project lives and continues to grow. Not blocked by any singular person's time.

One of the simplest ways of doing this is by encouraging a larger set of shallow contributors. Through this we hope to mitigate the problems of a project that needs updates but there is no-one who has the power to do so.

### Ownership

If you get a merged Pull Request, regardless of content (typos, code, doc fixes), then you'll most likely receive push access to this repository. This is checked for on pull request merges and an invite is sent to you via GitHub.

Offhand, it is easy to imagine that this would make code quality suffer, but in reality it offers fresh perspectives to the codebase and encourages ownership from people who are depending on the project. If you are building a project that relies on this codebase, then you probably have the skills to improve it and offer valuable feedback.

Everyone comes in with their own perspective on what a project could/should look like, and encouraging discussion can help expose good ideas sooner.

### Why do we give out push access?

It can be overwhelming to be offered the chance to wipe the source code for a project.

Do not worry, we do not let you push directly to master or any of the version (e.g. v4.x.x) branches, these branches are protected by the review process. We have the convention that someone other than the submitter should merge non-trivial pull requests.

As an organization contributor, you can merge other people's pull requests, or other contributors can merge yours. You will not be assigned a pull request, but you are welcome to jump in and take a code review on topics that interest you - just let others know you're picking up something by tagging in on an existing issue or creating a new one and assigning it to yourself.

This project is **not** continuously deployed, this leaves space for debate after review and offering everyone the chance to revert, or make an amending pull request. If it feels right and follows the guidelines, then merge.

### How can we help you get comfortable contributing?

It is normal for a first pull request to be a potential fix for a problem but moving on from there to helping the project's direction can be difficult.

We try to help contributors cross that barrier by offering good first step issues (labelled `good-first-issue`). These issues can be fixed without feeling like you are stepping on toes. Ideally, these are non-critical issues that are well defined. They will be purposely avoided by mature contributors to the project, to make space for others.

Additionally issues labelled `needs-triage` or `help-wanted` can also be picked up, these may not necessarily require code changes but rather help with debugging and finding the cause of the issue whether it's a bug or an users incorrect setup of the library or project.

We aim to keep all project discussion inside GitHub issues. This is to make sure valuable discussion is accessible via search. If you have questions about how to use the library, or how the project is running - GitHub issues are the goto tool for this project.

### What if you only know how to develop for one platform?

This is normal don't worry - not everyone can develop native code for Obj-C and Java, we understand that.

Although we won't merge Pull Requests unless they support all applicable platforms, we do however recommend that you still submit a PR
for the Platform that you do know and then label it as either `ios-help-wanted` or `android-help-wanted` (or post a comment requesting it to be labelled).
This will allow other contributors to help add the missing platform support by making changes to your existing PR.

### Our expectations on you as a contributor

To quote [@alloy](https://github.com/alloy) from [this issue](https://github.com/Moya/Moya/issues/135):

> Do not ever feel bad for not contributing to open source.

We want contributors to provide ideas, keep the ship shipping and to take some of the load from others. It is non-obligatory; we’re here to get things done in an enjoyable way. :trophy:

The fact that you will have push access will allow you to:

- Avoid having to fork the project if you want to submit other pull requests as you will be able to create branches directly on the project.
- Help triage issues and merge pull requests.
- Pick up the project if other maintainers move their focus elsewhere.

It is up to you to use those superpowers or not though 😉

We ask though that you follow the conduct guidelines set out in our [Code of Conduct](/CODE_OF_CONDUCT.md) throughout your contribution journey.

### What about if you have problems that cannot be discussed in a public issue?

You can reach out to us directly via Discord direct messages or Twitter if you'd like to discuss something privately, alternatively you can also email us at oss@invertase.io

#### Project Owners

- [Salakar](https://github.com/Salakar)
  - Twitter: [@mikediarmid](https://twitter.com/mikediarmid)
  - Discord: `Salakar#1337`
- [Ehesp](https://github.com/Ehesp)

  - Twitter: [@elliothesp](https://twitter.com/elliothesp)
  - Discord: `Alias#3980`

---

## Code Guidelines

### Your First Contribution

Working on your first Pull Request? You can learn how from this _free_ series, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

### Implementation Guidelines

- Ensure any new JS implementations match the official Firebase JS SDK implementation
  - This includes matching up with the same method names, types, usages, inputs and outputs
  - In some instances this is not always possible e.g. a Firebase Module that does not exist in the Web SDK, such as `crashlytics()` or the implementation can't work (or not performant) in the React Native environment, such as `storage().putString()`
- Methods/Features that are specific to a single platform only should be namespaced as such in your implementation
  - For example when implementing an iOS **only** method:
    - [❌] `firebase.crashlytics().someNewMethodForIos()`
    - [✅] `firebase.crashlytics().ios.someNewMethod()`
  - If a method works on both platforms then there's no need to namespace it
- Name your native code methods the same as the JS method name
  - e.g. the Android (`@ReactMethod`) implementation of `firebase.auth().signInWithEmailAndPassword()` is named `signInWithEmailAndPassword`

### Testing Code

The project has a detox powered `e2e` testing app located in `/tests`. See it's local testing guide [here](https://github.com/invertase/react-native-firebase/blob/master/tests/README.md).

### Submitting code for review

Any code changes that are ready to be merged for release should be submitted as a pull request to the relevant branch, for upcoming / in-development releases this branch would be the `master` branch, for historic/old releases (e.g. patching a bug on an older version) this would be the versions parked branch e.g. `v4.x.x`.

The bigger the pull request, the longer it will take to review and merge. Try to break down large pull requests in smaller chunks that are easier to review and merge. It is also always helpful to have some context for your pull request. What was the purpose? Why does it matter to you? Tag in any linked issues.

To aid review we also ask that you fill out the PR template as much as possible.

> Please include `[WIP]` at the start of your pull request title if the pull request is not yet complete.

### Code review process

Pull Requests to the protected branches require two or more peer-review approvals and passing status checks to be able to be merged.

When reviewing a Pull Request please check the following:

- Does the PR provide cross-platform support?
  - i.e. adding a new feature then does the implementation provide iOS and Android support.
  - Pull Requests should not be merged or approved unless both platforms are supported (unless the feature is specific to one platform only)
- Pull Request is not still tagged as `WIP` if it's ready to be merged/reviewed
- Pull Request follows the Firebase Web SDKs API/implementation
  - In some instances this is not always possible e.g. Firebase Module does not exist in the Web SDK, such as `crashlytics()` or the implementation can't work (or not performant) in the React Native environment, such as `storage().putString()`
- Types
  - Have flow types been added?
  - Have Typescript types been added?
- Does the PR provide docs (e.g. links to a separate docs PR on the docs repo)
- Have `e2e` tests been updated or new tests been added to test newly implemented or changed functionality.
- Does the PR provide valid change log entries

### [No Brown M&M's](http://en.wikipedia.org/wiki/Van_Halen#Contract_riders)

If you made it all the way to the end, bravo dear user, we love you. You can include the 🔥 emoji at the bottom of your ticket to signal to us that you did in fact read this file and are trying to conform to it as best as possible: `:fire:`.
