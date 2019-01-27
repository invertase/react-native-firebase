// TODO all try catch tests can give false positives as there's no
// TODO checks that it actually threw, only does tests in the catch

describe('analytics()', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      should.exist(app.analytics);
      app.analytics().logEvent.should.be.a.Function();
    });

    xit('throws if app arg provided to firebase.analytics(APP)', {
      // TODO
    });

    xit('throws if args provided to firebase.app().analytics(ARGS)', {
      // TODO
    });
  });

  describe('logEvent()', () => {
    xit('errors on using a reserved name', () => {
      try {
        firebase.analytics().logEvent('session_start');
      } catch (e) {
        e.message.should.containEql('reserved event');
      }
    });

    xit('errors if name not alphanumeric', () => {
      try {
        firebase.analytics().logEvent('!@£$%^&*');
      } catch (e) {
        e.message.should.containEql('is invalid');
      }
    });

    xit('errors if more than 25 params provided', () => {
      try {
        firebase.analytics().logEvent('fooby', {
          1: 1,
          2: 2,
          3: 3,
          4: 4,
          5: 5,
          6: 6,
          7: 7,
          8: 8,
          9: 9,
          10: 10,
          11: 11,
          12: 12,
          13: 13,
          14: 14,
          15: 15,
          16: 16,
          17: 17,
          18: 18,
          19: 19,
          20: 20,
          21: 21,
          22: 22,
          23: 23,
          24: 24,
          25: 25,
          26: 26,
        });
      } catch (e) {
        e.message.should.containEql('Maximum number of parameters exceeded');
      }
    });

    it('errors if name is not a string', () => {
      (() => {
        firebase.analytics().logEvent(123456);
      }).should.throw(
        `analytics.logEvent(): First argument 'name' is required and must be a string value.`,
      );
    });

    it('errors if params is not an object', () => {
      (() => {
        firebase.analytics().logEvent('test_event', 'this should be an object');
      }).should.throw(
        `analytics.logEvent(): Second optional argument 'params' must be an object if provided.`,
      );
    });

    it('log an event without parameters', async () => {
      await firebase.analytics().logEvent('test_event');
    });

    it('log an event with parameters', async () => {
      await firebase.analytics().logEvent('test_event', {
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

  describe('setCurrentScreen()', () => {
    it('screenName only', async () => {
      await firebase.analytics().setCurrentScreen('test screen');
    });

    it('screenName with screenClassOverride', async () => {
      await firebase.analytics().setCurrentScreen('test screen', 'test class override');
    });

    xit('errors if screenName not a string', () => {
      // TODO needs validations adding to lib
    });

    xit('errors if screenClassOverride not a string', () => {
      // TODO needs validations adding to lib
    });
  });

  describe('setMinimumSessionDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setMinimumSessionDuration();
    });

    it('custom duration', async () => {
      await firebase.analytics().setMinimumSessionDuration(10001);
    });
  });

  describe('setSessionTimeoutDuration()', () => {
    it('default duration', async () => {
      await firebase.analytics().setSessionTimeoutDuration();
    });

    it('custom duration', async () => {
      await firebase.analytics().setSessionTimeoutDuration(1800001);
    });
  });

  describe('setUserId()', () => {
    // nulls remove the field on firebase
    it('allows a null values to be set', async () => {
      await firebase.analytics().setUserId(null);
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserId('test-id');
    });

    xit('rejects none string none null values', async () => {
      try {
        await firebase.analytics().setUserId(33.3333);
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });
  });

  describe('setUserProperty()', () => {
    // nulls remove the field on firebase
    it('allows a null values to be set', async () => {
      await firebase.analytics().setUserProperty('fooby', null);
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperty('fooby2', 'test-id');
    });

    xit('rejects none string none null values', async () => {
      try {
        await firebase.analytics().setUserProperty('fooby3', 33.3333);
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });

    xit('errors if property name not a string', () => {
      // TODO needs validations adding to lib
    });
  });

  describe('setUserProperties()', () => {
    // nulls remove the field on firebase
    it('allows a null values to be set', async () => {
      await firebase.analytics().setUserProperties({ fooby: null });
    });

    it('accepts string values', async () => {
      await firebase.analytics().setUserProperties({ fooby2: 'test-id' });
    });

    xit('rejects none string none null values', async () => {
      try {
        await firebase.analytics().setUserProperties({ fooby3: 33.3333 });
      } catch (e) {
        e.message.should.containEql('must be a string');
      }
    });
  });
});
