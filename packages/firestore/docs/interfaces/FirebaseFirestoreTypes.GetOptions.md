# Interface: GetOptions

[FirebaseFirestoreTypes](/reference/firestore/modules/FirebaseFirestoreTypes.md).GetOptions

An options object that configures the behavior of get() calls on DocumentReference and Query.
By providing a GetOptions object, these methods can be configured to fetch results only from the
server, only from the local cache or attempt to fetch results from the server and fall back to the
cache (which is the default).

## Table of contents

### Properties

- [source](/reference/firestore/interfaces/FirebaseFirestoreTypes.GetOptions.md#source)

## Properties

### source

• **source**: ``"default"`` \| ``"server"`` \| ``"cache"``

Describes whether we should get from server or cache.

Setting to `default` (or not setting at all), causes Firestore to try to retrieve an up-to-date (server-retrieved)
snapshot, but fall back to returning cached data if the server can't be reached.

Setting to `server` causes Firestore to avoid the cache, generating an error if the server cannot be reached. Note
that the cache will still be updated if the server request succeeds. Also note that latency-compensation still
takes effect, so any pending write operations will be visible in the returned data (merged into the server-provided data).

Setting to `cache` causes Firestore to immediately return a value from the cache, ignoring the server completely
(implying that the returned value may be stale with respect to the value on the server.) If there is no data in the
cache to satisfy the `get()` call, `DocumentReference.get()` will return an error and `QuerySnapshot.get()` will return an
empty `QuerySnapshot` with no documents.

#### Defined in

[index.d.ts:881](https://github.com/invertase/react-native-firebase/blob/9f3f84763/packages/firestore/lib/index.d.ts#L881)
