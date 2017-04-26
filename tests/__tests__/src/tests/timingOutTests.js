
import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function timingOutTests({ it: _it, describe: _describe }) {
  _describe('tests', () => {
    _it('time out after 5 seconds by default', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it }) => {
        it('', () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 6000);
          });
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      }, (value) => {
        testSuiteStatuses.push(value);
      }, (value) => {
        testStatuses.push(value);
      });

      await testSuite.run();

      const lastTestSuiteStatus = testSuiteStatuses[testSuiteStatuses.length - 1];

      lastTestSuiteStatus.progress.should.equal(100);
      lastTestSuiteStatus.status.should.equal('error');
      lastTestSuiteStatus.message.should.equal('1 test has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('TimeoutError: Test took longer than 5000ms. This can be extended with the timeout option.');
    });

    _it('can set custom timeout', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it }) => {
        it('', { timeout: 500 }, () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      }, (value) => {
        testSuiteStatuses.push(value);
      }, (value) => {
        testStatuses.push(value);
      });

      await testSuite.run();

      const lastTestSuiteStatus = testSuiteStatuses[testSuiteStatuses.length - 1];

      lastTestSuiteStatus.progress.should.equal(100);
      lastTestSuiteStatus.status.should.equal('error');
      lastTestSuiteStatus.message.should.equal('1 test has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('TimeoutError: Test took longer than 500ms. This can be extended with the timeout option.');
    });
  });
}

export default timingOutTests;
