
# Interface: AppleButtonProps

The available props for the AppleButton view component.

## Hierarchy

* **AppleButtonProps**

## Index

### Properties

* [buttonStyle](_lib_index_d_.applebuttonprops.md#optional-buttonstyle)
* [buttonType](_lib_index_d_.applebuttonprops.md#optional-buttontype)
* [cornerRadius](_lib_index_d_.applebuttonprops.md#optional-cornerradius)
* [leftView](_lib_index_d_.applebuttonprops.md#optional-leftview)
* [onPress](_lib_index_d_.applebuttonprops.md#onpress)
* [style](_lib_index_d_.applebuttonprops.md#optional-style)
* [textStyle](_lib_index_d_.applebuttonprops.md#optional-textstyle)

## Properties

### `Optional` buttonStyle

• **buttonStyle**? : *[AppleButtonStyle](../enums/_lib_index_d_.applebuttonstyle.md)*

*Defined in [lib/index.d.ts:83](../../lib/index.d.ts#L83)*

See @{AppleButtonStyle}

___

### `Optional` buttonType

• **buttonType**? : *[AppleButtonType](../enums/_lib_index_d_.applebuttontype.md)*

*Defined in [lib/index.d.ts:88](../../lib/index.d.ts#L88)*

See @{AppleButtonType}

___

### `Optional` cornerRadius

• **cornerRadius**? : *undefined | number*

*Defined in [lib/index.d.ts:93](../../lib/index.d.ts#L93)*

Corner radius of the button.

___

### `Optional` leftView

• **leftView**? : *React.ReactNode*

*Defined in [lib/index.d.ts:108](../../lib/index.d.ts#L108)*

Android-only. View on the left that can be used for an Apple logo.

___

###  onPress

• **onPress**: *function*

*Defined in [lib/index.d.ts:110](../../lib/index.d.ts#L110)*

#### Type declaration:

▸ (`event`: GestureResponderEvent): *void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | GestureResponderEvent |

___

### `Optional` style

• **style**? : *StyleProp‹ViewStyle›*

*Defined in [lib/index.d.ts:98](../../lib/index.d.ts#L98)*

Styling for outside `TouchableOpacity`

___

### `Optional` textStyle

• **textStyle**? : *StyleProp‹TextStyle›*

*Defined in [lib/index.d.ts:103](../../lib/index.d.ts#L103)*

Android-only. Styling for button text.
