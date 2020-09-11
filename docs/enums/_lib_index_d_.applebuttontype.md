
# Enumeration: AppleButtonType

The Apple Button type to render, this controls the button text.

## Index

### Enumeration members

* [CONTINUE](_lib_index_d_.applebuttontype.md#continue)
* [DEFAULT](_lib_index_d_.applebuttontype.md#default)
* [SIGN_IN](_lib_index_d_.applebuttontype.md#sign_in)
* [SIGN_UP](_lib_index_d_.applebuttontype.md#sign_up)

## Enumeration members

###  CONTINUE

• **CONTINUE**: = "Continue"

*Defined in [lib/index.d.ts:41](../../lib/index.d.ts#L41)*

Renders the button with 'Continue with Apple'.

___

###  DEFAULT

• **DEFAULT**: = "SignIn"

*Defined in [lib/index.d.ts:31](../../lib/index.d.ts#L31)*

The default button, the same as `SIGN_IN`.

___

###  SIGN_IN

• **SIGN_IN**: = "SignIn"

*Defined in [lib/index.d.ts:36](../../lib/index.d.ts#L36)*

Renders the button with 'Sign in with Apple'.

___

###  SIGN_UP

• **SIGN_UP**: = "SignUp"

*Defined in [lib/index.d.ts:48](../../lib/index.d.ts#L48)*

Renders the button with 'Sign up with Apple'.

> Note: This only works on iOS 13.2+. To check if the current device supports this, use the
provided `isSignUpButtonSupported` flag from the AppleAuth module.
