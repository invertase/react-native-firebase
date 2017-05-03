import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function failingTestTests({ it: _it, describe: _describe }) {
  _describe('running a test that is a function that returns a promise', () => {
    _it('correctly reports a failure when the promise is rejected', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it }) => {
        it('', () => {
          return new Promise((resolve, reject) => {
            reject('failure');
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
      lastTestStatus.message.should.equal('failure');
    });

    _it('correctly reports a failure when an error is thrown', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it }) => {

        it('', () => {
          return new Promise(() => {
            false.should.equal(true);
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
      lastTestStatus.message.should.equal('AssertionError: expected false to be true');
    });
  });

  _describe('running an async function test', () => {
    _it('correctly reports a failure when an error is thrown', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it }) => {
        it('', async () => {
          false.should.equal(true);
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
      lastTestStatus.message.should.equal('AssertionError: expected false to be true');
    });
  });

  _describe('running an synchronous function test', () => {
    _it('correctly reports a failure when an error is thrown', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it }) => {
        it('', () => {
          false.should.equal(true);
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
      lastTestStatus.message.should.equal('AssertionError: expected false to be true');
    });
  });
}

export default failingTestTests;
