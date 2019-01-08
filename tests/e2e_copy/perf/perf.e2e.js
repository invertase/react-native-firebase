describe('perf()', () => {
  describe('setPerformanceCollectionEnabled()', () => {
    it('true', async () => {
      await firebase.perf().setPerformanceCollectionEnabled(true);
      await sleep(2000);
    });

    it('false', async () => {
      await firebase.perf().setPerformanceCollectionEnabled(false);
      await sleep(2000);
      await firebase.perf().setPerformanceCollectionEnabled(true);
      await sleep(2000);
      await device.launchApp({ newInstance: true });
    });

    it('errors if not boolean', async () => {
      (() => firebase.perf().setPerformanceCollectionEnabled()).should.throw(
        'firebase.perf().setPerformanceCollectionEnabled() requires a boolean value'
      );
    });
  });

  describe('newTrace()', () => {
    it('returns an instance of Trace', async () => {
      const trace = firebase.perf().newTrace('foo');
      trace.constructor.name.should.be.equal('Trace');
    });

    it('errors if identifier not a string', async () => {
      (() => firebase.perf().newTrace([1, 2, 3, 4])).should.throw(
        'firebase.perf().newTrace() requires a string value'
      );
    });
  });

  describe('newHttpMetric()', () => {
    it('returns an instance of HttpMetric', async () => {
      const trace = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      trace.constructor.name.should.be.equal('HttpMetric');
    });

    it('errors if url/httpMethod not a string', async () => {
      (() => firebase.perf().newHttpMetric(123, [1, 2])).should.throw(
        'firebase.perf().newHttpMetric() requires url and httpMethod string values'
      );
    });

    it('errors if httpMethod not a valid type', async () => {
      (() => firebase.perf().newHttpMetric('foo', 'FOO')).should.throw(); // TODO error
    });
  });
});
