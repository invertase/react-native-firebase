# Interface: Task

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).Task

Storage Task used for Uploading or Downloading files.

#### Example 1

Get a Upload Storage task to upload a string:

```js
const string = '{ "foo": 1 }';
const task = firebase
 .storage()
 .ref('/foo/bar.json')
 .putString(string);
```

#### Example 2

Get a Download Storage task to download a file:

```js
const downloadTo = `${firebase.utils.FilePath.DOCUMENT_DIRECTORY}/bar.json`;

const task = firebase
 .storage()
 .ref('/foo/bar.json')
 .writeToFile(downloadTo);
```

## Table of contents

### Properties

- [snapshot](/reference/storage/interfaces/FirebaseStorageTypes.Task.md#snapshot)

### Methods

- [cancel](/reference/storage/interfaces/FirebaseStorageTypes.Task.md#cancel)
- [catch](/reference/storage/interfaces/FirebaseStorageTypes.Task.md#catch)
- [on](/reference/storage/interfaces/FirebaseStorageTypes.Task.md#on)
- [pause](/reference/storage/interfaces/FirebaseStorageTypes.Task.md#pause)
- [resume](/reference/storage/interfaces/FirebaseStorageTypes.Task.md#resume)
- [then](/reference/storage/interfaces/FirebaseStorageTypes.Task.md#then)

## Properties

### snapshot

• **snapshot**: ``null`` \| [`TaskSnapshot`](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md)

Initial state of Task.snapshot is `null`. Once uploading begins, it updates to a `TaskSnapshot` object.

#### Defined in

[index.d.ts:749](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L749)

## Methods

### cancel

▸ **cancel**(): `Promise`<`boolean`\>

Cancel the current Download or Upload task.

#### Example

Cancel a task inside a state changed listener:

```js
task.on('state_changed', taskSnapshot => {
  console.log('Cancelling my task!');
  task.cancel();
});
```

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.d.ts:806](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L806)

___

### catch

▸ **catch**(`onRejected`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `onRejected` | (`a`: `NativeFirebaseError`) => `any` |

#### Returns

`Promise`<`any`\>

#### Defined in

[index.d.ts:853](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L853)

___

### on

▸ **on**(`event`, `nextOrObserver?`, `error?`, `complete?`): () => `void`

Task event handler called when state has changed on the task.

#### Example

```js
const task = firebase
 .storage()
 .ref('/foo/bar.json')
 .writeToFile(downloadTo);

task.on('state_changed', (taskSnapshot) => {
  console.log(taskSnapshot.state);
});

task.then(() => {]
  console.log('Task complete');
})
.catch((error) => {
  console.error(error.message);
});
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | ``"state_changed"`` | The event name to handle, always `state_changed`. |
| `nextOrObserver?` | ``null`` \| [`TaskSnapshotObserver`](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshotObserver.md) \| (`a`: [`TaskSnapshot`](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md)) => `any` | The optional event observer function. |
| `error?` | ``null`` \| (`a`: `NativeFirebaseError`) => `any` | An optional JavaScript error handler. |
| `complete?` | ``null`` \| () => `void` | An optional complete handler function. |

#### Returns

`fn`

▸ (): `void`

Task event handler called when state has changed on the task.

#### Example

```js
const task = firebase
 .storage()
 .ref('/foo/bar.json')
 .writeToFile(downloadTo);

task.on('state_changed', (taskSnapshot) => {
  console.log(taskSnapshot.state);
});

task.then(() => {]
  console.log('Task complete');
})
.catch((error) => {
  console.error(error.message);
});
```

##### Returns

`void`

#### Defined in

[index.d.ts:836](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L836)

___

### pause

▸ **pause**(): `Promise`<`boolean`\>

Pause the current Download or Upload task.

#### Example

Pause a running task inside a state changed listener:

```js
task.on('state_changed', taskSnapshot => {
  if (taskSnapshot.state === firebase.storage.TaskState.RUNNING) {
    console.log('Pausing my task!');
    task.pause();
  }
});
```

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.d.ts:768](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L768)

___

### resume

▸ **resume**(): `Promise`<`boolean`\>

Resume the current Download or Upload task.

#### Example

Resume a previously paused task inside a state changed listener:

```js
task.on('state_changed', taskSnapshot => {
  // ... pause me ...
  if (taskSnapshot.state === firebase.storage.TaskState.PAUSED) {
    console.log('Resuming my task!');
    task.resume();
  }
});
```

#### Returns

`Promise`<`boolean`\>

#### Defined in

[index.d.ts:788](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L788)

___

### then

▸ **then**(`onFulfilled?`, `onRejected?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `onFulfilled?` | ``null`` \| (`a`: [`TaskSnapshot`](/reference/storage/interfaces/FirebaseStorageTypes.TaskSnapshot.md)) => `any` |
| `onRejected?` | ``null`` \| (`a`: `NativeFirebaseError`) => `any` |

#### Returns

`Promise`<`any`\>

#### Defined in

[index.d.ts:848](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L848)
