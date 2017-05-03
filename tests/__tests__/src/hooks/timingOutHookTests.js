import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function failingHookTests({ it: _it, describe: _describe }) {
  _describe('before hooks:', () => {
    _it('timeout after 5 seconds by default', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, before }) => {
        before(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 6000);
          });
        });

        it('', () => { });
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
      lastTestStatus.message.should.equal('Error occurred in "" before Hook: TimeoutError: before hook took longer than 5000ms. This can be extended with the timeout option.');
    });

    _it('allows manually setting timeout', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, before }) => {
        before({ timeout: 500 }, () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 600);
          });
        });

        it('', () => { });
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
      lastTestStatus.message.should.equal('Error occurred in "" before Hook: TimeoutError: before hook took longer than 500ms. This can be extended with the timeout option.');
    });
  });

  _describe('beforeEach hooks:', () => {
    _it('timeout after 5 seconds by default', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, beforeEach }) => {
        beforeEach(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 6000);
          });
        });

        it('', () => { });
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
      lastTestStatus.message.should.equal('Error occurred in "" beforeEach Hook: TimeoutError: beforeEach hook took longer than 5000ms. This can be extended with the timeout option.');
    });

    _it('allows manually setting timeout', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, beforeEach }) => {
        beforeEach({ timeout: 500 }, () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 600);
          });
        });

        it('', () => { });
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
      lastTestStatus.message.should.equal('Error occurred in "" beforeEach Hook: TimeoutError: beforeEach hook took longer than 500ms. This can be extended with the timeout option.');
    });
  });

  _describe('afterEach hooks:', () => {
    _it('timeout after 5 seconds by default', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, afterEach }) => {
        afterEach(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 6000);
          });
        });

        it('', () => { });
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
      lastTestStatus.message.should.equal('Error occurred in "" afterEach Hook: TimeoutError: afterEach hook took longer than 5000ms. This can be extended with the timeout option.');
    });

    _it('allows manually setting timeout', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, afterEach }) => {
        afterEach({ timeout: 500 }, () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 600);
          });
        });

        it('', () => { });
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
      lastTestStatus.message.should.equal('Error occurred in "" afterEach Hook: TimeoutError: afterEach hook took longer than 500ms. This can be extended with the timeout option.');
    });
  });

  _describe('after hooks:', () => {
    _it('timeout after 5 seconds by default', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, after }) => {
        after(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 6000);
          });
        });

        it('', () => { });
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
      lastTestStatus.message.should.equal('Error occurred in "" after Hook: TimeoutError: after hook took longer than 5000ms. This can be extended with the timeout option.');
    });

    _it('allows manually setting timeout', { timeout: 7000 }, async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, after }) => {
        after({ timeout: 500 }, () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 600);
          });
        });

        it('', () => { });
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
      lastTestStatus.message.should.equal('Error occurred in "" after Hook: TimeoutError: after hook took longer than 500ms. This can be extended with the timeout option.');
    });
  });
}

export default failingHookTests;
