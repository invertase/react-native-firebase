describe('perf()', () => {
  describe('Trace', () => {
    it('start() & stop()', async () => {
      const trace = firebase.perf().newTrace('bar');
      await trace.start();
      await trace.stop();
    });

    describe('incrementCounter()', () => {
      it('accepts a string event', async () => {
        const trace = firebase.perf().newTrace('bar');
        await trace.start();
        await trace.incrementCounter('fooby');
        await trace.incrementCounter('fooby');
        await trace.incrementCounter('fooby');
        await trace.incrementCounter('fooby');
        await trace.stop();
      });

      xit('errors if event is not a string', async () => {
        const trace = firebase.perf().newTrace('bar');
        await trace.start();
        await trace.incrementCounter([1, 2, 3, 4]);
        await trace.stop();
      });
    });
  });
});
