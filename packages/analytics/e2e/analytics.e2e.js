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

describe('analytics()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.analytics);
      app.analytics().logEvent.should.be.a.Function();
      app.analytics().emitter.should.be.a.Object();
    });

    it('throws if non default app arg provided to firebase.analytics(APP)', () => {
      const app = firebase.app('secondaryFromNative');
      try {
        firebase.analytics(app);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('does not support multiple Firebase Apps');
        return Promise.resolve();
      }
    });

    it('throws if analytics access from a non default app', () => {
      const app = firebase.app('secondaryFromNative');
      try {
        app.analytics();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('does not support multiple Firebase Apps');
        return Promise.resolve();
      }
    });

    // TODO in app/registry/namespace.js - if (!hasCustomUrlOrRegionSupport)
    xit('throws if args provided to firebase.app().analytics(ARGS)', () => {
      try {
        firebase.app().analytics('foo', 'arg2');
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('does not support multiple Firebase Apps');
        return Promise.resolve();
      }
    });
  });

  describe('logEvent()', () => {
    it('errors if name is not a string', () => {
      try {
        firebase.analytics().logEvent(123);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'name' expected a string value");
        return Promise.resolve();
      }
    });

    it('errors if params is not an object', () => {
      try {
        firebase.analytics().logEvent('invertase_event', 'foobar');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'params' expected an object value");
        return Promise.resolve();
      }
    });

    it('errors on using a reserved name', () => {
      try {
        firebase.analytics().logEvent('session_start');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql(
          "'name' the event name 'session_start' is reserved and can not be used",
        );
        return Promise.resolve();
      }
    });

    it('errors if name not alphanumeric', () => {
      try {
        firebase.analytics().logEvent('!@£$%^&*');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql(`'name' invalid event name '!@£$%^&*'`);
        return Promise.resolve();
      }
    });

    it('errors if more than 25 params provided', () => {
      try {
        firebase.analytics().logEvent('invertase', Object.assign({}, new Array(26).fill(1)));
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'params' maximum number of parameters exceeded (25)");
        return Promise.resolve();
      }
    });

    it('errors if params contains invalid types', () => {
      try {
        firebase.analytics().logEvent('invertase', {
          foo: 'bar',
          bar: {
            baz: 123,
          },
        });
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'params' value for parameter 'bar' is invalid");
        return Promise.resolve();
      }
    });

    it('log an event without parameters', async () => {
      await firebase.analytics().logEvent('invertase_event');
    });

    it('log an event with parameters', async () => {
      await firebase.analytics().logEvent('invertase_event', {
        boolean: true,
        number: 1,
        string: 'string',
      });
    });
  });

  describe('setAnalyticsCollectionEnabled()', () => {
    it('throws if not a boolean', () => {
      try {
        firebase.analytics().setAnalyticsCollectionEnabled('foo');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'enabled' expected a boolean value");
        return Promise.resolve();
      }
    });

    it('true', async () => {
      await firebase.analytics().setAnalyticsCollectionEnabled(true);
    });

    it('false', async () => {
      await firebase.analytics().setAnalyticsCollectionEnabled(false);
    });
  });

  describe('resetAnalyticsData()', () => {
    it('calls native fn without error', async () => {
      await firebase.analytics().resetAnalyticsData();
    });
  });

  describe('setCurrentScreen()', () => {
    it('screenName only', async () => {
      await firebase.analytics().setCurrentScreen('invertase screen');
    });

    it('screenName with screenClassOverride', async () => {
      await firebase.analytics().setCurrentScreen('invertase screen', 'invertase class override');
    });

    it('errors if screenName not a string', async () => {
      try {
        await firebase.analytics().setCurrentScreen(666.1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'screenName' expected a string value");
      }
    });

    it('errors if screenClassOverride not a string', async () => {
      try {
        await firebase.analytics().setCurrentScreen('invertase screen', 666.1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'screenClassOverride' expected a string value");
      }
    });
  });

  describe('setMinimumSessionDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setMinimumSessionDuration();
    });

    it('errors if milliseconds not a number', async () => {
      try {
        await firebase.analytics().setMinimumSessionDuration('123');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'milliseconds' expected a number value");
      }
    });

    it('errors if milliseconds is less than 0', async () => {
      try {
        await firebase.analytics().setMinimumSessionDuration(-100);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'milliseconds' expected a positive number value");
      }
    });

    it('custom duration', async () => {
      await firebase.analytics().setMinimumSessionDuration(1337);
    });
  });

  describe('setSessionTimeoutDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setSessionTimeoutDuration();
    });

    it('errors if milliseconds not a number', async () => {
      try {
        await firebase.analytics().setSessionTimeoutDuration('123');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'milliseconds' expected a number value");
      }
    });

    it('errors if milliseconds is less than 0', async () => {
      try {
        await firebase.analytics().setSessionTimeoutDuration(-100);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'milliseconds' expected a positive number value");
      }
    });

    it('custom duration', async () => {
      await firebase.analytics().setSessionTimeoutDuration(13371337);
    });
  });

  describe('setUserId()', () => {
    it('allows a null values to be set', async () => {
      await firebase.analytics().setUserId(null);
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserId('rn-firebase');
    });

    it('throws if none string none null values', async () => {
      try {
        await firebase.analytics().setUserId(123);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'id' expected a string value");
      }
    });
  });

  describe('setUserProperty()', () => {
    it('allows a null values to be set', async () => {
      await firebase.analytics().setUserProperty('invertase', null);
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperty('invertase2', 'rn-firebase');
    });

    it('throws if name is not a string', async () => {
      try {
        await firebase.analytics().setUserProperty(1337, 'invertase');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'name' expected a string value");
      }
    });

    it('throws if value is invalid', async () => {
      try {
        await firebase.analytics().setUserProperty('invertase3', 33.3333);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'value' expected a string value");
      }
    });
  });

  describe('setUserProperties()', () => {
    it('throws if properties is not an object', async () => {
      try {
        await firebase.analytics().setUserProperties(1337);
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'properties' expected an object of key/value pairs");
      }
    });

    it('throws if property value is invalid', async () => {
      try {
        await firebase.analytics().setUserProperties({
          test: '123',
          foo: {
            bar: 'baz',
          },
        });
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql("'properties' value for parameter 'foo' is invalid");
      }
    });

    it('throws if value is a number', async () => {
      try {
        await firebase.analytics().setUserProperties({ invertase1: 123 });
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        e.message.should.containEql(
          "'properties' value for parameter 'invertase1' is invalid, expected a string.",
        );
      }
    });

    it('allows null values to be set', async () => {
      await firebase.analytics().setUserProperties({ invertase2: null });
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperties({ invertase3: 'rn-firebase' });
    });
  });
});
