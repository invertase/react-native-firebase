import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function failingHookTests({ it: _it, describe: _describe }) {
  _describe('before hooks:', () => {
    _it('capture promise rejections and marks all tests as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, before }) => {
        before(() => {
          return new Promise((resolve, reject) => {
            reject('failure');
          });
        });

        it('', () => { });

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
      lastTestSuiteStatus.message.should.equal('2 tests has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('Error occurred in "" before Hook: failure');
    });

    _it('capture errors thrown in promises and marks all tests as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, before }) => {
        before(() => {
          return new Promise(() => {
            true.should.equal(false);
          });
        });

        it('', () => { });

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
      lastTestSuiteStatus.message.should.equal('2 tests has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('Error occurred in "" before Hook: AssertionError: expected true to be false');
    });

    _it('captures errors thrown in asynchronous functions and marks all tests as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, before }) => {
        before(async () => {
          await new Promise(() => {
            true.should.equal(false);
          });
        });

        it('', () => { });

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
      lastTestSuiteStatus.message.should.equal('2 tests has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('Error occurred in "" before Hook: AssertionError: expected true to be false');
    });

    _it('captures errors thrown in synchronous functions and marks all tests as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, before }) => {
        before(() => {
          true.should.equal(false);
        });

        it('', () => { });

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
      lastTestSuiteStatus.message.should.equal('2 tests has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('Error occurred in "" before Hook: AssertionError: expected true to be false');
    });
  });

  _describe('beforeEach hooks:', () => {
    _it('capture promise rejections and marks test that follows as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];
      let testRuns = 0;

      testSuite.addTests(({ it, beforeEach }) => {
        beforeEach(() => {
          return new Promise((resolve, reject) => {
            if (testRuns > 0) {
              reject('failure');
            } else {
              testRuns += 1;
              resolve();
            }
          });
        });

        it('', () => { });

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
      lastTestStatus.message.should.equal('Error occurred in "" beforeEach Hook: failure');
    });

    _it('capture errors thrown in promises and marks test that follows as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];
      let testRuns = 0;

      testSuite.addTests(({ it, beforeEach }) => {
        beforeEach(() => {
          return new Promise((resolve) => {
            if (testRuns > 0) {
              true.should.equal(false);
            } else {
              testRuns += 1;
              resolve();
            }
          });
        });

        it('', () => { });

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
      lastTestStatus.message.should.equal('Error occurred in "" beforeEach Hook: AssertionError: expected true to be false');
    });

    _it('captures errors thrown in asynchronous functions and marks test that follows as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];
      let testRuns = 0;

      testSuite.addTests(({ it, beforeEach }) => {
        beforeEach(async () => {
          await new Promise((resolve) => {
            if (testRuns > 0) {
              true.should.equal(false);
            } else {
              testRuns += 1;
              resolve();
            }
          });
        });

        it('', () => { });

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
      lastTestStatus.message.should.equal('Error occurred in "" beforeEach Hook: AssertionError: expected true to be false');
    });

    _it('captures errors thrown in synchronous functions and marks test that follows as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];
      let testRuns = 0;

      testSuite.addTests(({ it, beforeEach }) => {
        beforeEach(() => {
          if (testRuns > 0) {
            true.should.equal(false);
          } else {
            testRuns += 1;
          }
        });

        it('', () => { });

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
      lastTestStatus.message.should.equal('Error occurred in "" beforeEach Hook: AssertionError: expected true to be false');
    });
  });

  _describe('afterEach hooks:', () => {
    _it('capture promise rejections and marks test that proceeded as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];
      let testRuns = 0;

      testSuite.addTests(({ it, afterEach }) => {
        afterEach(() => {
          return new Promise((resolve, reject) => {
            if (testRuns > 0) {
              reject('failure');
            } else {
              testRuns += 1;
              resolve();
            }
          });
        });

        it('', () => { });

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
      lastTestStatus.message.should.equal('Error occurred in "" afterEach Hook: failure');
    });

    _it('capture errors thrown in promises and marks test that proceeded as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];
      let testRuns = 0;

      testSuite.addTests(({ it, afterEach }) => {
        afterEach(() => {
          return new Promise((resolve) => {
            if (testRuns > 0) {
              true.should.equal(false);
            } else {
              testRuns += 1;
              resolve();
            }
          });
        });

        it('', () => { });

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
      lastTestStatus.message.should.equal('Error occurred in "" afterEach Hook: AssertionError: expected true to be false');
    });

    _it('captures errors thrown in asynchronous functions and marks test that proceeded as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];
      let testRuns = 0;

      testSuite.addTests(({ it, afterEach }) => {
        afterEach(async () => {
          await new Promise((resolve) => {
            if (testRuns > 0) {
              true.should.equal(false);
            } else {
              testRuns += 1;
              resolve();
            }
          });
        });

        it('', () => { });

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
      lastTestStatus.message.should.equal('Error occurred in "" afterEach Hook: AssertionError: expected true to be false');
    });

    _it('captures errors thrown in synchronous functions and marks test that proceeded as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];
      let testRuns = 0;

      testSuite.addTests(({ it, afterEach }) => {
        afterEach(() => {
          if (testRuns > 0) {
            true.should.equal(false);
          } else {
            testRuns += 1;
          }
        });

        it('', () => { });

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
      lastTestStatus.message.should.equal('Error occurred in "" afterEach Hook: AssertionError: expected true to be false');
    });
  });

  _describe('after hooks:', () => {
    _it('capture promise rejections and marks all tests as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, after }) => {
        after(() => {
          return new Promise((resolve, reject) => {
            reject('failure');
          });
        });

        it('', () => { });

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
      lastTestSuiteStatus.message.should.equal('2 tests has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('Error occurred in "" after Hook: failure');
    });

    _it('capture errors thrown in promises and marks all tests as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, after }) => {
        after(() => {
          return new Promise(() => {
            true.should.equal(false);
          });
        });

        it('', () => { });

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
      lastTestSuiteStatus.message.should.equal('2 tests has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('Error occurred in "" after Hook: AssertionError: expected true to be false');
    });

    _it('captures errors thrown in asynchronous functions and marks all tests as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, after }) => {
        after(async () => {
          await new Promise(() => {
            true.should.equal(false);
          });
        });

        it('', () => { });

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
      lastTestSuiteStatus.message.should.equal('2 tests has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('Error occurred in "" after Hook: AssertionError: expected true to be false');
    });

    _it('captures errors thrown in synchronous functions and marks all tests as failed', async () => {
      const testSuite = new TestSuite('', '', {});
      const testSuiteStatuses = [];
      const testStatuses = [];

      testSuite.addTests(({ it, after }) => {
        after(() => {
          true.should.equal(false);
        });

        it('', () => { });

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
      lastTestSuiteStatus.message.should.equal('2 tests has error(s).');

      const lastTestStatus = testStatuses[testStatuses.length - 1];

      lastTestStatus.status.should.equal('error');
      lastTestStatus.message.should.equal('Error occurred in "" after Hook: AssertionError: expected true to be false');
    });
  });
}

export default failingHookTests;
