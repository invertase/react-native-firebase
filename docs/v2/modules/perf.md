# Performance Monitoring

!> Performance monitoring requires react-native-firebase version 1.2.0.

?> Android: If you plan on using this module in your own application, please ensure the optional setup instructions for
[Android](http://invertase.io/react-native-firebase/#/installation-android?id=_4-performance-monitoring-optional) have been followed.

Out of the box, [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon/automatic) monitors a number of
[automatic traces](https://firebase.google.com/docs/perf-mon/automatic) such as app start/background/foreground response times.
You can easily trace your own events with RNFirebase:

## API

#### setPerformanceCollectionEnabled(enabled: `boolean`)

Globally enables or disables performance monitoring capture across the app.

```js
firebase.perf().setPerformanceCollectionEnabled(false); // Disable
```

#### newTrace(id: `string`): `Trace`

Returns a new instance of Trace (see API below). The id is the unique name of something you'd like to run performance
monitoring against.

```js
const trace = firebase.perf().newTrace("test_trace");
```

### Trace

!> Once a trace has been started and stopped, you cannot re-start it in the same app lifecycle.

#### start()

Initializes the trace to start tracing performance to relay back to Firebase.

```js
trace.start();
```

#### incrementCounter(event: string)

Notifies Firebase an event has occured. These events will be visible on Firebase once your trace has stopped.

```js
someCacheService.get('user:123')
  .then((user) => {
    if (user) {
      trace.incrementCounter('user_cache_hit');
    } else {
      trace.incrementCounter('user_cache_missed');
    }
  });
```

#### stop()

Stops performance tracing. The completed trace stats are now sent to Firebase.

?> Results are not realtime. They can take a number of hours to appear in the Firebase console.

```js
trace.stop();
```
