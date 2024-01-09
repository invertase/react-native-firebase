# Interface: Settings

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).Settings

Specifies custom configurations for your Cloud Firestore instance. You must set these before invoking any other methods.

Used with `firebase.firestore().settings()`.

## Table of contents

### Properties

- [cacheSizeBytes](/reference/firestore/interfaces/FirebaseFirestoreTypes.Settings.md#cachesizebytes)
- [host](/reference/firestore/interfaces/FirebaseFirestoreTypes.Settings.md#host)
- [ignoreUndefinedProperties](/reference/firestore/interfaces/FirebaseFirestoreTypes.Settings.md#ignoreundefinedproperties)
- [persistence](/reference/firestore/interfaces/FirebaseFirestoreTypes.Settings.md#persistence)
- [serverTimestampBehavior](/reference/firestore/interfaces/FirebaseFirestoreTypes.Settings.md#servertimestampbehavior)
- [ssl](/reference/firestore/interfaces/FirebaseFirestoreTypes.Settings.md#ssl)

## Properties

### cacheSizeBytes

• `Optional` **cacheSizeBytes**: `number`

An approximate cache size threshold for the on-disk data. If the cache grows beyond this size, Firestore will start
removing data that hasn't been recently used. The size is not a guarantee that the cache will stay below that size,
only that if the cache exceeds the given size, cleanup will be attempted.

To disable garbage collection and set an unlimited cache size, use `firebase.firestore.CACHE_SIZE_UNLIMITED`.

#### Defined in

[index.d.ts:1575](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1575)

___

### host

• `Optional` **host**: `string`

The hostname to connect to.

Note: on android, hosts 'localhost' and '127.0.0.1' are automatically remapped to '10.0.2.2' (the
"host" computer IP address for android emulators) to make the standard development experience easy.
If you want to use the emulator on a real android device, you will need to specify the actual host
computer IP address. Use of this property for emulator connection is deprecated. Use useEmulator instead

#### Defined in

[index.d.ts:1585](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1585)

___

### ignoreUndefinedProperties

• `Optional` **ignoreUndefinedProperties**: `boolean`

Whether to skip nested properties that are set to undefined during object serialization.
If set to true, these properties are skipped and not written to Firestore.
If set to false or omitted, the SDK throws an exception when it encounters properties of type undefined.

#### Defined in

[index.d.ts:1597](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1597)

___

### persistence

• `Optional` **persistence**: `boolean`

Enables or disables local persistent storage.

#### Defined in

[index.d.ts:1566](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1566)

___

### serverTimestampBehavior

• `Optional` **serverTimestampBehavior**: ``"estimate"`` \| ``"previous"`` \| ``"none"``

If set, controls the return value for server timestamps that have not yet been set to their final value.

By specifying 'estimate', pending server timestamps return an estimate based on the local clock.
This estimate will differ from the final value and cause these values to change once the server result becomes available.

By specifying 'previous', pending timestamps will be ignored and return their previous value instead.

If omitted or set to 'none', null will be returned by default until the server value becomes available.

#### Defined in

[index.d.ts:1610](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1610)

___

### ssl

• `Optional` **ssl**: `boolean`

Whether to use SSL when connecting. A true value is incompatible with the firestore emulator.

#### Defined in

[index.d.ts:1590](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L1590)
