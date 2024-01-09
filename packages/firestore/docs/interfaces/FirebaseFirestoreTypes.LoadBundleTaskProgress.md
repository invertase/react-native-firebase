# Interface: LoadBundleTaskProgress

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).LoadBundleTaskProgress

Represents a progress update or a final state from loading bundles.

## Table of contents

### Properties

- [bytesLoaded](/reference/firestore/interfaces/FirebaseFirestoreTypes.LoadBundleTaskProgress.md#bytesloaded)
- [documentsLoaded](/reference/firestore/interfaces/FirebaseFirestoreTypes.LoadBundleTaskProgress.md#documentsloaded)
- [taskState](/reference/firestore/interfaces/FirebaseFirestoreTypes.LoadBundleTaskProgress.md#taskstate)
- [totalBytes](/reference/firestore/interfaces/FirebaseFirestoreTypes.LoadBundleTaskProgress.md#totalbytes)
- [totalDocuments](/reference/firestore/interfaces/FirebaseFirestoreTypes.LoadBundleTaskProgress.md#totaldocuments)

## Properties

### bytesLoaded

• **bytesLoaded**: `number`

How many bytes have been loaded.

#### Defined in

[index.d.ts:2016](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2016)

___

### documentsLoaded

• **documentsLoaded**: `number`

How many documents have been loaded.

#### Defined in

[index.d.ts:2021](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2021)

___

### taskState

• **taskState**: [`TaskState`](/reference/firestore/modules/FirebaseFirestoreTypes.md#taskstate)

Current task state.

#### Defined in

[index.d.ts:2026](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2026)

___

### totalBytes

• **totalBytes**: `number`

How many bytes are in the bundle being loaded.

#### Defined in

[index.d.ts:2031](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2031)

___

### totalDocuments

• **totalDocuments**: `number`

How many documents are in the bundle being loaded.

#### Defined in

[index.d.ts:2036](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2036)
