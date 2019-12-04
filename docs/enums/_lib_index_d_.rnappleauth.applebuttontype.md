
# Enumeration: AppleButtonType

THe Apple Button type to render, this controls the button text.

## Index

### Enumeration members

* [CONTINUE](_lib_index_d_.rnappleauth.applebuttontype.md#continue)
* [DEFAULT](_lib_index_d_.rnappleauth.applebuttontype.md#default)
* [SIGN_IN](_lib_index_d_.rnappleauth.applebuttontype.md#sign_in)
* [SIGN_UP](_lib_index_d_.rnappleauth.applebuttontype.md#sign_up)

## Enumeration members

###  CONTINUE

• **CONTINUE**: = "Continue"

*Defined in [lib/index.d.ts:61](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L61)*

Renders the button with 'Continue with Apple'.

___

###  DEFAULT

• **DEFAULT**: = "SignIn"

*Defined in [lib/index.d.ts:51](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L51)*

The default button, the same as `SIGN_IN`.

___

###  SIGN_IN

• **SIGN_IN**: = "SignIn"

*Defined in [lib/index.d.ts:56](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L56)*

Renders the button with 'Sign in with Apple'.

___

###  SIGN_UP

• **SIGN_UP**: = "SignUp"

*Defined in [lib/index.d.ts:68](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L68)*

Renders the button with 'Sign up with Apple'.

> Note: This only works on iOS 13.2+. To check if the current device supports this, use the
provided `isSignUpButtonSupported` flag from the AppleAuth module.
