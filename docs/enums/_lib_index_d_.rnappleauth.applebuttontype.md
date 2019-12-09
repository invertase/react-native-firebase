# Enumeration: AppleButtonType

The Apple Button type to render, this controls the button text.

## What is it?

It is a property on the exported member, `AppleButton` from the `react-native-apple-authentication` library.

```js
import { AppleButton } from '@invertase/react-native-apple-authentication';

function AppleButtonComponent() {
  return (
    <View>
      <AppleButton buttonType={AppleButton.Type.CONTINUE} />
      <AppleButton buttonType={AppleButton.Type.DEFAULT} />
      <AppleButton buttonType={AppleButton.Type.SIGN_IN} />
      <AppleButton buttonType={AppleButton.Type.SIGN_UP} />
    </View>
  );
}
```

## Index

### Enumeration members

- [CONTINUE](_lib_index_d_.rnappleauth.applebuttontype.md#continue)
- [DEFAULT](_lib_index_d_.rnappleauth.applebuttontype.md#default)
- [SIGN_IN](_lib_index_d_.rnappleauth.applebuttontype.md#sign_in)
- [SIGN_UP](_lib_index_d_.rnappleauth.applebuttontype.md#sign_up)

## Enumeration members

### CONTINUE

• **CONTINUE**: = "Continue"

_Defined in [lib/index.d.ts:61](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L61)_

Renders the button with 'Continue with Apple'.

---

### DEFAULT

• **DEFAULT**: = "SignIn"

_Defined in [lib/index.d.ts:51](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L51)_

The default button, the same as `SIGN_IN`.

---

### SIGN_IN

• **SIGN_IN**: = "SignIn"

_Defined in [lib/index.d.ts:56](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L56)_

Renders the button with 'Sign in with Apple'.

---

### SIGN_UP

• **SIGN_UP**: = "SignUp"

_Defined in [lib/index.d.ts:68](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L68)_

Renders the button with 'Sign up with Apple'.

> Note: This only works on iOS 13.2+. To check if the current device supports this, use the
> provided `isSignUpButtonSupported` flag from the AppleAuth module.
