# Analytics

Integrating Firebase analytics is simple. A number of methods are provided to help tailor analytics specifically for your
own app. The Firebase SDK includes a number of pre-set events which are automatically handled, and cannot be used with custom `logEvent` events:

```
  'app_clear_data',
  'app_uninstall',
  'app_update',
  'error',
  'first_open',
  'first_visit',
  'first_open_time',
  'first_visit_time',
  'in_app_purchase',
  'notification_dismiss',
  'notification_foreground',
  'notification_open',
  'notification_receive',
  'os_update',
  'session_start',
  'screen_view',
  'user_engagement',
  'ad_impression',
  'ad_click',
  'ad_query',
  'ad_exposure',
  'adunit_exposure',
  'ad_activeiew',
```

#### `logEvent(event: string, params?: Object): void`

Log a custom event with optional params.

```javascript
firebase.analytics().logEvent('clicked_advert', { id: 1337 });
```

#### `setAnalyticsCollectionEnabled(enabled: boolean): void`

Sets whether analytics collection is enabled for this app on this device.

```javascript
firebase.analytics().setAnalyticsCollectionEnabled(false);
```

#### `setCurrentScreen(screenName: string, screenClassOverride?: string): void`

Sets the current screen name, which specifies the current visual context in your app.

> Whilst `screenClassOverride` is optional, it is recommended it is always sent as your current class name, for example on Android it will always show as 'MainActivity' if not specified.

```javascript
firebase.analytics().setCurrentScreen('user_profile');
```

#### `setMinimumSessionDuration(miliseconds: number): void`

Sets the minimum engagement time required before starting a session. The default value is 10000 (10 seconds).

```javascript
firebase.analytics().setMinimumSessionDuration(15000);
```

#### `setSessionTimeoutDuration(miliseconds: number): void`

Sets the duration of inactivity that terminates the current session. The default value is 1800000 (30 minutes).

```javascript
firebase.analytics().setSessionTimeoutDuration(900000);
```

#### `setUserId(id: string): void`

Gives a user a unique identification.

```javascript
const id = firebase.auth().currentUser.uid;

firebase.analytics().setUserId(id);
```

#### `setUserProperty(name: string, value: string): void`

Sets a key/value pair of data on the current user.

```javascript
firebase.analytics().setUserProperty('nickname', 'foobar');
```
