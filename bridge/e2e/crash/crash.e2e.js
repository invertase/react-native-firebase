describe.only('crash()', () => {
  describe('setCrashCollectionEnabled()', () => {
    it('true', async () => {
      await firebase.crash().setCrashCollectionEnabled(true);
      await sleep(100);
      const enabled = await firebase.crash().isCrashCollectionEnabled();
      should.equal(enabled, true, 'collection enabled boolean should be true');
    });

    it('false', async () => {
      await firebase.crash().setCrashCollectionEnabled(false);

      // does not exist on ios
      if (device.getPlatform() === 'android') {
        await sleep(150);
        const enabled = await firebase.crash().isCrashCollectionEnabled();
        should.equal(
          enabled,
          false,
          'collection enabled boolean should be false'
        );
      }
    });
  });

  describe('log()', () => {
    it('accepts a string log', async () => {
      await firebase.crash().log('hello world');
      await sleep(50);
    });
  });

  describe('logcat()', () => {
    it('accepts a log level, log tag and message', async () => {
      await firebase.crash().logcat(0, 'HELLO_TAG', 'hello world');
      await sleep(50);
    });
  });

  describe('report()', () => {
    it('accepts an error with customisable stack size', async () => {
      const error = new Error('Oh noes!');
      await firebase.crash().report(error);
      await firebase.crash().report(error, 5);
      error.code = 'NETWORK_ERROR';
      await firebase.crash().report(error);
      delete error.message;
      await firebase.crash().report(error);
      await sleep(50);
    });
  });
});
