# Namespace: FirebaseFirestoreTypes

Firebase Cloud Firestore package for React Native.

#### Example: Access the firebase export from the `firestore` package:

```js
import { firebase } from '@react-native-firebase/firestore';

// firebase.firestore().X
```

#### Example: Using the default export from the `firestore` package:

```js
import firestore from '@react-native-firebase/firestore';

// firestore().X
```

#### Example: Using the default export from the `app` package:

```js
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/firestore';

// firebase.firestore().X
```

**`Firebase`**

firestore

## Table of contents

### Classes

- [AggregateField](/reference/firestore/classes/FirebaseFirestoreTypes.AggregateField.md)
- [Blob](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md)
- [FieldPath](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md)
- [FieldValue](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md)
- [GeoPoint](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md)
- [Module](/reference/firestore/classes/FirebaseFirestoreTypes.Module.md)
- [Timestamp](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md)

### Interfaces

- [AggregateQuery](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuery.md)
- [AggregateQuerySnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateQuerySnapshot.md)
- [AggregateSpec](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateSpec.md)
- [CollectionReference](/reference/firestore/interfaces/FirebaseFirestoreTypes.CollectionReference.md)
- [DocumentChange](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentChange.md)
- [DocumentData](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentData.md)
- [DocumentReference](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md)
- [DocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentSnapshot.md)
- [FilterFunction](/reference/firestore/interfaces/FirebaseFirestoreTypes.FilterFunction.md)
- [GetOptions](/reference/firestore/interfaces/FirebaseFirestoreTypes.GetOptions.md)
- [LoadBundleTaskProgress](/reference/firestore/interfaces/FirebaseFirestoreTypes.LoadBundleTaskProgress.md)
- [Query](/reference/firestore/interfaces/FirebaseFirestoreTypes.Query.md)
- [QueryCompositeFilterConstraint](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryCompositeFilterConstraint.md)
- [QueryDocumentSnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryDocumentSnapshot.md)
- [QueryFilterConstraint](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryFilterConstraint.md)
- [QuerySnapshot](/reference/firestore/interfaces/FirebaseFirestoreTypes.QuerySnapshot.md)
- [SetOptions](/reference/firestore/interfaces/FirebaseFirestoreTypes.SetOptions.md)
- [Settings](/reference/firestore/interfaces/FirebaseFirestoreTypes.Settings.md)
- [SnapshotListenOptions](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotListenOptions.md)
- [SnapshotMetadata](/reference/firestore/interfaces/FirebaseFirestoreTypes.SnapshotMetadata.md)
- [Statics](/reference/firestore/interfaces/FirebaseFirestoreTypes.Statics.md)
- [Transaction](/reference/firestore/interfaces/FirebaseFirestoreTypes.Transaction.md)
- [WriteBatch](/reference/firestore/interfaces/FirebaseFirestoreTypes.WriteBatch.md)

### Type Aliases

- [AggregateFieldType](/reference/firestore/modules/FirebaseFirestoreTypes.md#aggregatefieldtype)
- [AggregateSpecData](/reference/firestore/modules/FirebaseFirestoreTypes.md#aggregatespecdata)
- [DocumentChangeType](/reference/firestore/modules/FirebaseFirestoreTypes.md#documentchangetype)
- [DocumentFieldType](/reference/firestore/modules/FirebaseFirestoreTypes.md#documentfieldtype)
- [QueryFilterType](/reference/firestore/modules/FirebaseFirestoreTypes.md#queryfiltertype)
- [SetValue](/reference/firestore/modules/FirebaseFirestoreTypes.md#setvalue)
- [TaskState](/reference/firestore/modules/FirebaseFirestoreTypes.md#taskstate)
- [WhereFilterOp](/reference/firestore/modules/FirebaseFirestoreTypes.md#wherefilterop)

### Functions

- [Filter](/reference/firestore/modules/FirebaseFirestoreTypes.md#filter)

## Type Aliases

### AggregateFieldType

Ƭ **AggregateFieldType**: [`AggregateField`](/reference/firestore/classes/FirebaseFirestoreTypes.AggregateField.md)\<`number`\>

The union of all `AggregateField` types that are supported by Firestore.

#### Defined in

[index.d.ts:896](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L896)

___

### AggregateSpecData

Ƭ **AggregateSpecData**\<`T`\>: \{ [P in keyof T]: T[P] extends AggregateField\<infer U\> ? U : never }

A type whose keys are taken from an `AggregateSpec`, and whose values are the
result of the aggregation performed by the corresponding `AggregateField`
from the input `AggregateSpec`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`AggregateSpec`](/reference/firestore/interfaces/FirebaseFirestoreTypes.AggregateSpec.md) |

#### Defined in

[index.d.ts:910](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L910)

___

### DocumentChangeType

Ƭ **DocumentChangeType**: ``"added"`` \| ``"removed"`` \| ``"modified"``

The type of a DocumentChange may be 'added', 'removed', or 'modified'.

#### Defined in

[index.d.ts:224](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L224)

___

### DocumentFieldType

Ƭ **DocumentFieldType**: `string` \| `number` \| `boolean` \| \{ `[key: string]`: [`DocumentFieldType`](/reference/firestore/modules/FirebaseFirestoreTypes.md#documentfieldtype);  } \| [`DocumentFieldType`](/reference/firestore/modules/FirebaseFirestoreTypes.md#documentfieldtype)[] \| ``null`` \| [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md) \| [`GeoPoint`](/reference/firestore/classes/FirebaseFirestoreTypes.GeoPoint.md) \| [`Blob`](/reference/firestore/classes/FirebaseFirestoreTypes.Blob.md) \| [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md) \| [`FieldValue`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldValue.md) \| [`DocumentReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.DocumentReference.md) \| [`CollectionReference`](/reference/firestore/interfaces/FirebaseFirestoreTypes.CollectionReference.md)

The types for a DocumentSnapshot field that are supported by Firestore.

#### Defined in

[index.d.ts:229](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L229)

___

### QueryFilterType

Ƭ **QueryFilterType**: ``"OR"`` \| ``"AND"``

An instance of Filter used to generate Firestore Filter queries.

#### Defined in

[index.d.ts:56](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L56)

___

### SetValue

Ƭ **SetValue**\<`T`\>: `T` extends [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md) ? [`Timestamp`](/reference/firestore/classes/FirebaseFirestoreTypes.Timestamp.md) \| `Date` : `T` extends `object` ? \{ [P in keyof T]: SetValue\<T[P]\> \| FieldValue } : `T`

Utility type to allow FieldValue and to allow Date in place of Timestamp objects.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[index.d.ts:2322](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2322)

___

### TaskState

Ƭ **TaskState**: ``"Error"`` \| ``"Running"`` \| ``"Success"``

Represents the state of bundle loading tasks.

Both 'Error' and 'Success' are sinking state: task will abort or complete and there will be no more
updates after they are reported.

#### Defined in

[index.d.ts:2007](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L2007)

___

### WhereFilterOp

Ƭ **WhereFilterOp**: ``"<"`` \| ``"<="`` \| ``"=="`` \| ``">"`` \| ``">="`` \| ``"!="`` \| ``"array-contains"`` \| ``"array-contains-any"`` \| ``"in"`` \| ``"not-in"``

Filter conditions in a `Query.where()` clause are specified using the strings '<', '<=', '==', '>=', '>', 'array-contains', 'array-contains-any' or 'in'.

#### Defined in

[index.d.ts:1421](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1421)

## Functions

### Filter

▸ **Filter**(`fieldPath`, `operator`, `value`): [`QueryFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryFilterConstraint.md)

The Filter function used to generate an instance of Filter.
e.g. Filter('name', '==', 'Ada')

#### Parameters

| Name | Type |
| :------ | :------ |
| `fieldPath` | `string` \| `number` \| `symbol` \| [`FieldPath`](/reference/firestore/classes/FirebaseFirestoreTypes.FieldPath.md) |
| `operator` | [`WhereFilterOp`](/reference/firestore/modules/FirebaseFirestoreTypes.md#wherefilterop) |
| `value` | `any` |

#### Returns

[`QueryFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryFilterConstraint.md)

#### Defined in

[index.d.ts:76](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L76)
