import sinon from 'sinon';
import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function pendingTestTests({ it: _it, describe: _describe }) {
  _describe('when xit is used instead of it', () => {
    _it('a test is marked as pending', async () => {
      const pendingTest = sinon.spy();
      const otherTest = sinon.spy();

      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, xit }) => {
        xit('', pendingTest);

        it('', otherTest);
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      const testIdsToRun = Object.keys(testSuite.testDefinitions.tests).reduce((memo, testId) => {
        if (!testSuite.testDefinitions.pendingTestIds[testId]) {
          memo.push(testId);
        }

        return memo;
      }, []);

      await testSuite.run(testIdsToRun);

      pendingTest.should.not.be.called();
      otherTest.should.be.called();
    });
  });

  _describe('when xdescribe is used instead of describe', () => {
    _it('child tests are marked as pending', async () => {
      const pendingTest = sinon.spy();
      const otherTest = sinon.spy();

      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, xdescribe }) => {
        xdescribe('', () => {
          it('', pendingTest);
        });

        it('', otherTest);
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      const testIdsToRun = Object.keys(testSuite.testDefinitions.tests).reduce((memo, testId) => {
        if (!testSuite.testDefinitions.pendingTestIds[testId]) {
          memo.push(testId);
        }

        return memo;
      }, []);

      await testSuite.run(testIdsToRun);

      pendingTest.should.not.be.called();
      otherTest.should.be.called();
    });
  });

  _describe('when xcontext is used instead of context', () => {
    _it('child tests are marked as pending', async () => {
      const pendingTest = sinon.spy();
      const otherTest = sinon.spy();

      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, xcontext }) => {
        xcontext('', () => {
          it('', pendingTest);
        });

        it('', otherTest);
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      const testIdsToRun = Object.keys(testSuite.testDefinitions.tests).reduce((memo, testId) => {
        if (!testSuite.testDefinitions.pendingTestIds[testId]) {
          memo.push(testId);
        }

        return memo;
      }, []);

      await testSuite.run(testIdsToRun);

      pendingTest.should.not.be.called();
      otherTest.should.be.called();
    });
  });

  _describe('when an outer context is focused', () => {
    _it('a pending test will still not run', async () => {
      const pendingTest = sinon.spy();
      const otherTest = sinon.spy();
      const unfocusedTest = sinon.spy();

      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ fdescribe, it, xit }) => {
        fdescribe('', () => {
          xit('', pendingTest);

          it('', otherTest);
        });

        it('', unfocusedTest);
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      const testIdsToRun = Object.keys(testSuite.testDefinitions.focusedTestIds).reduce((memo, testId) => {
        if (!testSuite.testDefinitions.pendingTestIds[testId]) {
          memo.push(testId);
        }

        return memo;
      }, []);

      await testSuite.run(testIdsToRun);

      pendingTest.should.not.be.called();
      otherTest.should.be.called();
      unfocusedTest.should.not.be.called();
    });
  });

  _describe('when an outer context is focused', () => {
    _it('a pending context will still not run', async () => {
      const pendingTest = sinon.spy();
      const otherTest = sinon.spy();
      const unfocusedTest = sinon.spy();

      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ fdescribe, it, xdescribe }) => {
        fdescribe('', () => {
          xdescribe('', () => {
            it('', pendingTest);
          });

          it('', otherTest);
        });

        it('', unfocusedTest);
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      const testIdsToRun = Object.keys(testSuite.testDefinitions.focusedTestIds).reduce((memo, testId) => {
        if (!testSuite.testDefinitions.pendingTestIds[testId]) {
          memo.push(testId);
        }

        return memo;
      }, []);

      await testSuite.run(testIdsToRun);

      pendingTest.should.not.be.called();
      otherTest.should.be.called();
      unfocusedTest.should.not.be.called();
    });
  });
}

export default pendingTestTests;
