[@react-native-firebase/app](../README.md) / [Exports](../modules.md) / [Utils](../modules/Utils.md) / FilePath

# Interface: FilePath

[Utils](../modules/Utils.md).FilePath

A collection of native device file paths to aid in the usage of file path based methods.

Concatenate a file path with your target file name when using with Storage `putFile` or `writeToFile`.

```js
firebase.utils.FilePath;
```

## Table of contents

### Properties

- [CACHES\_DIRECTORY](Utils.FilePath.md#caches_directory)
- [DOCUMENT\_DIRECTORY](Utils.FilePath.md#document_directory)
- [EXTERNAL\_DIRECTORY](Utils.FilePath.md#external_directory)
- [EXTERNAL\_STORAGE\_DIRECTORY](Utils.FilePath.md#external_storage_directory)
- [LIBRARY\_DIRECTORY](Utils.FilePath.md#library_directory)
- [MAIN\_BUNDLE](Utils.FilePath.md#main_bundle)
- [MOVIES\_DIRECTORY](Utils.FilePath.md#movies_directory)
- [PICTURES\_DIRECTORY](Utils.FilePath.md#pictures_directory)
- [TEMP\_DIRECTORY](Utils.FilePath.md#temp_directory)

## Properties

### CACHES\_DIRECTORY

• **CACHES\_DIRECTORY**: `string`

Returns an absolute path to the application specific cache directory on the filesystem.

The system will automatically delete files in this directory when disk space is needed elsewhere on the device, starting with the oldest files first.

```js
firebase.utils.FilePath.CACHES_DIRECTORY;
```

#### Defined in

[packages/app/lib/index.d.ts:298](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L298)

___

### DOCUMENT\_DIRECTORY

• **DOCUMENT\_DIRECTORY**: `string`

Returns an absolute path to the users Documents directory.

Use this directory to place documents that have been created by the user.

Normally this is the external files directory on Android but if no external storage directory found,
e.g. removable media has been ejected by the user, it will fall back to internal storage. This may
under rare circumstances where device storage environment changes cause the directory to be different
between runs of the application

```js
firebase.utils.FilePath.DOCUMENT_DIRECTORY;
```

#### Defined in

[packages/app/lib/index.d.ts:314](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L314)

___

### EXTERNAL\_DIRECTORY

• **EXTERNAL\_DIRECTORY**: ``null`` \| `string`

Returns an absolute path to the directory on the primary shared/external storage device.

Here your application can place persistent files it owns. These files are internal to the application, and not typically visible to the user as media.

Returns null if no external storage directory found, e.g. removable media has been ejected by the user.

```js
firebase.utils.FilePath.EXTERNAL_DIRECTORY;
```

**`Android`**

Android only - iOS returns null

#### Defined in

[packages/app/lib/index.d.ts:351](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L351)

___

### EXTERNAL\_STORAGE\_DIRECTORY

• **EXTERNAL\_STORAGE\_DIRECTORY**: ``null`` \| `string`

Returns an absolute path to the primary shared/external storage directory.

Traditionally this is an SD card, but it may also be implemented as built-in storage on a device.

Returns null if no external storage directory found, e.g. removable media has been ejected by the user.
Requires special permission granted by Play Store review team on Android, is unlikely to be a valid path.

```js
firebase.utils.FilePath.EXTERNAL_STORAGE_DIRECTORY;
```

**`Android`**

Android only - iOS returns null

#### Defined in

[packages/app/lib/index.d.ts:367](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L367)

___

### LIBRARY\_DIRECTORY

• **LIBRARY\_DIRECTORY**: `string`

Returns an absolute path to the apps library/resources directory.

E.g. this can be used for things like documentation, support files, and configuration files and generic resources.

```js
firebase.utils.FilePath.LIBRARY_DIRECTORY;
```

#### Defined in

[packages/app/lib/index.d.ts:336](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L336)

___

### MAIN\_BUNDLE

• **MAIN\_BUNDLE**: `string`

Returns an absolute path to the applications main bundle.

```js
firebase.utils.FilePath.MAIN_BUNDLE;
```

**`Ios`**

iOS only

#### Defined in

[packages/app/lib/index.d.ts:287](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L287)

___

### MOVIES\_DIRECTORY

• **MOVIES\_DIRECTORY**: `string`

Returns an absolute path to a directory in which to place movies that are available to the user.
Requires special permission granted by Play Store review team on Android, is unlikely to be a valid path.

```js
firebase.utils.FilePath.MOVIES_DIRECTORY;
```

#### Defined in

[packages/app/lib/index.d.ts:387](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L387)

___

### PICTURES\_DIRECTORY

• **PICTURES\_DIRECTORY**: `string`

Returns an absolute path to a directory in which to place pictures that are available to the user.
Requires special permission granted by Play Store review team on Android, is unlikely to be a valid path.

```js
firebase.utils.FilePath.PICTURES_DIRECTORY;
```

#### Defined in

[packages/app/lib/index.d.ts:377](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L377)

___

### TEMP\_DIRECTORY

• **TEMP\_DIRECTORY**: `string`

Returns an absolute path to a temporary directory.

Use this directory to create temporary files. The system will automatically delete files in this directory when disk space is needed elsewhere on the device, starting with the oldest files first.

```js
firebase.utils.FilePath.TEMP_DIRECTORY;
```

#### Defined in

[packages/app/lib/index.d.ts:325](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/app/lib/index.d.ts#L325)
