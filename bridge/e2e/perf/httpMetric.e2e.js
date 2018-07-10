describe('perf()', () => {
  describe('HttpMetric', () => {
    it('start() & stop()', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.stop();
    });

    it('getAttribute() should return null', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      const value = await httpMetric.getAttribute('foo');
      should.equal(value, null);
      await httpMetric.stop();
    });

    xit('getAttribute() should return string value', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.putAttribute('foo', 'bar');
      const value = await httpMetric.getAttribute('foo');
      should.equal(value, 'bar');
      await httpMetric.stop();
    });

    xit('putAttribute()', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.putAttribute('foo', 'bar');
      const value = await httpMetric.getAttribute('foo');
      value.should.equal('bar');
      await httpMetric.stop();
    });

    xit('getAttributes()', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.putAttribute('foo', 'bar');
      await httpMetric.putAttribute('bar', 'baz');
      const value = await httpMetric.getAttributes();
      value.should.deepEqual({
        foo: 'bar',
        bar: 'baz',
      });
      await httpMetric.stop();
    });

    xit('removeAttribute()', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.putAttribute('foobar', 'bar');
      const value = await httpMetric.getAttribute('foobar');
      value.should.equal('bar');
      await httpMetric.removeAttribute('foobar');
      const removed = await httpMetric.getAttribute('foobar');
      should.equal(removed, null);
      await httpMetric.stop();
    });

    it('setHttpResponseCode()', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.setHttpResponseCode(500);
      await httpMetric.stop();
    });

    it('setRequestPayloadSize()', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.setRequestPayloadSize(1234567);
      await httpMetric.stop();
    });

    it('setResponseContentType()', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.setResponseContentType('application/foobar');
      await httpMetric.stop();
    });

    it('setResponsePayloadSize()', async () => {
      const httpMetric = firebase.perf().newHttpMetric('http://foo.com', 'GET');
      await httpMetric.start();
      await httpMetric.setResponsePayloadSize(123456789);
      await httpMetric.stop();
    });
  });
});
