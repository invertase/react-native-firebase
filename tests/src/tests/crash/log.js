export default function addTests({ describe, it, firebase }) {

  describe('API', () => {
    it('it should set collection enabled/disabled', () => {
      return new Promise((resolve) => {
        firebase.native.crash().setCrashCollectionEnabled(false);
        firebase.native.crash().setCrashCollectionEnabled(true);
        resolve();
      });
    });

    it('it should return whether crash reporting is enabled', () => {
      return new Promise((resolve) => {
        firebase.native.crash().isCrashCollectionEnabled()
          .then((enabled) => {
            enabled.should.be.a.Boolean();
            resolve();
          });
      });
    });
  });

  describe('Log', () => {
    it('log: it should log without error', () => {
      return new Promise((resolve) => {
        firebase.native.crash().log('Test log');
        resolve();
      });
    });

    it('logcat: it should log without error', () => {
      return new Promise((resolve) => {
        firebase.native.crash().logcat(0, 'LogTest', 'Test log');
        resolve();
      });
    });
  });
}
