# Interface: TaskEvent

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).TaskEvent

An event to subscribe to that is triggered on a Upload or Download task.

Event subscription is created via `StorageTask.on()`.

```js
firebase.storage.TaskEvent;
```

## Table of contents

### Properties

- [STATE\_CHANGED](/reference/storage/interfaces/FirebaseStorageTypes.TaskEvent.md#state_changed)

## Properties

### STATE\_CHANGED

• **STATE\_CHANGED**: ``"state_changed"``

An event that indicates that the tasks state has changed.

```js
firebase.storage.TaskEvent.STATE_CHANGED;
```

#### Defined in

[index.d.ts:158](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L158)
