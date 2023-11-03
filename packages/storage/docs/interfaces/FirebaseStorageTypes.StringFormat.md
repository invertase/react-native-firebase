# Interface: StringFormat

[FirebaseStorageTypes](/reference/storage/modules/FirebaseStorageTypes.md).StringFormat

Possible string formats used for uploading via `StorageReference.putString()`

```js
firebase.storage.StringFormat;
```

## Table of contents

### Properties

- [BASE64](/reference/storage/interfaces/FirebaseStorageTypes.StringFormat.md#base64)
- [BASE64URL](/reference/storage/interfaces/FirebaseStorageTypes.StringFormat.md#base64url)
- [DATA\_URL](/reference/storage/interfaces/FirebaseStorageTypes.StringFormat.md#data_url)
- [RAW](/reference/storage/interfaces/FirebaseStorageTypes.StringFormat.md#raw)

## Properties

### BASE64

• **BASE64**: ``"base64"``

Base64 string format.

Learn more about Base64 [on the Mozilla Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding)

#### Usage

```js
firebase.storage.StringFormat.BASE64;
```

#### Example String Format

```js
const sampleString = 'PEZvbyBCYXI+';
```

#### Defined in

[index.d.ts:103](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L103)

___

### BASE64URL

• **BASE64URL**: ``"base64url"``

Base64Url string format.

#### Usage

```js
firebase.storage.StringFormat.BASE64URL;
```

#### Example String Format

```js
const sampleString = 'PEZvbyBCYXI-';
```

#### Defined in

[index.d.ts:121](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L121)

___

### DATA\_URL

• **DATA\_URL**: ``"data_url"``

Data URL string format.

#### Usage

```js
firebase.storage.StringFormat.DATA_URL;
```

#### Example String Format

```js
const sampleString = 'data:text/plain;base64,PEZvbyBCYXI+';
```

#### Defined in

[index.d.ts:138](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L138)

___

### RAW

• **RAW**: ``"raw"``

Raw string format.

#### Usage

```js
firebase.storage.StringFormat.RAW;
```

#### Example String Format

```js
const sampleString = '<Foo Bar>';
```

#### Defined in

[index.d.ts:83](https://github.com/invertase/react-native-firebase/blob/c9b695aa8/packages/storage/lib/index.d.ts#L83)
