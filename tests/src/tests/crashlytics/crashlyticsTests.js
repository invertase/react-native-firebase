export default function addTests({ describe, it, firebase }) {
  describe('Crashlytics', () => {
    it('log: it should log without error', () =>
      new Promise(resolve => {
        firebase.native.crashlytics().log('Test log');
        resolve();
      }));

    it('recordError: it should record an error without error', () =>
      new Promise(resolve => {
        firebase.native.crashlytics().recordError(1234, 'Test error');
        resolve();
      }));

    it('setBoolValue: it should set a boolean value without error', () =>
      new Promise(resolve => {
        firebase.native.crashlytics().setBoolValue('boolKey', true);
        resolve();
      }));

    it('setFloatValue: it should set a float value without error', () =>
      new Promise(resolve => {
        firebase.native.crashlytics().setFloatValue('floatKey', 1.23);
        resolve();
      }));

    it('setIntValue: it should set an integer value without error', () =>
      new Promise(resolve => {
        firebase.native.crashlytics().setIntValue('intKey', 123);
        resolve();
      }));

    it('setStringValue: it should set a string value without error', () =>
      new Promise(resolve => {
        firebase.native.crashlytics().setStringValue('stringKey', 'test');
        resolve();
      }));

    it('setUserIdentifier: it should set the user ID without error', () =>
      new Promise(resolve => {
        firebase.native.crashlytics().setUserIdentifier('1234');
        resolve();
      }));
  });
}
