export default function addTests({ describe, it, firebase }) {
  describe('Analytics', () => {
    it('logEvent: it should log a text event without error', () =>
      new Promise(resolve => {
        firebase.native.analytics().logEvent('test_event');
        resolve();
      }));

    it('logEvent: it should log a text event with parameters without error', () =>
      new Promise(resolve => {
        firebase.native.analytics().logEvent('test_event', {
          boolean: true,
          number: 1,
          string: 'string',
        });
        resolve();
      }));

    it('logEvent should error if name is not a string', () => {
      (() => {
        firebase.native.analytics().logEvent(123456);
      }).should.throw(
        `analytics.logEvent(): First argument 'name' is required and must be a string value.`
      );
    });

    it('logEvent should error if params is not an object', () => {
      (() => {
        firebase.native
          .analytics()
          .logEvent('test_event', 'this should be an object');
      }).should.throw(
        `analytics.logEvent(): Second optional argument 'params' must be an object if provided.`
      );
    });

    it('setAnalyticsCollectionEnabled: it should run without error', () =>
      new Promise(resolve => {
        firebase.native.analytics().setAnalyticsCollectionEnabled(true);
        resolve();
      }));

    it('setCurrentScreen: it should run without error', () =>
      new Promise(resolve => {
        firebase.native
          .analytics()
          .setCurrentScreen('test screen', 'test class override');
        resolve();
      }));

    it('setMinimumSessionDuration: it should run without error', () =>
      new Promise(resolve => {
        firebase.native.analytics().setMinimumSessionDuration(10000);
        resolve();
      }));

    it('setSessionTimeoutDuration: it should run without error', () =>
      new Promise(resolve => {
        firebase.native.analytics().setSessionTimeoutDuration(1800000);
        resolve();
      }));

    it('setUserId: it should run without error', () =>
      new Promise(resolve => {
        firebase.native.analytics().setUserId('test-id');
        resolve();
      }));

    it('setUserProperty: it should run without error', () =>
      new Promise(resolve => {
        firebase.native
          .analytics()
          .setUserProperty('test-property', 'test-value');
        resolve();
      }));
  });
}
