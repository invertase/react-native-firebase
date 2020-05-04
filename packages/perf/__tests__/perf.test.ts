import perf, { firebase } from '../lib';

describe('Performance Monitoring', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      expect(app.perf).toBeDefined();
      expect(app.perf().app).toEqual(app);
    });
  });

  describe('setPerformanceCollectionEnabled', () => {
    it('errors if not boolean', () => {
      expect(() => {
        // @ts-ignore
        perf().setPerformanceCollectionEnabled();
      }).toThrow('must be a boolean');
    });
  });

  describe('newTrace()', () => {
    it('returns an instance of Trace', () => {
      const trace = perf().newTrace('invertase');
      expect(trace.constructor.name).toEqual('Trace');

      // @ts-ignore
      expect(trace._identifier).toEqual('invertase');
    });

    it('errors if identifier not a string', () => {
      try {
        // @ts-ignore
        perf().newTrace(1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.perf().newTrace(*) 'identifier' must be a string with a maximum length of 100 characters.",
        );
        return Promise.resolve();
      }
    });

    it('errors if identifier length > 100', () => {
      try {
        perf().newTrace(new Array(101).fill('i').join(''));
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.perf().newTrace(*) 'identifier' must be a string with a maximum length of 100 characters.",
        );
        return Promise.resolve();
      }
    });
  });

  describe('newHttpMetric()', () => {
    it('returns an instance of HttpMetric', async () => {
      const metric = perf().newHttpMetric('https://invertase.io', 'GET');
      expect(metric.constructor.name).toEqual('HttpMetric');

      // @ts-ignore
      expect(metric._url).toEqual('https://invertase.io');

      // @ts-ignore
      expect(metric._httpMethod).toEqual('GET');
    });

    it('errors if url not a string', async () => {
      try {
        // @ts-ignore
        perf().newHttpMetric(1337, 7331);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        expect(e.message).toEqual("firebase.perf().newHttpMetric(*, _) 'url' must be a string.");
        return Promise.resolve();
      }
    });

    it('errors if httpMethod not a string', async () => {
      try {
        // @ts-ignore
        perf().newHttpMetric('https://invertase.io', 1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.perf().newHttpMetric(_, *) 'httpMethod' must be one of CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE.",
        );
        return Promise.resolve();
      }
    });

    it('errors if httpMethod not a valid type', async () => {
      try {
        // @ts-ignore
        perf().newHttpMetric('https://invertase.io', 'FIRE');
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.perf().newHttpMetric(_, *) 'httpMethod' must be one of CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE.",
        );
        return Promise.resolve();
      }
    });
  });

  describe('setPerformanceCollectionEnabled()', () => {
    it('errors if not boolean', async () => {
      try {
        // @ts-ignore
        firebase.perf().setPerformanceCollectionEnabled();
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.perf().setPerformanceCollectionEnabled(*) 'enabled' must be a boolean.",
        );
        return Promise.resolve();
      }
    });
  });
});
