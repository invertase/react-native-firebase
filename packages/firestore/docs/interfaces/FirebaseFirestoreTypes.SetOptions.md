# Interface: SetOptions

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).SetOptions

An options object that configures the behavior of set() calls in `DocumentReference`, `WriteBatch` and `Transaction`.
These calls can be configured to perform granular merges instead of overwriting the target documents in their entirety
by providing a `SetOptions` with `merge: true`.

Using both `merge` and `mergeFields` together will throw an error.

## Table of contents

### Properties

- [merge](/reference/firestore/interfaces/FirebaseFirestoreTypes.SetOptions.md#merge)
- [mergeFields](/reference/firestore/interfaces/FirebaseFirestoreTypes.SetOptions.md#mergefields)

## Properties

### merge

• `Optional` **merge**: `boolean`

Changes the behavior of a `set()` call to only replace the values specified in its data argument.
Fields omitted from the `set()` call remain untouched.

#### Defined in

[index.d.ts:1548](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1548)

___

### mergeFields

• `Optional` **mergeFields**: (`string` \| [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md))[]

Changes the behavior of `set()` calls to only replace the specified field paths.
Any field path that is not specified is ignored and remains untouched.

#### Defined in

[index.d.ts:1554](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1554)
