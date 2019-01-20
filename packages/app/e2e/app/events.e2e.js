const eventName = 'pong';
const eventName2 = 'ping';
const eventBody = {
  foo: 'bar',
};

describe.only('Core -> EventEmitter', () => {
  describe('ReactNativeFirebaseEventEmitter', () => {
    it('queues events before app is ready', async () => {
      const {
        eventsPing,
        eventsNotifyReady,
        eventsGetListeners,
        eventsAddListener,
        eventsRemoveListener,
      } = NativeModules.RNFBApp;
      await eventsNotifyReady(false);

      let readyToResolve = false;
      const { resolve, reject, promise } = Promise.defer();
      const emitter = new NativeEventEmitter(NativeModules.RNFBApp);

      eventsAddListener(eventName);
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

      await eventsRemoveListener(eventName, true);
      const nativeListenersAfter = await eventsGetListeners();

      should.equal(nativeListenersAfter.events.pong, undefined);
    });

    it('queues events before a js listener is registered', async () => {
      const {
        eventsPing,
        eventsNotifyReady,
        eventsGetListeners,
        eventsAddListener,
        eventsRemoveListener,
      } = NativeModules.RNFBApp;
      await eventsNotifyReady(true);
      let readyToResolve = false;
      const { resolve, reject, promise } = Promise.defer();
      const emitter = new NativeEventEmitter(NativeModules.RNFBApp);

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
      eventsAddListener(eventName2);

      await promise;
      emitter.removeAllListeners(eventName2);

      await eventsRemoveListener(eventName2, true);
      const nativeListenersAfter = await eventsGetListeners();

      should.equal(nativeListenersAfter.events.ping, undefined);
    });
  });
});
