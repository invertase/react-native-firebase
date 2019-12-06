<p align="center">
  <a href="https://invertase.io">
    <img width="160px" src="https://static.invertase.io/assets/invertase-logo.png"><br/>
  </a>
  <h2 align="center">React Native Apple Authentication</h2>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@invertase/react-native-apple-authentication"><img src="https://img.shields.io/npm/dm/@invertase/react-native-apple-authentication.svg?style=flat-square" alt="NPM downloads"></a>
  <a href="https://www.npmjs.com/package/@invertase/react-native-apple-authentication"><img src="https://img.shields.io/npm/v/@invertase/react-native-apple-authentication.svg?style=flat-square" alt="NPM version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/npm/l/react-native-firebase.svg?style=flat-square" alt="License"></a>
</p>

<p align="center">
  <a href="https://invertase.link/discord"><img src="https://img.shields.io/discord/295953187817521152.svg?style=flat-square&colorA=7289da&label=Chat%20on%20Discord" alt="Chat on Discord"></a>
  <a href="https://twitter.com/invertaseio"><img src="https://img.shields.io/twitter/follow/invertaseio.svg?style=flat-square&colorA=1da1f2&colorB=&label=Follow%20on%20Twitter" alt="Follow on Twitter"></a>
</p>

----

A well typed React Native library providing support for Apple Authentication on iOS, including support for all `AppleButton` variants.

![apple-auth](https://static.invertase.io/assets/apple-auth.png)

## Prerequisites to using this library

The `@invertase/react-native-apple-authentication` library will not work if you do not ensure the following:

* You have setup react-native iOS development environment on your machine (Will only work on Mac). If not, please follow the official React Native documentation for getting  started: [React Native getting started documentation](https://facebook.github.io/react-native/docs/getting-started).

* You are using React Native version `0.60` or higher.

* You are using Xcode version `11` or higher. This will allow you to develop using iOS version `13`, the only version possible for authenticating with Apple.

* Once you're sure you've met the above, please follow the [Initial development environment setup](INITIAL_SETUP.md).


## Installation

```bash
yarn add @invertase/react-native-apple-authentication
```

This module supports React Native auto-linking.

## Documentation

> Documentation is still todo, PRs welcome, full api usage can be seen in the [example app](example/app.js)

### Types

#### Enumerations

* [AppleAuthCredentialState](docs/enums/_lib_index_d_.rnappleauth.appleauthcredentialstate.md)
* [AppleAuthError](docs/enums/_lib_index_d_.rnappleauth.appleautherror.md)
* [AppleAuthRealUserStatus](docs/enums/_lib_index_d_.rnappleauth.appleauthrealuserstatus.md)
* [AppleAuthRequestOperation](docs/enums/_lib_index_d_.rnappleauth.appleauthrequestoperation.md)
* [AppleAuthRequestScope](docs/enums/_lib_index_d_.rnappleauth.appleauthrequestscope.md)
* [AppleButtonStyle](docs/enums/_lib_index_d_.rnappleauth.applebuttonstyle.md)
* [AppleButtonType](docs/enums/_lib_index_d_.rnappleauth.applebuttontype.md)

#### Interfaces

* [AppleAuthRequestOptions](docs/interfaces/_lib_index_d_.rnappleauth.appleauthrequestoptions.md)
* [AppleAuthRequestResponse](docs/interfaces/_lib_index_d_.rnappleauth.appleauthrequestresponse.md)
* [AppleAuthRequestResponseFullName](docs/interfaces/_lib_index_d_.rnappleauth.appleauthrequestresponsefullname.md)
* [AppleButtonProps](docs/interfaces/_lib_index_d_.rnappleauth.applebuttonprops.md)
* [Module](docs/interfaces/_lib_index_d_.rnappleauth.module.md)


## License

- See [LICENSE](/LICENSE)

----

<p>
  <img align="left" width="75px" src="https://static.invertase.io/assets/invertase-logo-small.png">
  <p align="left">
    Built and maintained with 💛 by <a href="https://invertase.io">Invertase</a>.
  </p>
  <p align="left">
    <a href="https://invertase.io/hire-us">💼 Hire Us</a> |
    <a href="https://opencollective.com/react-native-firebase">☕️ Sponsor Us</a> |
    <a href="https://opencollective.com/jobs">‍💻 Work With Us</a>
  </p>
</p>

----
