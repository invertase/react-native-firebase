import sinon from 'sinon';
import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function focusedTestTests({ it: _it, describe: _describe }) {
  _describe('when fit is used instead of it', () => {
    _it('a test is marked as focused', async () => {
      const focusedTest = sinon.spy();
      const otherTest = sinon.spy();

      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, fit }) => {
        fit('', focusedTest);

        it('', otherTest);
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run(Object.keys(testSuite.testDefinitions.focusedTestIds));

      focusedTest.should.be.called();
      otherTest.should.not.be.called();
    });
  });

  _describe('when fdescribe is used instead of describe', () => {
    _it('child tests are marked as focused', async () => {
      const focusedTest = sinon.spy();
      const otherTest = sinon.spy();

      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, fdescribe }) => {
        fdescribe('', () => {
          it('', focusedTest);
        });

        it('', otherTest);
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run(Object.keys(testSuite.testDefinitions.focusedTestIds));

      focusedTest.should.be.called();
      otherTest.should.not.be.called();
    });
  });

  _describe('when fcontext is used instead of context', () => {
    _it('child tests are marked as focused', async () => {
      const focusedTest = sinon.spy();
      const otherTest = sinon.spy();

      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, fcontext }) => {
        fcontext('', () => {
          it('', focusedTest);
        });

        it('', otherTest);
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run(Object.keys(testSuite.testDefinitions.focusedTestIds));

      focusedTest.should.be.called();
      otherTest.should.not.be.called();
    });
  });
}

export default focusedTestTests;
