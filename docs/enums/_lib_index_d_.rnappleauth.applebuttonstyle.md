# Enumeration: AppleButton.Style

The Button style (mainly color) to render.

## What is it?

It is a property on the exported member, `AppleButton` from the `react-native-apple-authentication` library.

```js
import { AppleButton } from '@invertase/react-native-apple-authentication';

function AppleButtonComponent() {
  return (
    <View>
      <AppleButton buttonStyle={AppleButton.Style.BLACK} />
      <AppleButton buttonStyle={AppleButton.Style.DEFAULT} />
      <AppleButton buttonStyle={AppleButton.Style.WHITE} />
      <AppleButton buttonStyle={AppleButton.Style.WHITE_OUTLINE} />
    </View>
  );
}
```

## Index

### Enumeration members

- [BLACK](_lib_index_d_.rnappleauth.applebuttonstyle.md#black)
- [DEFAULT](_lib_index_d_.rnappleauth.applebuttonstyle.md#default)
- [WHITE](_lib_index_d_.rnappleauth.applebuttonstyle.md#white)
- [WHITE_OUTLINE](_lib_index_d_.rnappleauth.applebuttonstyle.md#white_outline)

## Enumeration members

### BLACK

• **BLACK**: = "Black"

_Defined in [lib/index.d.ts:41](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L41)_

Render a black button with white text.

---

### DEFAULT

• **DEFAULT**: = "White"

_Defined in [lib/index.d.ts:26](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L26)_

The default style, White.

---

### WHITE

• **WHITE**: = "White"

_Defined in [lib/index.d.ts:31](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L31)_

Render a white button with black text.

---

### WHITE_OUTLINE

• **WHITE_OUTLINE**: = "WhiteOutline"

_Defined in [lib/index.d.ts:36](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L36)_

Render a white button with black text and a bordered outline.
