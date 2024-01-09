# Interface: FilterFunction

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).FilterFunction

The Filter functions used to generate an instance of Filter.

## Callable

### FilterFunction

▸ **FilterFunction**(`fieldPath`, `operator`, `value`): [`QueryFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryFilterConstraint.md)

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

## Table of contents

### Methods

- [and](/reference/firestore/interfaces/FirebaseFirestoreTypes.FilterFunction.md#and)
- [or](/reference/firestore/interfaces/FirebaseFirestoreTypes.FilterFunction.md#or)

## Methods

### and

▸ **and**(`...queries`): [`QueryCompositeFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryCompositeFilterConstraint.md)

The Filter.and() static function used to generate a logical AND query using multiple Filter instances.
e.g. Filter.and(Filter('name', '==', 'Ada'), Filter('name', '==', 'Bob'))

#### Parameters

| Name | Type |
| :------ | :------ |
| `...queries` | [`QueryFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryFilterConstraint.md)[] |

#### Returns

[`QueryCompositeFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryCompositeFilterConstraint.md)

#### Defined in

[index.d.ts:86](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L86)

___

### or

▸ **or**(`...queries`): [`QueryCompositeFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryCompositeFilterConstraint.md)

The Filter.or() static function used to generate a logical OR query using multiple Filter instances.
e.g. Filter.or(Filter('name', '==', 'Ada'), Filter('name', '==', 'Bob'))

#### Parameters

| Name | Type |
| :------ | :------ |
| `...queries` | [`QueryFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryFilterConstraint.md)[] |

#### Returns

[`QueryCompositeFilterConstraint`](/reference/firestore/interfaces/FirebaseFirestoreTypes.QueryCompositeFilterConstraint.md)

#### Defined in

[index.d.ts:81](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L81)
