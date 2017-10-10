# Dynamic Links

[Firebase Dynamic Links](https://firebase.google.com/docs/dynamic-links/) allows you to create and receive links on both Android and iOS platforms. Assuming the installation instructions have been followed, Firebase Dynamic Links is ready to go.


All Dynamic Links operations are accessed via `firebase.links()`

## Create Dynamic Links

RNFirebase mimics [Firebase's REST API](https://firebase.google.com/docs/dynamic-links/rest) for Dynamic Links creation.
The differences from the REST API are:
1. The input for the methods is a javascript object instead of a JSON object.
2. The response contains the URL string only.
3. There is no `dynamicLinkInfo` element. Instead, all of the elements under it were moved to be under the top-level.

### Methods

#### `createDynamicLink(parameters: Object): Promise<String>`

Creates a long dynamic link.

```javascript
firebase.links().createDynamicLink({
  dynamicLinkDomain: "abc123.app.goo.gl",
  link: "https://example.com?param1=foo&param2=bar",
  androidInfo: {
    androidPackageName: "com.example.android"
  },
  iosInfo: {
    iosBundleId: "com.example.ios"
  }
}).
then((url) => {
  // ...
});
```

#### `createShortDynamicLink(parameters: Object): Promise<String>`

Creates a short dynamic link.

```javascript
firebase.links().createShortDynamicLink({
  dynamicLinkDomain: "abc123.app.goo.gl",
  link: "https://example.com?param1=foo&param2=bar",
  androidInfo: {
    androidPackageName: "com.example.android"
  },
  iosInfo: {
    iosBundleId: "com.example.ios"
  }
}).
then((url) => {
  // ...
});
```
### Parameters

Only the following parameters are currently supported:

```javascript
{
  dynamicLinkDomain: 'string',
  link: 'string',
  androidInfo: {
    androidPackageName: 'string',
    androidFallbackLink: 'string',
    androidMinPackageVersionCode: 'string',
    androidLink: 'string',
  },
  iosInfo: {
    iosBundleId: 'string',
    iosFallbackLink: 'string',
    iosCustomScheme: 'string',
    iosIpadFallbackLink: 'string',
    iosIpadBundleId: 'string',
    iosAppStoreId: 'string',
  },
  socialMetaTagInfo: {
    socialTitle: 'string',
    socialDescription: 'string',
    socialImageLink: 'string',
  },
  suffix: {
    option: 'string',
  },
}
```
**please note:**
1. dynamicLinkDomain and link are mandatory fields. In addition, when using `androidInfo` or `iosInfo`, `androidPackageName` and `iosBundleId` are mandatory (respectively).
2. In oppose to the REST API, There is no `dynamicLinkInfo` element. Instead, all of the elements under it were moved to be under the top-level.

For more information [see reference](https://firebase.google.com/docs/reference/dynamic-links/link-shortener)

## Receive Dynamic Links

### Methods

#### `getInitialLink(): Promise<String>`

Call getInitialLink to access the URL that the app has been launched from. If the app was not launched from a URL, the return value is null.

```javascript
firebase.links().getInitialLink().then((url) => {
  //...
});
```

#### `onLink(listener: Function<String>): Function`

On a new URL, the payload URL is passed to the listener callback. This method is only triggered when the app is running. Use getInitialLink for URLs which cause the app to open.
In order to subscribe to the listener, call to the method with a callback and save the returned function.
When you want to unsubscribe, just call the function that returned at subscription.

```javascript
// Subscribe
const unsubscribe = firebase.links().onLink((url) => {
  //...
});

// Unsubscribe
unsubscribe();
```
