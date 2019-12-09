# Interface: AppleButton

The available props for the `AppleButton` react component.

## What is it?

```js
import React from 'react';
import { View } from 'react-native';
import { AppleButton } from '@invertase/react-native-apple-authentication';

function App() {
  return (
    <View>
      <AppleButton
        style={styles.appleButton}
        cornerRadius={5}
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        onPress={() => onAppleButtonPress()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  appleButton: {
    width: 200,
    height: 60,
    margin: 10,
  },
});
```

## Index

### Properties

- [buttonStyle](_lib_index_d_.rnappleauth.applebuttonprops.md#optional-buttonstyle)
- [buttonType](_lib_index_d_.rnappleauth.applebuttonprops.md#optional-buttontype)
- [cornerRadius](_lib_index_d_.rnappleauth.applebuttonprops.md#optional-cornerradius)

## Properties

### `Optional` buttonStyle

• **buttonStyle**? : _[AppleButtonStyle](../enums/_lib_index_d_.rnappleauth.applebuttonstyle.md)_

_Defined in [lib/index.d.ts:175](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L175)_

See @{RNAppleAuth.AppleButtonStyle}

---

### `Optional` buttonType

• **buttonType**? : _[AppleButtonType](../enums/_lib_index_d_.rnappleauth.applebuttontype.md)_

_Defined in [lib/index.d.ts:180](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L180)_

See @{RNAppleAuth.AppleButtonType}

---

### `Optional` cornerRadius

• **cornerRadius**? : _undefined | number_

_Defined in [lib/index.d.ts:185](https://github.com/invertase/react-native-apple-authentication/blob/2b75721d/lib/index.d.ts#L185)_

Corner radius of the button.
