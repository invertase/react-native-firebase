# Interface: TaskState

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).TaskState

A collection of properties that indicates the current tasks state.

An event subscription is created via `StorageTask.on()`.

```js
firebase.storage.TaskEvent;
```

## Table of contents

### Properties

- [CANCELLED](/reference/storage/interfaces/FirebaseStorageTypes.TaskState.md#cancelled)
- [ERROR](/reference/storage/interfaces/FirebaseStorageTypes.TaskState.md#error)
- [PAUSED](/reference/storage/interfaces/FirebaseStorageTypes.TaskState.md#paused)
- [RUNNING](/reference/storage/interfaces/FirebaseStorageTypes.TaskState.md#running)
- [SUCCESS](/reference/storage/interfaces/FirebaseStorageTypes.TaskState.md#success)

## Properties

### CANCELLED

• **CANCELLED**: ``"cancelled"``

Task has been cancelled by the user.

#### Defined in

[index.d.ts:174](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L174)

___

### ERROR

• **ERROR**: ``"error"``

An Error occurred, see TaskSnapshot.error for details.

#### Defined in

[index.d.ts:179](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L179)

___

### PAUSED

• **PAUSED**: ``"paused"``

Task has been paused. Resume the task via `StorageTask.resume()`.

#### Defined in

[index.d.ts:184](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L184)

___

### RUNNING

• **RUNNING**: ``"running"``

Task is running. Pause the task via `StorageTask.pause()`

#### Defined in

[index.d.ts:189](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L189)

___

### SUCCESS

• **SUCCESS**: ``"success"``

Task has completed successfully.

#### Defined in

[index.d.ts:194](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L194)
