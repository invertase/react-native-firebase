# @react-native-firebase/firestore

## Table of contents

### Namespaces

- [FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md)

### Variables

- [Filter](/reference/firestore/modules.md#filter)
- [firebase](/reference/firestore/modules.md#firebase)

### Functions

- [default](/reference/firestore/modules.md#default)

## Variables

### Filter

• `Const` **Filter**: `FilterFunction`

#### Defined in

[index.d.ts:2343](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2343)

___

### firebase

• `Const` **firebase**: `ReactNativeFirebase.Module` & \{ `firestore`: typeof [`default`](/reference/firestore/modules.md#default) ; `app`: (`name?`: `string`) => `FirebaseApp` & \{ `firestore`: () => [`Module`](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md)  }  }

#### Defined in

[index.d.ts:2336](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2336)

## Functions

### default

▸ **default**(`app?`): [`Module`](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `app?` | `FirebaseApp` |

#### Returns

[`Module`](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md)

#### Defined in

[../../app/lib/index.d.ts:253](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/app/lib/index.d.ts#L253)
