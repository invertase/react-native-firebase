# Interface: TaskSnapshot

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).TaskSnapshot

A TaskSnapshot provides information about a storage tasks state.

#### Example 1

```js
firebase
  .storage()
  .ref('/foo/bar.json')
  .putString(JSON.stringify({ foo: 'bar' }))
  .then((taskSnapshot) => {
    if (taskSnapshot.state === firebase.storage.TaskState.SUCCESS) {
      console.log('Total bytes uploaded: ', taskSnapshot.totalBytes);
    }
  });
```

#### Example 2

```js
const task = firebase
  .storage()
  .ref('/foo/bar.json')
  .putString(JSON.stringify({ foo: 'bar' }));

task.on('state_changed', taskSnapshot => {
  if (taskSnapshot.state === firebase.storage.TaskState.PAUSED) {
    console.log('Resuming my task!');
    task.resume();
  }
});
```

## Table of contents

### Properties

- [bytesTransferred](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md#bytestransferred)
- [error](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md#error)
- [metadata](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md#metadata)
- [ref](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md#ref)
- [state](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md#state)
- [task](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md#task)
- [totalBytes](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md#totalbytes)

## Properties

### bytesTransferred

• **bytesTransferred**: `number`

The number of bytes currently transferred.

#### Defined in

[index.d.ts:893](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L893)

___

### error

• `Optional` **error**: `NativeFirebaseError`

If the storage.TaskSnapshot#state is `error`, returns a JavaScript error of the
current task snapshot.

#### Defined in

[index.d.ts:924](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L924)

___

### metadata

• **metadata**: [`FullMetadata`](/reference/storage/interfaces/FirebaseStorageTypes.FullMetadata.md)

The metadata of the tasks via a storage.FullMetadata interface.

#### Defined in

[index.d.ts:898](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L898)

___

### ref

• **ref**: [`Reference`](/reference/storage/interfaces/FirebaseStorageTypes.Reference.md)

The storage.Reference of the task.

#### Defined in

[index.d.ts:903](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L903)

___

### state

• **state**: ``"error"`` \| ``"success"`` \| ``"cancelled"`` \| ``"paused"`` \| ``"running"``

The current state of the task snapshot.

#### Defined in

[index.d.ts:908](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L908)

___

### task

• **task**: [`Task`](/reference/storage/interfaces/FirebaseStorageTypes.Task.md)

The parent storage.Task of this snapshot.

#### Defined in

[index.d.ts:913](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L913)

___

### totalBytes

• **totalBytes**: `number`

The total amount of bytes for this task.

#### Defined in

[index.d.ts:918](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L918)
