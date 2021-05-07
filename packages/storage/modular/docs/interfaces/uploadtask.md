# Interface: UploadTask

Represents the process of uploading an object. Allows you to monitor and manage the upload.

## Table of contents

### Properties

- [snapshot](/reference/storage/interfaces/uploadtask.md#snapshot)

### Methods

- [cancel](/reference/storage/interfaces/uploadtask.md#cancel)
- [catch](/reference/storage/interfaces/uploadtask.md#catch)
- [on](/reference/storage/interfaces/uploadtask.md#on)
- [pause](/reference/storage/interfaces/uploadtask.md#pause)
- [resume](/reference/storage/interfaces/uploadtask.md#resume)
- [then](/reference/storage/interfaces/uploadtask.md#then)

## Properties

### snapshot

• `Readonly` **snapshot**: [*UploadTaskSnapshot*](/reference/storage/interfaces/uploadtasksnapshot.md)

A snapshot of the current task state.

Defined in: [packages/storage/modular/src/types.ts:74](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L74)

## Methods

### cancel

▸ **cancel**(): *Promise*<boolean\>

Cancels a running task. Has no effect on a complete or failed task.

**Returns:** *Promise*<boolean\>

Defined in: [packages/storage/modular/src/types.ts:78](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L78)

___

### catch

▸ **catch**(`onRejected?`: (`error`: *any*) => *unknown*): *Promise*<unknown\>

Called if the upload task fails.

#### Parameters

| Name | Type |
| :------ | :------ |
| `onRejected?` | (`error`: *any*) => *unknown* |

**Returns:** *Promise*<unknown\>

Defined in: [packages/storage/modular/src/types.ts:110](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L110)

___

### on

▸ **on**(`event`: ``"state_changed"``, `observer?`: (`snapshot`: [*UploadTaskSnapshot*](/reference/storage/interfaces/uploadtasksnapshot.md)) => *unknown*, `error?`: (`error`: *any*) => *unknown*, `complete?`: () => *unknown*): *function*

Listens for events on this task.

In addition, when you add your callbacks, you get a function back. You can call this function to unregister the associated callbacks.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"state_changed"`` |
| `observer?` | (`snapshot`: [*UploadTaskSnapshot*](/reference/storage/interfaces/uploadtasksnapshot.md)) => *unknown* |
| `error?` | (`error`: *any*) => *unknown* |
| `complete?` | () => *unknown* |

**Returns:** () => *void*

Defined in: [packages/storage/modular/src/types.ts:95](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L95)

___

### pause

▸ **pause**(): *Promise*<boolean\>

Pauses a currently running task. Has no effect on a paused or failed task.

**Returns:** *Promise*<boolean\>

Defined in: [packages/storage/modular/src/types.ts:86](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L86)

___

### resume

▸ **resume**(): *Promise*<boolean\>

Resumes a paused task. Has no effect on a currently running or failed task.

**Returns:** *Promise*<boolean\>

Defined in: [packages/storage/modular/src/types.ts:82](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L82)

___

### then

▸ **then**(`onFulfilled?`: (`snapshot`: [*UploadTaskSnapshot*](/reference/storage/interfaces/uploadtasksnapshot.md)) => *unknown*): *Promise*<unknown\>

This object behaves like a Promise, and resolves with its snapshot data when the upload completes.

#### Parameters

| Name | Type |
| :------ | :------ |
| `onFulfilled?` | (`snapshot`: [*UploadTaskSnapshot*](/reference/storage/interfaces/uploadtasksnapshot.md)) => *unknown* |

**Returns:** *Promise*<unknown\>

Defined in: [packages/storage/modular/src/types.ts:105](https://github.com/invertase/react-native-firebase/blob/e2e22540/packages/storage/modular/src/types.ts#L105)
