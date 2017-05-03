import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function asynchronousTestTests({ it: _it, describe: _describe }) {
  _describe('tests', () => {
    _it('can return a promise that is resolved before executing hooks and other tests', async () => {
      let valueBySecondTest = null;
      let valueByHook = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, after }) => {
        let resolved = false;

        it('', () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        it('', () => {
          valueBySecondTest = resolved;
        });

        after(() => {
          valueByHook = resolved;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondTest.should.equal(true);
      valueByHook.should.equal(true);
    });

    _it('can be an asynchronous function that is awaited before executing hooks and other tests', async () => {
      let valueBySecondTest = null;
      let valueByHook = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, after }) => {
        let resolved = false;

        it('', async () => {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        it('', () => {
          valueBySecondTest = resolved;
        });

        after(() => {
          valueByHook = resolved;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondTest.should.equal(true);
      valueByHook.should.equal(true);
    });
  });

}

export default asynchronousTestTests;
