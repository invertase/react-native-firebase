function performanceTests({ describe, it, firebase }) {
  describe('Performance Monitoring', () => {
    it('it should return a new Task instance', () => {
      const trace = firebase.native.perf().newTrace('foo');

      trace.should.be.an.Object();
      trace.should.have.a.property('start').which.is.a.Function();
      trace.should.have.a.property('incrementCounter').which.is.a.Function();
      trace.should.have.a.property('stop').which.is.a.Function();

      return Promise.resolve();
    });

    it('it should start an instance, increment and stop', () => {
      const trace = firebase.native.perf().newTrace('bar');
      trace.start();
      trace.incrementCounter('foobar');
      trace.stop();

      return Promise.resolve();
    });

    it('it should disable and enable performance monitoring', () => {
      firebase.native.perf().setPerformanceCollectionEnabled(false);
      firebase.native.perf().setPerformanceCollectionEnabled(true);

      return Promise.resolve();
    });
  });
}

export default performanceTests;
