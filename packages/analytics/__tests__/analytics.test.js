import { firebase } from '../lib';

describe('Analytics', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      expect(app.analytics).toBeDefined();
      expect(app.analytics().app).toEqual(app);
    });

    it('throws if non default app arg provided to firebase.analytics(APP)', () => {
      const app = firebase.app('secondaryFromNative');
      try {
        firebase.analytics(app);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        expect(e.message).toMatch(
          'You attempted to call "firebase.analytics(app)" but; analytics does not support multiple Firebase Apps.',
        );

        expect(e.message).toMatch(
          'Ensure the app provided is the default Firebase app only and not the "secondaryFromNative" app.',
        );

        return Promise.resolve();
      }
    });

    it('throws if analytics access from a non default app', () => {
      const app = firebase.app('secondaryFromNative');
      try {
        app.analytics();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        // prettier-ignore
        expect(e.message).toMatch(
          "You attempted to call \"firebase.app('secondaryFromNative').analytics\" but; analytics does not support multiple Firebase Apps.",
        );

        expect(e.message).toMatch('Ensure you access analytics from the default application only.');
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
        expect(e.message).toEqual(
          "firebase.analytics().logEvent(*) 'name' expected a string value.",
        );
        return Promise.resolve();
      }
    });

    it('errors if params is not an object', () => {
      try {
        firebase.analytics().logEvent('invertase_event', 'foobar');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.analytics().logEvent(_, *) 'params' expected an object value.",
        );

        return Promise.resolve();
      }
    });

    it('errors on using a reserved name', () => {
      try {
        firebase.analytics().logEvent('session_start');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.analytics().logEvent(*) 'name' the event name 'session_start' is reserved and can not be used.",
        );
        return Promise.resolve();
      }
    });

    it('errors if name not alphanumeric', () => {
      try {
        firebase.analytics().logEvent('!@£$%^&*');
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.analytics().logEvent(*) 'name' invalid event name '!@£$%^&*'. Names should contain 1 to 32 alphanumeric characters or underscores.",
        );
        return Promise.resolve();
      }
    });

    it('errors if more than 25 params provided', () => {
      try {
        firebase.analytics().logEvent('invertase', Object.assign({}, new Array(26).fill(1)));
        return Promise.reject(new Error('Did not throw.'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.analytics().logEvent(_, *) 'params' maximum number of parameters exceeded (25).",
        );
        return Promise.resolve();
      }
    });

    describe('setAnalyticsCollectionEnabled()', () => {
      it('throws if not a boolean', () => {
        try {
          firebase.analytics().setAnalyticsCollectionEnabled('foo');
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          expect(e.message).toEqual(
            "firebase.analytics().setAnalyticsCollectionEnabled(*) 'enabled' expected a boolean value.",
          );
          return Promise.resolve();
        }
      });
    });
  });
});
