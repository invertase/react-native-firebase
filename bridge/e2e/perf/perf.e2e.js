describe('perf()', () => {
  describe('setPerformanceCollectionEnabled()', () => {
    it('true', async () => {
      await firebase.perf().setPerformanceCollectionEnabled(true);
    });

    it('false', async () => {
      await firebase.perf().setPerformanceCollectionEnabled(false);
    });

    xit('errors if not boolean', async () => {
      // TODO add validations to lib
      await firebase.perf().setPerformanceCollectionEnabled();
    });
  });

  describe('newTrace()', () => {
    it('returns an instance of Trace', async () => {
      const trace = firebase.perf().newTrace('foo');
      trace.constructor.name.should.be.equal('Trace');
    });

    xit('errors if identifier not a string', async () => {
      // TODO add validations to lib
      try {
        firebase.perf().newTrace([1, 2, 3, 4]);
      } catch (e) {
        return undefined;
      }

      throw new Error('Trace did not error on invalid identifier');
    });
  });
});
