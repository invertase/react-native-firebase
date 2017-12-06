export default function addTests({ describe, it, firebase }) {
  describe('Crashlytics', () => {
    it('log: it should log without error', () => {
      return new Promise((resolve) => {
        firebase.native.fabric.crashlytics().log('Test log');
        resolve();
      });
    });

    it('recordError: it should record an error without error', () => {
      return new Promise((resolve) => {
        firebase.native.fabric.crashlytics().recordError(1234, 'Test error');
        resolve();
      });
    });

    it('setBoolValue: it should set a boolean value without error', () => {
      return new Promise((resolve) => {
        firebase.native.fabric.crashlytics().setBoolValue('boolKey', true);
        resolve();
      });
    });

    it('setFloatValue: it should set a float value without error', () => {
      return new Promise((resolve) => {
        firebase.native.fabric.crashlytics().setFloatValue('floatKey', 1.23);
        resolve();
      });
    });

    it('setIntValue: it should set an integer value without error', () => {
      return new Promise((resolve) => {
        firebase.native.fabric.crashlytics().setIntValue('intKey', 123);
        resolve();
      });
    });

    it('setStringValue: it should set a string value without error', () => {
      return new Promise((resolve) => {
        firebase.native.fabric.crashlytics().setStringValue('stringKey', 'test');
        resolve();
      });
    });

    it('setUserIdentifier: it should set the user ID without error', () => {
      return new Promise((resolve) => {
        firebase.native.fabric.crashlytics().setUserIdentifier('1234');
        resolve();
      });
    });
  });
}
