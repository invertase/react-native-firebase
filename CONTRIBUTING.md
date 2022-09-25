# Introduction

First, thank you for considering contributing to React Native Firebase! It's people like you that make the open source community such a great community! 😊

We welcome any type of contribution, not just code. You can help with;

- **QA**: file bug reports, the more details you can give the better (e.g. platform versions, screenshots SDK versions & logs)
- **Docs**: improve reference coverage, add more examples, fix typos or anything else you can spot.
  - At the top of every page on our docs site you can click the `Edit Page` button to go to that pages markdown file or TypeScript definition file, or view the [documents](https://github.com/invertase/react-native-firebase/tree/main/docs) directly
- **Community**: presenting the project at meetups, organizing a dedicated meetup for the local community, ...
- **Code**: take a look at the [open issues](issues). Even if you can't write code, commenting on them, showing that you care about a given issue matters.

---

## Project Guidelines

### How can we help you get comfortable contributing?

It is normal for a first pull request to be a potential fix for a problem but moving on from there to helping the project's direction can be difficult.

We try to help contributors cross that barrier by offering good first step issues (labeled `good-first-issue`). These issues can be fixed without feeling like you are stepping on toes. Ideally, these are non-critical issues that are well defined. They will be purposely avoided by mature contributors to the project, to make space for others.

Additionally issues labeled with the `Help:` prefix can also be picked up, these may not necessarily require code changes but rather help with debugging and finding the cause of the issue whether it's a bug or a users incorrect setup of the library or project.

We aim to keep all project discussion inside GitHub issues. This is to make sure valuable discussion is accessible via search. If you have questions about how to use the library, or how the project is running - GitHub issues are the go-to tool for this project.

### What if you only know how to develop for one platform?

This is normal don't worry - not everyone can develop native code for Obj-C and Java, we understand that.

Although we won't merge Pull Requests unless they support all applicable platforms, we do however recommend that you still submit a PR
for the Platform that you do know and then label it as either `Help: iOS` or `Help: Android` (or post a comment requesting it to be labeled).
This will allow other contributors to help add the missing platform support by making changes to your existing PR.

### Our expectations on you as a contributor

To quote [@alloy](https://github.com/alloy) from [this issue](https://github.com/Moya/Moya/issues/135):

> Do not ever feel bad for not contributing to open source.

We want contributors to provide ideas, keep the ship shipping and to take some of the load from others. It is non-obligatory; we’re here to get things done in an enjoyable way. :trophy:

We do ask though that you follow the conduct guidelines set out in our [Code of Conduct](/CODE_OF_CONDUCT.md) throughout your contribution journey.

### What about if you have problems that cannot be discussed in a public issue?

You can reach out to us directly via Discord direct messages or Twitter if you'd like to discuss something privately, alternatively you can also email us at `oss[at]invertase.io`

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

Working on your first Pull Request? You can learn how from this _free_ series, [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

### Implementation Guidelines

- Ensure any new JS implementations mirror the official Firebase JS SDK implementation.
  - This includes matching up with the same method names, types, usages, inputs and outputs.
  - In some instances this is not always possible.
- Methods/Features that are specific to a single platform only should be documented as such and the types description `@platform` annotated;
  ```ts
  export SomeInterface {
    /**
     * A cool method.
     *
     * @platform ios iOS
     */
    aCoolMethod(): Promize<null>;
  }
  ```
  - If a method works on both platforms then there's no need to annotate it
- Name your native code methods the same as the JS method name
  - e.g. the Android (`@ReactMethod`) implementation of `firebase.auth().signInWithEmailAndPassword()` is named `signInWithEmailAndPassword`

---

## Local Setup

To get started locally the following steps are required:

### Step 1: Clone the repository

```bash
git clone https://github.com/invertase/react-native-firebase.git
cd react-native-firebase
```

### Step 2: Install test project dependencies

```bash
yarn
yarn tests:ios:pod:install
brew tap wix/brew
brew install applesimutils xbeautify
```

> Note that this project is a mono-repo, so you only need to install NPM dependencies once at the root of the project with `yarn`.

## Testing Code

### Jest Testing

The project supports JS only testing through Jest. The following package scripts are exported to help you run tests;

- `yarn tests:jest` - run Jest tests once and exit.
- `yarn tests:jest-watch` - run Jest tests in interactive mode and watch for changes.
- `yarn tests:jest-coverage` - run Jest tests with coverage. Coverage is output to `./coverage`.

### End-to-end Testing

The project has a Detox powered end-to-end testing app located in `/tests`.

To run end-to-end tests for `Android`, please run:

- `yarn tests:android:build` - builds `Android` test application.
- `yarn tests:packager:jet-reset-cache` - runs JavaScript bundler.
- `yarn tests:emulator:start` - runs Firestore emulator for Firestore tests.
- `yarn tests:android:test` - runs tests using Detox library. Tests for each package can be found in the `e2e` directory (i.e. `[PACKAGE]/e2e/*.e2e.js`)

To run end-to-end tests for `iOS`, please run:

- `yarn tests:ios:build` - builds `iOS` test application.
- `yarn tests:packager:jet-reset-cache` - runs JavaScript bundler.
- `yarn tests:emulator:start` - runs Firestore emulator for Firestore tests.
- `yarn tests:ios:test` - runs tests using Detox library. Tests for each package can be found in the `e2e` directory (i.e. `[PACKAGE]/e2e/*.e2e.js`)

See it's local testing guide [here](https://github.com/invertase/react-native-firebase/blob/main/tests/README.md) to get started
with `e2e` testing this project.

---

## Submitting code for review

All code changes should be submitted as a pull request to the main branch.

The bigger the pull request, the longer it will take to review and merge. Try to break down large pull requests in smaller chunks that are easier to review and merge. It is also always helpful to have some context for your pull request. What was the purpose? Why does it matter to you? Tag in any linked issues.

To aid review we also ask that you fill out the PR template as much as possible.

> Please use draft pull requests if the pull request is not yet complete.

### Your PR title

We use the [Conventional Commits](https://www.conventionalcommits.org/) format throughout the project. Your Pull Request title should be
in this format; however your commits themselves do not need to follow this format as all PRs are eventually squash merged.

#### Examples

- `docs(analytics): added extra example for logEvent`
- `tests(perf): should throw invalid arg error`
- `fix(firestore,android): fixed NPE crash`
- `feat(functions): add support for function timeouts`

See the [Conventional Commits](https://www.conventionalcommits.org/) specification for more information.

### Code review process

Pull Requests to main require two or more peer-review approvals and passing status checks before they can be merged.

Reviews of Pull Requests are based on the following acceptance critical:

- Does the PR provide cross-platform support?
  - i.e. if adding a new feature then does the implementation provide iOS and Android support.
  - Pull Requests should not be merged unless both platforms are supported (unless the feature is specific to one platform only)
- Pull Request follows the Firebase Web SDKs API/implementation.
  - In some instances this is not always possible.
- If APIs have changed;
  - Has the documentation been updated?
  - Have the TypeScript types been added?
- Have the tests been updated or new tests been added to test newly implemented or changed functionality.
  - E2E tests.
  - Other tests through Jest.
- Do all CI checks pass.

Once a PR is merged into main; new versions of the changed packages are automatically created and published to NPM.

## [No Brown M&M's](http://en.wikipedia.org/wiki/Van_Halen#Contract_riders)

If you made it all the way to the end, bravo dear user, we love you. You can include the 🔥 emoji at the bottom of your issue or PR to signal to us that you did in fact read this file and are trying to conform to it as best as possible: `:fire:`.
