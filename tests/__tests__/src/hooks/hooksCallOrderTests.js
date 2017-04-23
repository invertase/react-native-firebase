import sinon from 'sinon';
import 'should-sinon';
import assert from 'assert';

import TestSuite from '../lib/TestSuite';

function hooksCallOrderTests({ it: _it, describe: _describe }) {
  _describe('before hooks:', () => {
    _it('calls before hooks defined in the same context in the order they are defined', async () => {
      const testSuite = new TestSuite('', '', {});

      const beforeCallbackA = sinon.spy();
      const beforeCallbackB = sinon.spy();

      testSuite.addTests(({ it, before }) => {
        before(beforeCallbackA);
        before(beforeCallbackB);

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      beforeCallbackA.should.have.been.called();
      beforeCallbackB.should.have.been.called();

      assert(beforeCallbackB.calledAfter(beforeCallbackA));
    });

    _it('calls before hooks defined in child contexts after those in parent contexts', async () => {
      const testSuite = new TestSuite('', '', {});

      const beforeCallbackA = sinon.spy();
      const beforeCallbackB = sinon.spy();

      testSuite.addTests(({ it, before, context }) => {
        before(beforeCallbackA);

        context('', () => {
          before(beforeCallbackB);

          it('', () => { });
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      beforeCallbackA.should.have.been.called();
      beforeCallbackB.should.have.been.called();

      assert(beforeCallbackB.calledAfter(beforeCallbackA));
    });
  });

  _describe('beforeEach hooks:', () => {
    _it('calls beforeEach hooks defined in the same context in the order they are defined', async () => {
      const testSuite = new TestSuite('', '', {});

      const beforeEachCallbackA = sinon.spy();
      const beforeEachCallbackB = sinon.spy();

      testSuite.addTests(({ it, beforeEach }) => {
        beforeEach(beforeEachCallbackA);
        beforeEach(beforeEachCallbackB);

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      beforeEachCallbackA.should.have.been.called();
      beforeEachCallbackB.should.have.been.called();

      assert(beforeEachCallbackB.calledAfter(beforeEachCallbackA));
    });

    _it('calls beforeEach hooks defined in child contexts after those in parent contexts', async () => {
      const testSuite = new TestSuite('', '', {});

      const beforeEachCallbackA = sinon.spy();
      const beforeEachCallbackB = sinon.spy();

      testSuite.addTests(({ it, beforeEach, context }) => {
        beforeEach(beforeEachCallbackA);

        context('', () => {
          beforeEach(beforeEachCallbackB);

          it('', () => { });
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      beforeEachCallbackA.should.have.been.called();
      beforeEachCallbackB.should.have.been.called();

      assert(beforeEachCallbackB.calledAfter(beforeEachCallbackA));
    });

    _it('calls beforeEach hooks after before hooks', async () => {
      const testSuite = new TestSuite('', '', {});

      const beforeCallbackA = sinon.spy();
      const beforeEachCallbackB = sinon.spy();

      testSuite.addTests(({ it, before, beforeEach }) => {
        before(beforeCallbackA);
        beforeEach(beforeEachCallbackB);

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      beforeCallbackA.should.have.been.called();
      beforeEachCallbackB.should.have.been.called();

      assert(beforeEachCallbackB.calledAfter(beforeCallbackA));
    });
  });

  _describe('after hooks:', () => {
    _it('calls after hooks defined in the same context in the order they are defined', async () => {
      const testSuite = new TestSuite('', '', {});

      const afterCallbackA = sinon.spy();
      const afterCallbackB = sinon.spy();

      testSuite.addTests(({ it, after }) => {
        after(afterCallbackA);
        after(afterCallbackB);

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      afterCallbackA.should.have.been.called();
      afterCallbackB.should.have.been.called();

      assert(afterCallbackB.calledAfter(afterCallbackA));
    });

    _it('calls after hooks defined in child contexts before those in parent contexts', async () => {
      const testSuite = new TestSuite('', '', {});

      const afterCallbackA = sinon.spy();
      const afterCallbackB = sinon.spy();

      testSuite.addTests(({ it, after, context }) => {
        after(afterCallbackA);

        context('', () => {
          after(afterCallbackB);

          it('', () => { });
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      afterCallbackA.should.have.been.called();
      afterCallbackB.should.have.been.called();

      assert(afterCallbackA.calledAfter(afterCallbackB));
    });
  });

  _describe('afterEach hooks:', () => {
    _it('calls afterEach hooks defined in the same context in the order they are defined', async () => {
      const testSuite = new TestSuite('', '', {});

      const afterEachCallbackA = sinon.spy();
      const afterEachCallbackB = sinon.spy();

      testSuite.addTests(({ it, afterEach }) => {
        afterEach(afterEachCallbackA);
        afterEach(afterEachCallbackB);

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      afterEachCallbackA.should.have.been.called();
      afterEachCallbackB.should.have.been.called();

      assert(afterEachCallbackB.calledAfter(afterEachCallbackA));
    });

    _it('calls afterEach hooks defined in child contexts before those in parent contexts', async () => {
      const testSuite = new TestSuite('', '', {});

      const afterEachCallbackA = sinon.spy();
      const afterEachCallbackB = sinon.spy();

      testSuite.addTests(({ it, afterEach, context }) => {
        afterEach(afterEachCallbackA);

        context('', () => {
          afterEach(afterEachCallbackB);

          it('', () => { });
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      afterEachCallbackA.should.have.been.called();
      afterEachCallbackB.should.have.been.called();

      assert(afterEachCallbackA.calledAfter(afterEachCallbackB));
    });

    _it('calls afterEach hooks before after hooks', async () => {
      const testSuite = new TestSuite('', '', {});

      const afterCallbackA = sinon.spy();
      const afterEachCallbackB = sinon.spy();

      testSuite.addTests(({ it, after, afterEach }) => {
        after(afterCallbackA);
        afterEach(afterEachCallbackB);

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      afterCallbackA.should.have.been.called();
      afterEachCallbackB.should.have.been.called();

      assert(afterCallbackA.calledAfter(afterEachCallbackB));
    });
  });

  _describe('when there are no tests in a context or any of its children', () => {
    _it('then doesn\'t call any hooks', async () => {
      const testSuite = new TestSuite('', '', {});

      const beforeCallback = sinon.spy();
      const beforeEachCallback = sinon.spy();
      const afterCallback = sinon.spy();
      const afterEachCallback = sinon.spy();

      testSuite.addTests(({ before, beforeEach, after, afterEach, context }) => {
        context('', () => {
          before(beforeCallback);
          beforeEach(beforeEachCallback);
          afterEach(afterEachCallback);
          after(afterCallback);
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      beforeCallback.should.not.have.been.called();
      beforeEachCallback.should.not.have.been.called();
      afterEachCallback.should.not.have.been.called();
      afterCallback.should.not.have.been.called();
    });
  });
}

export default hooksCallOrderTests;
