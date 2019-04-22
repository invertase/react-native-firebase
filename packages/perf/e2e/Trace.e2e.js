/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

describe('perf()', () => {
  describe('Trace', () => {
    describe('start()', () => {
      it('correctly starts with internal flag ', async () => {
        const trace = firebase.perf().newTrace('invertase');
        await trace.start();
        should.equal(trace._started, true);
        trace.putAttribute('foo', 'bar');
        trace.putMetric('stars', 9001);
        await Utils.sleep(125);
        await trace.stop();
      });

      it('resolves null if already started', async () => {
        const trace = firebase.perf().newTrace('invertase');
        await trace.start();
        should.equal(trace._started, true);
        should.equal(await trace.start(), null);
        await Utils.sleep(125);
        await trace.stop();
      });
    });

    describe('stop()', () => {
      it('correctly stops with internal flag ', async () => {
        const trace = firebase.perf().newTrace('invertase');
        await trace.start();
        trace.putAttribute('foo', 'bar');
        trace.putAttribute('bar', 'foo');
        trace.putMetric('leet', 1337);
        trace.putMetric('chickens', 12);
        await Utils.sleep(100);
        await trace.stop();
        should.equal(trace._stopped, true);
      });

      it('resolves null if already stopped', async () => {
        const trace = firebase.perf().newTrace('invertase');
        await trace.start();
        await Utils.sleep(100);
        await trace.stop();
        should.equal(await trace.stop(), null);
      });
    });

    // describe('removeAttribute()', async () => {
    //   it('errors if not a string', async () => {
    //     const trace = firebase.perf().newTrace('invertase');
    //     try {
    //       trace.putAttribute('inver', 'tase');
    //       trace.removeAttribute(13377331);
    //       return Promise.reject(new Error('Did not throw'));
    //     } catch (e) {
    //       e.message.should.containEql('must be a string');
    //       return Promise.resolve();
    //     }
    //   });
    //
    //   it('removes an attribute', async () => {
    //     const trace = firebase.perf().newTrace('invertase');
    //     trace.putAttribute('inver', 'tase');
    //     const value = trace.getAttribute('inver');
    //     should.equal(value, 'tase');
    //     trace.removeAttribute('inver');
    //     const value2 = trace.getAttribute('inver');
    //     should.equal(value2, null);
    //   });
    // });

    describe('getAttribute()', async () => {
      it('should return null if attribute does not exist', async () => {
        const trace = firebase.perf().newTrace('invertase');
        const value = trace.getAttribute('inver');
        should.equal(value, null);
      });

      it('should return an attribute string value', async () => {
        const trace = firebase.perf().newTrace('invertase');
        trace.putAttribute('inver', 'tase');
        const value = trace.getAttribute('inver');
        should.equal(value, 'tase');
      });

      it('errors if attribute name is not a string', async () => {
        try {
          const trace = firebase.perf().newTrace('invertase');
          trace.getAttribute(1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });
    });

    describe('putAttribute()', async () => {
      it('sets an attribute string value', async () => {
        const trace = firebase.perf().newTrace('invertase');
        trace.putAttribute('inver', 'tase');
        const value = trace.getAttribute('inver');
        value.should.equal('tase');
      });

      it('errors if attribute name is not a string', async () => {
        try {
          const trace = firebase.perf().newTrace('invertase');
          trace.putAttribute(1337, 'invertase');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });

      it('errors if attribute value is not a string', async () => {
        try {
          const trace = firebase.perf().newTrace('invertase');
          trace.putAttribute('invertase', 1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('must be a string');
          return Promise.resolve();
        }
      });

      it('errors if attribute name is greater than 40 characters', async () => {
        try {
          const trace = firebase.perf().newTrace('invertase');
          trace.putAttribute(new Array(41).fill('1').join(''), 1337);
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('a maximum length of 40 characters');
          return Promise.resolve();
        }
      });

      it('errors if attribute value is greater than 100 characters', async () => {
        try {
          const trace = firebase.perf().newTrace('invertase');
          trace.putAttribute('invertase', new Array(101).fill('1').join(''));
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('a maximum length of 100 characters');
          return Promise.resolve();
        }
      });

      it('errors if more than 5 attributes are put', async () => {
        const trace = firebase.perf().newTrace('invertase');

        trace.putAttribute('invertase1', '1337');
        trace.putAttribute('invertase2', '1337');
        trace.putAttribute('invertase3', '1337');
        trace.putAttribute('invertase4', '1337');
        trace.putAttribute('invertase5', '1337');

        try {
          trace.putAttribute('invertase6', '1337');
          return Promise.reject(new Error('Did not throw'));
        } catch (e) {
          e.message.should.containEql('maximum number of attributes');
          return Promise.resolve();
        }
      });
    });

    // it('getAttributes()', async () => {
    //   const trace = firebase.perf().newTrace('invertase');
    //   trace.putAttribute('inver', 'tase');
    //   trace.putAttribute('tase', 'baz');
    //   const value = trace.getAttributes();
    //   JSON.parse(JSON.stringify(value)).should.deepEqual({
    //     inver: 'tase',
    //     tase: 'baz',
    //   });
    // });
  });

  // -----------
  //   Metrics
  // -----------

  describe('removeMetric()', async () => {
    it('errors if name not a string', async () => {
      const trace = firebase.perf().newTrace('invertase');
      try {
        trace.putMetric('likes', 1337);
        trace.removeMetric(13377331);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });

    it('removes a metric', async () => {
      const trace = firebase.perf().newTrace('invertase');
      trace.putMetric('likes', 1337);
      const value = trace.getMetric('likes');
      should.equal(value, 1337);
      trace.removeMetric('likes');
      const value2 = trace.getMetric('likes');
      should.equal(value2, 0);
    });
  });

  describe('getMetric()', async () => {
    it('should return 0 if metric does not exist', async () => {
      const trace = firebase.perf().newTrace('invertase');
      const value = trace.getMetric('likes');
      should.equal(value, 0);
    });

    it('should return an metric number value', async () => {
      const trace = firebase.perf().newTrace('invertase');
      trace.putMetric('likes', 7331);
      const value = trace.getMetric('likes');
      should.equal(value, 7331);
    });

    it('errors if metric name is not a string', async () => {
      try {
        const trace = firebase.perf().newTrace('invertase');
        trace.getMetric(1337);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });
  });

  describe('putMetric()', async () => {
    it('sets a metric number value', async () => {
      const trace = firebase.perf().newTrace('invertase');
      trace.putMetric('likes', 9001);
      const value = trace.getMetric('likes');
      value.should.equal(9001);
    });

    it('overwrites existing metric if it exists', async () => {
      const trace = firebase.perf().newTrace('invertase');
      trace.putMetric('likes', 1);
      trace.incrementMetric('likes', 9000);
      const value = trace.getMetric('likes');
      value.should.equal(9001);
      trace.putMetric('likes', 1);
      const value2 = trace.getMetric('likes');
      value2.should.equal(1);
    });

    it('errors if metric name is not a string', async () => {
      try {
        const trace = firebase.perf().newTrace('invertase');
        trace.putMetric(1337, 7331);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });

    it('errors if metric value is not a number', async () => {
      try {
        const trace = firebase.perf().newTrace('invertase');
        trace.putMetric('likes', '1337');
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a number');
        return Promise.resolve();
      }
    });
  });

  describe('incrementMetric()', async () => {
    it('increments a metric number value', async () => {
      const trace = firebase.perf().newTrace('invertase');
      trace.putMetric('likes', 9000);
      trace.incrementMetric('likes', 1);
      const value = trace.getMetric('likes');
      value.should.equal(9001);
    });

    it('increments a metric even if it does not already exist', async () => {
      const trace = firebase.perf().newTrace('invertase');
      trace.incrementMetric('likes', 9001);
      const value = trace.getMetric('likes');
      value.should.equal(9001);
    });

    it('errors if metric name is not a string', async () => {
      try {
        const trace = firebase.perf().newTrace('invertase');
        trace.incrementMetric(1337, 1);
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a string');
        return Promise.resolve();
      }
    });

    it('errors if incrementBy value is not a number', async () => {
      try {
        const trace = firebase.perf().newTrace('invertase');
        trace.incrementMetric('likes', '1');
        return Promise.reject(new Error('Did not throw'));
      } catch (e) {
        e.message.should.containEql('must be a number');
        return Promise.resolve();
      }
    });
  });

  it('getMetrics()', async () => {
    const trace = firebase.perf().newTrace('invertase');
    trace.putMetric('likes', 1337);
    trace.putMetric('stars', 6832);
    const value = trace.getMetrics();
    JSON.parse(JSON.stringify(value)).should.deepEqual({
      likes: 1337,
      stars: 6832,
    });
  });
});
