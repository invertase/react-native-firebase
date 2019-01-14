const eventName = 'pong';
const eventName2 = 'ping';
const eventBody = {
  foo: 'bar',
};

describe('Utils -> EventEmitter', () => {
  android.describe('ReactNativeFirebaseEventEmitter', () => {
    it('queues events before app is ready', async () => {
      const {
        eventsPing,
        eventsNotifyReady,
        eventsGetListeners,
        eventsAddAndroidListener,
        eventsRemoveAndroidListener,
      } = NativeModules.RNFBUtils;
      await eventsNotifyReady(false);

      let readyToResolve = false;
      const { resolve, reject, promise } = Promise.defer();
      const emitter = new NativeEventEmitter(NativeModules.RNFBUtils);

      eventsAddAndroidListener(eventName);
      emitter.addListener(eventName, event => {
        event.foo.should.equal(eventBody.foo);
        if (!readyToResolve) {
          return reject(new Error('Event was received before being ready!'));
        }

        return resolve();
      });

      await eventsPing(eventName, eventBody);
      await sleep(100);
      const nativeListenersBefore = await eventsGetListeners();
      nativeListenersBefore.events.pong.should.equal(1);

      readyToResolve = true;
      await eventsNotifyReady(true);

      await promise;
      emitter.removeAllListeners(eventName);

      await eventsRemoveAndroidListener(eventName, true);
      const nativeListenersAfter = await eventsGetListeners();

      should.equal(nativeListenersAfter.events.pong, undefined);
    });

    it('queues events before a js listener is registered', async () => {
      const {
        eventsPing,
        eventsNotifyReady,
        eventsGetListeners,
        eventsAddAndroidListener,
        eventsRemoveAndroidListener,
      } = NativeModules.RNFBUtils;
      await eventsNotifyReady(true);
      let readyToResolve = false;
      const { resolve, reject, promise } = Promise.defer();
      const emitter = new NativeEventEmitter(NativeModules.RNFBUtils);

      emitter.addListener(eventName2, event => {
        event.foo.should.equal(eventBody.foo);
        if (!readyToResolve) {
          return reject(new Error('Event was received before being ready!'));
        }

        return resolve();
      });

      await eventsPing(eventName2, eventBody);
      await sleep(100);
      const nativeListenersBefore = await eventsGetListeners();
      should.equal(nativeListenersBefore.events.ping, undefined);

      readyToResolve = true;
      eventsAddAndroidListener(eventName2);

      await promise;
      emitter.removeAllListeners(eventName2);

      await eventsRemoveAndroidListener(eventName2, true);
      const nativeListenersAfter = await eventsGetListeners();

      should.equal(nativeListenersAfter.events.ping, undefined);
    });
  });
});
