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
    it('errors on using a reserved name', () => {
      try {
        firebase.analytics().logEvent('session_start');
      } catch (e) {
        e.message.should.containEql('reserved event');
      }
    });

    it('errors if name not alphanumeric', () => {
      try {
        firebase.analytics().logEvent('!@£$%^&*');
      } catch (e) {
        e.message.should.containEql('is invalid');
      }
    });

    it('errors if more than 25 params provided', () => {
      try {
        firebase.analytics().logEvent('invertase', Object.assign({}, new Array(26).fill(1)));
      } catch (e) {
        e.message.should.containEql('Maximum number of parameters exceeded');
      }
    });

    it('errors if name is not a string', () => {
      (() => {
        firebase.analytics().logEvent(13377331);
      }).should.throw(
        `analytics.logEvent(): First argument 'name' is required and must be a string value.`,
      );
    });

    it('errors if params is not an object', () => {
      (() => {
        firebase.analytics().logEvent('invertase_event', 'this should be an object');
      }).should.throw(
        `analytics.logEvent(): Second optional argument 'params' must be an object if provided.`,
      );
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
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });

    it('errors if screenClassOverride not a string', async () => {
      try {
        await firebase.analytics().setCurrentScreen('invertase screen', 666.1337);
      } catch (e) {
        e.message.should.containEql('must be undefined or a string');
      }
    });
  });

  describe('setMinimumSessionDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setMinimumSessionDuration();
    });

    it('custom duration', async () => {
      await firebase.analytics().setMinimumSessionDuration(1337);
    });
  });

  describe('setSessionTimeoutDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setSessionTimeoutDuration();
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

    it('rejects none string none null values', async () => {
      try {
        await firebase.analytics().setUserId(666.1337);
      } catch (e) {
        e.message.should.containEql('must be a string');
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

    it('rejects none string none null values', async () => {
      try {
        await firebase.analytics().setUserProperty('invertase3', 33.3333);
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });

    it('errors if property name is not a string', async () => {
      try {
        await firebase.analytics().setUserProperty(1337, 'invertase');
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });
  });

  describe('setUserProperties()', () => {
    it('errors if arg is not an object', async () => {
      try {
        await firebase.analytics().setUserProperties(1337);
      } catch (e) {
        e.message.should.containEql('must be an object');
      }
    });

    it('allows null values to be set', async () => {
      await firebase.analytics().setUserProperties({ invertase: null });
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperties({ invertase2: 'rn-firebase' });
    });
  });
});
