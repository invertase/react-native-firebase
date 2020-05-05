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

      const expectedError = [
        'You attempted to call "firebase.analytics(app)" but; analytics does not support multiple Firebase Apps.',
        '',
        'Ensure the app provided is the default Firebase app only and not the "secondaryFromNative" app.',
      ].join('\r\n');

      // @ts-ignore
      expect(() => firebase.analytics(app)).toThrowError(expectedError);
    });

    it('throws if analytics access from a non default app', () => {
      const app = firebase.app('secondaryFromNative');

      const expectedError = [
        'You attempted to call "firebase.app(\'secondaryFromNative\').analytics" but; analytics does not support multiple Firebase Apps.',
        '',
        'Ensure you access analytics from the default application only.',
      ].join('\r\n');

      expect(() => app.analytics()).toThrowError(expectedError);
    });

    // TODO in app/registry/namespace.js - if (!hasCustomUrlOrRegionSupport)
    xit('throws if args provided to firebase.app().analytics(ARGS)', () => {
      try {
        // @ts-ignore
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
      // @ts-ignore
      expect(() => firebase.analytics().logEvent(123)).toThrowError(
        "firebase.analytics().logEvent(*) 'name' expected a string value.",
      );
    });

    it('errors if params is not an object', () => {
      // @ts-ignore
      expect(() => firebase.analytics().logEvent('invertase_event', 'foobar')).toThrowError(
        "firebase.analytics().logEvent(_, *) 'params' expected an object value.",
      );
    });

    it('errors on using a reserved name', () => {
      expect(() => firebase.analytics().logEvent('session_start')).toThrowError(
        "firebase.analytics().logEvent(*) 'name' the event name 'session_start' is reserved and can not be used.",
      );
    });

    it('errors if name not alphanumeric', () => {
      expect(() => firebase.analytics().logEvent('!@£$%^&*')).toThrowError(
        "firebase.analytics().logEvent(*) 'name' invalid event name '!@£$%^&*'. Names should contain 1 to 32 alphanumeric characters or underscores.",
      );
    });

    it('errors if more than 25 params provided', () => {
      expect(() =>
        firebase.analytics().logEvent('invertase', Object.assign({}, new Array(26).fill(1))),
      ).toThrowError(
        "firebase.analytics().logEvent(_, *) 'params' maximum number of parameters exceeded (25).",
      );
    });

    describe('setAnalyticsCollectionEnabled()', () => {
      it('throws if not a boolean', () => {
        // @ts-ignore
        expect(() => firebase.analytics().setAnalyticsCollectionEnabled('foo')).toThrowError(
          "firebase.analytics().setAnalyticsCollectionEnabled(*) 'enabled' expected a boolean value.",
        );
      });
    });
  });
});
