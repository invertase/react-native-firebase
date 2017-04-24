export default function addTests({ describe, it, firebase }) {
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
