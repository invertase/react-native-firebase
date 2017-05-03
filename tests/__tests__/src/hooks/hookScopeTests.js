import sinon from 'sinon';
import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function hookScopeTests({ it: _it, describe: _describe }) {
  _describe('before hooks:', () => {
    _it('apply only to the scope they are defined in and any child scopes', async () => {
      const testSuite = new TestSuite('', '', {});

      let value = 0;
      let valueWhenOtherTestRuns = null;
      let valueWhenSiblingTestRuns = null;
      let valueWhenChildTestRuns = null;

      testSuite.addTests(({ it, before, context }) => {
        context('', () => {
          before(() => {
            value = 1;
          });

          it('', () => {
            valueWhenSiblingTestRuns = value;
          });

          context('', () => {
            it('', () => {
              valueWhenChildTestRuns = value;
            });
          });
        });

        it('', () => {
          valueWhenOtherTestRuns = value;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueWhenOtherTestRuns.should.equal(0);
      valueWhenSiblingTestRuns.should.equal(1);
      valueWhenChildTestRuns.should.equal(1);
    });

    _it('only run once for the scope they apply', async () => {
      const testSuite = new TestSuite('', '', {});
      const beforeHook = sinon.spy();

      testSuite.addTests(({ it, before, context }) => {
        context('', () => {
          before(beforeHook);

          it('', () => { });

          context('', () => {
            it('', () => { });
          });
        });

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      beforeHook.should.be.calledOnce();
    });
  });

  _describe('beforeEach hooks:', () => {
    _it('apply only to the scope they are defined in and any child scopes', async () => {
      const testSuite = new TestSuite('', '', {});

      let value = 0;
      let valueWhenOtherTestRuns = null;
      let valueWhenSiblingTestRuns = null;
      let valueWhenChildTestRuns = null;

      testSuite.addTests(({ it, beforeEach, context }) => {
        context('', () => {
          beforeEach(() => {
            value = 1;
          });

          it('', () => {
            valueWhenSiblingTestRuns = value;
          });

          context('', () => {
            it('', () => {
              valueWhenChildTestRuns = value;
            });
          });
        });

        it('', () => {
          valueWhenOtherTestRuns = value;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueWhenOtherTestRuns.should.equal(0);
      valueWhenSiblingTestRuns.should.equal(1);
      valueWhenChildTestRuns.should.equal(1);
    });

    _it('are called once for every test in its scope', async () => {
      const testSuite = new TestSuite('', '', {});
      const beforeEachHook = sinon.spy();

      testSuite.addTests(({ it, beforeEach, context }) => {
        context('', () => {
          beforeEach(beforeEachHook);

          it('', () => { });

          context('', () => {
            it('', () => { });
          });
        });

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      beforeEachHook.should.be.calledTwice();
    });
  });

  _describe('afterEach hooks:', () => {
    _it('apply only to the scope they are defined in and any child scopes', async () => {
      const testSuite = new TestSuite('', '', {});

      let value = 0;

      testSuite.addTests(({ it, afterEach, context }) => {
        context('', () => {
          it('', () => {
            value += 1;
          });

          context('', () => {
            it('', () => {
              value += 1;
            });
          });

          afterEach(() => {
            value -= 1;
          });
        });

        it('', () => {
          value += 1;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      value.should.equal(1);
    });

    _it('are called once for every test in its scope', async () => {
      const testSuite = new TestSuite('', '', {});
      const afterEachHook = sinon.spy();

      testSuite.addTests(({ it, afterEach, context }) => {
        context('', () => {
          afterEach(afterEachHook);

          it('', () => { });

          context('', () => {
            it('', () => { });
          });
        });

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      afterEachHook.should.be.calledTwice();
    });
  });

  _describe('after hooks:', () => {
    _it('apply only to the scope they are defined in and any child scopes', async () => {
      const testSuite = new TestSuite('', '', {});

      let value = 0;

      testSuite.addTests(({ it, after, context }) => {
        context('', () => {
          it('', () => {
            value += 1;
          });

          context('', () => {
            it('', () => {
              value += 1;
            });
          });

          after(() => {
            value -= 1;
          });
        });

        it('', () => {
          value += 1;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      value.should.equal(2);
    });

    _it('are called once for every test in its scope', async () => {
      const testSuite = new TestSuite('', '', {});
      const afterHook = sinon.spy();

      testSuite.addTests(({ it, after, context }) => {
        context('', () => {
          it('', () => { });

          context('', () => {
            it('', () => { });
          });

          after(afterHook);
        });

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      afterHook.should.be.calledOnce();
    });
  });
}

export default hookScopeTests;
