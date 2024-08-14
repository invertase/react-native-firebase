/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const eventName = 'pong';
const eventName2 = 'ping';
const eventBody = {
  foo: 'bar',
};

describe('Core -> EventEmitter', function () {
  describe('ReactNativeFirebaseEventEmitter', function () {
    it('queues events before app is ready', async function () {
      const { eventsPing, eventsNotifyReady, eventsGetListeners } = NativeModules.RNFBAppModule;
      await eventsNotifyReady(false);

      let readyToResolve = false;
      const { resolve, reject, promise } = Promise.defer();
      const emitter = NativeEventEmitter;

      emitter.addListener(
        eventName,
        event => {
          try {
            should.notEqual(event.foo, null);
            event.foo.should.equal(eventBody.foo);
          } catch (e) {
            return reject(e);
          }
          if (!readyToResolve) {
            return reject(new Error('Event was received before being ready!'));
          }
          return resolve();
        },
        undefined,
        true,
      );

      await eventsNotifyReady(false);
      await eventsPing(eventName, eventBody);
      await Utils.sleep(100);
      const nativeListenersBefore = await eventsGetListeners();
      nativeListenersBefore.events.pong.should.equal(1);

      readyToResolve = true;
      await eventsNotifyReady(true);

      await promise;
      emitter.removeAllListeners(eventName);

      const nativeListenersAfter = await eventsGetListeners();

      should.equal(nativeListenersAfter.events.pong, undefined);
    });

    it('can send and receive lots of events', async function () {
      const { eventsPing, eventsNotifyReady } = NativeModules.RNFBAppModule;
      await eventsNotifyReady(true);
      const { resolve, reject, promise } = Promise.defer();
      const emitter = NativeEventEmitter;
      let eventCount = 0;
      emitter.addListener(eventName, event => {
        try {
          should.notEqual(event.foo, null);
          event.foo.should.equal(eventBody.foo);
        } catch (e) {
          return reject(e);
        }

        eventCount++;
        if (eventCount === 100) {
          return resolve();
        }
      });
      await Utils.sleep(100);
      for (let i = 0; i < 100; i++) {
        eventsPing(eventName, eventBody);
      }

      await promise;
      emitter.removeAllListeners(eventName);
    });

    it('queues events before a js listener is registered', async function () {
      const { eventsPing, eventsNotifyReady, eventsGetListeners, eventsRemoveListener } =
        NativeModules.RNFBAppModule;
      await eventsNotifyReady(true);
      const { resolve, reject, promise } = Promise.defer();
      const emitter = NativeEventEmitter;
      await eventsPing(eventName2, eventBody);

      const subscription = emitter.addListener(eventName2, event => {
        try {
          should.notEqual(event.foo, null);
          event.foo.should.equal(eventBody.foo);
        } catch (e) {
          return reject(e);
        }
        return resolve();
      });
      await promise;
      subscription.remove();

      await eventsRemoveListener(eventName2, true);
      const nativeListenersAfter = await eventsGetListeners();
      should.equal(nativeListenersAfter.events.ping, undefined);
    });
  });
});
