# Interface: TaskSnapshotObserver

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).TaskSnapshotObserver

The snapshot observer returned from a storage.Task#on listener.

#### Example

```js
const ref = firebase.storage().ref(...);
const task = ref.put(...)

task.on('state_changed', {
  next(taskSnapshot) {
    console.log(taskSnapshot.state);
  },
  error(error) {
    console.error(error.message);
  },
  complete() {
    console.log('Task complete');
  },
})
```

## Table of contents

### Properties

- [complete](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshotObserver.md#complete)
- [error](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshotObserver.md#error)
- [next](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshotObserver.md#next)

## Properties

### complete

• **complete**: () => `void`

#### Type declaration

▸ (): `void`

Called when the task has completed successfully.

##### Returns

`void`

#### Defined in

[index.d.ts:714](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L714)

___

### error

• **error**: (`error`: `NativeFirebaseError`) => `void`

#### Type declaration

▸ (`error`): `void`

Called when the task errors.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `NativeFirebaseError` | A JavaScript error. |

##### Returns

`void`

#### Defined in

[index.d.ts:709](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L709)

___

### next

• **next**: (`taskSnapshot`: [`TaskSnapshot`](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md)) => `void`

#### Type declaration

▸ (`taskSnapshot`): `void`

Called when the task state changes.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `taskSnapshot` | [`TaskSnapshot`](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md) | A `TaskSnapshot` for the event. |

##### Returns

`void`

#### Defined in

[index.d.ts:702](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L702)
