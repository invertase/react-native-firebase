import 'should-sinon';

import TestSuite from '../lib/TestSuite';

function asynchronousHooksTests({ it: _it, describe: _describe }) {
  _describe('before hooks:', () => {
    _it('can return a promise that is resolved before executing other hooks and tests', async () => {
      let valueBySecondHook = null;
      let valueByTest = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, before }) => {
        let resolved = false;

        before(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        before(() => {
          valueBySecondHook = resolved;
        });

        it('', () => {
          valueByTest = resolved;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondHook.should.equal(true);
      valueByTest.should.equal(true);
    });

    _it('can be an asynchronous function that is awaited before executing other hooks and tests', async () => {
      let valueBySecondHook = null;
      let valueByTest = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, before }) => {
        let resolved = false;

        before(async () => {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        before(() => {
          valueBySecondHook = resolved;
        });

        it('', () => {
          valueByTest = resolved;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondHook.should.equal(true);
      valueByTest.should.equal(true);
    });
  });

  _describe('beforeEach hooks:', () => {
    _it('can return a promise that is resolved before executing other hooks and tests', async () => {
      let valueBySecondHook = null;
      let valueByTest = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, beforeEach }) => {
        let resolved = false;

        beforeEach(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        beforeEach(() => {
          valueBySecondHook = resolved;
        });

        it('', () => {
          valueByTest = resolved;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondHook.should.equal(true);
      valueByTest.should.equal(true);
    });

    _it('can be an asynchronous function that is awaited before executing other hooks and tests', async () => {
      let valueBySecondHook = null;
      let valueByTest = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, beforeEach }) => {
        let resolved = false;

        beforeEach(async () => {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        beforeEach(() => {
          valueBySecondHook = resolved;
        });

        it('', () => {
          valueByTest = resolved;
        });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondHook.should.equal(true);
      valueByTest.should.equal(true);
    });
  });

  _describe('afterEach hooks:', () => {
    _it('can return a promise that is resolved before executing other hooks and tests', async () => {
      let valueBySecondHook = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, afterEach }) => {
        let resolved = false;

        afterEach(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        afterEach(() => {
          valueBySecondHook = resolved;
        });

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondHook.should.equal(true);
    });

    _it('can be an asynchronous function that is awaited before executing other hooks and tests', async () => {
      let valueBySecondHook = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, afterEach }) => {
        let resolved = false;

        afterEach(async () => {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        afterEach(() => {
          valueBySecondHook = resolved;
        });

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondHook.should.equal(true);
    });
  });

  _describe('after hooks:', () => {
    _it('can return a promise that is resolved before executing other hooks and tests', async () => {
      let valueBySecondHook = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, after }) => {
        let resolved = false;

        after(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        after(() => {
          valueBySecondHook = resolved;
        });

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondHook.should.equal(true);
    });

    _it('can be an asynchronous function that is awaited before executing other hooks and tests', async () => {
      let valueBySecondHook = null;
      const testSuite = new TestSuite('', '', {});

      testSuite.addTests(({ it, after }) => {
        let resolved = false;

        after(async () => {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolved = true;
              resolve();
            }, 500);
          });
        });

        after(() => {
          valueBySecondHook = resolved;
        });

        it('', () => { });
      });

      testSuite.setStore({
        getState: () => { return {}; },
      });

      await testSuite.run();

      valueBySecondHook.should.equal(true);
    });
  });
}

export default asynchronousHooksTests;
