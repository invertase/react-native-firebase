import Promise from 'bluebird';
import RunStatus from './RunStatus';

const EVENTS = {
  TEST_SUITE_STATUS: 'TEST_SUITE_STATUS',
  TEST_STATUS: 'TEST_STATUS',
};

if (!console.groupCollapsed) {
  console.groupCollapsed = console.log;
  console.groupEnd = () => console.log('');
}

const locationRegex = /\(?http:.*:([0-9]+):([0-9]+)\)?/g;

function cleanStack(stack, maxLines = 5) {
  const lines = stack.split('\n').slice(0, maxLines + 1);
  const out = [];

  for (let i = 0, len = lines.length; i < len; i++) {
    const srcLine = lines[i].trim();
    out.push(srcLine.replace(locationRegex, '()'));
  }

  return out.join('\r\n');
}


/**
 * Class that encapsulates synchronously running a suite's tests.
 */
class TestRun {
  /**
   * The number of tests that have been executed so far
   * @type {number}
   */
  completedTests = 0;

  /**
   * Creates a new TestRun
   * @param {TestSuite} testSuite - Test suite that tests belong to
   * @param {Test[]} tests - List of test to run
   * @param {TestSuiteDefinition} testDefinitions - Definition of tests and contexts
   */
  constructor(testSuite, tests, testDefinitions) {
    this.testSuite = testSuite;

    this.tests = tests;

    this.rootContextId = testDefinitions.rootTestContextId;

    this.testContexts = tests.reduce((memo, test) => {
      const testContextId = test.testContextId;

      this._recursivelyAddContextsTo(memo, testContextId, testDefinitions.testContexts);

      memo[testContextId].tests.unshift(test);

      return memo;
    }, {});

    this.listeners = {
      [EVENTS.TEST_STATUS]: [],
      [EVENTS.TEST_SUITE_STATUS]: [],
    };
  }

  /**
   * Registers a listener for a change event
   * @param {String} action - one of the actions in EVENTS
   * @param {Function} callback - Callback that accepts event object
   */
  onChange(action, callback) {
    this.listeners[action].push(callback);
  }

  /**
   * Walks up a context tree, copying test contexts from a source object to a target one.
   * Used for ensuring all of a test's parent contexts are added to the target object.
   * @param {Object<Number,TestContext>} target - Object to put test contexts in
   * @param {Number} id - Id of current context to add to target
   * @param {Object<Number,TestContext>} source - Object to get complete list of test contexts
   * from.
   * @param {Number} childContextId - id of child of current context
   * @private
   */
  _recursivelyAddContextsTo(target, id, source, childContextId = null) {
    const testContext = source[id];

    if (!target[id]) {
      // eslint-disable-next-line no-param-reassign
      target[id] = {
        ...testContext,
        tests: [],
        childContextIds: {},
      };
    }

    if (childContextId) {
      // eslint-disable-next-line no-param-reassign
      target[id].childContextIds[childContextId] = true;
    }

    const parentContextId = testContext.parentContextId;

    if (parentContextId) {
      this._recursivelyAddContextsTo(target, parentContextId, source, id);
    }
  }

  _updateStatus(action, values) {
    const listeners = this.listeners[action];

    listeners.forEach(listener => listener(values));
  }

  /**
   * Execute the tests TestRun was initialised with.
   * @returns {Promise.<void>} Resolves once all the tests in the test suite have
   * completed running.
   */
  async execute() {
    const store = this.testSuite.reduxStore;

    if (!store) {
      testRuntimeError(`Failed to run ${this.testSuite.name} tests as no Redux store has been provided`);
    }

    this._updateStatus(EVENTS.TEST_SUITE_STATUS, {
      suiteId: this.testSuite.id,
      status: RunStatus.RUNNING,

      progress: 0,
      time: 0,
    });

    // Start timing

    this.runStartTime = Date.now();

    const rootContext = this.testContexts[this.rootContextId];

    if (rootContext) {
      await this._runTestsInContext(rootContext);

      const errors = this.tests.filter(test => test.status === RunStatus.ERR);

      if (errors.length) {
        this._updateStatus(EVENTS.TEST_SUITE_STATUS, {
          suiteId: this.testSuite.id,
          status: RunStatus.ERR,
          progress: 100,

          time: Date.now() - this.runStartTime,
          message: `${errors.length} test${errors.length > 1 ? 's' : ''} has error(s).`,
        });
      } else {
        this._updateStatus(EVENTS.TEST_SUITE_STATUS, ({
          suiteId: this.testSuite.id,
          status: RunStatus.OK,
          progress: 100,

          time: Date.now() - this.runStartTime,
          message: '',
        }));
      }
    }
  }

  /**
   * Recursively enter a test context and run its before, beforeEach hooks where
   * appropriate; execute the test and then run afterEach and after hooks where
   * appropriate.
   * @param {TestContext} testContext - context to run hooks for
   * @param {Function[][]}  beforeEachHooks - stack of beforeEach hooks defined
   * in parent contexts that should be run beforeEach test in child contexts
   * @param {Function[][]} afterEachHooks - stack of afterEach hooks defined
   * in parent contexts that should be run afterEach test in child contexts
   * @returns {Promise.<void>} Resolves once all tests and their hooks have run
   * @private
   */
  async _runTestsInContext(testContext, beforeEachHooks = [], afterEachHooks = []) {
    const beforeHookRan = await this._runContextHooks(testContext, 'before');

    if (beforeHookRan) {
      beforeEachHooks.push(testContext.beforeEachHooks || []);
      afterEachHooks.unshift(testContext.afterEachHooks || []);

      await this._runTests(testContext, testContext.tests, flatten(beforeEachHooks), flatten(afterEachHooks));

      await Promise.each(Object.keys(testContext.childContextIds), (childContextId) => {
        const childContext = this.testContexts[childContextId];
        return this._runTestsInContext(childContext, beforeEachHooks, afterEachHooks);
      });

      beforeEachHooks.pop();
      afterEachHooks.shift();

      await this._runContextHooks(testContext, 'after');
    }
  }

  /**
   * Synchronously run hooks in context's (before|after) hooks, starting from the first
   * hook
   * @param {TestContext} testContext - context containing hooks
   * @param {('before'|'after')} hookName - name of hooks to run callbacks for
   * @returns {Promise.<*>} Resolves when last hook in list has been executed
   * @private
   */
  async _runContextHooks(testContext, hookName) {
    const hooks = testContext[`${hookName}Hooks`] || [];

    return this._runHookChain(null, Date.now(), testContext, hookName, hooks);
  }

  _runHookChain(test, testStart, testContext, hookName, hooks) {
    return Promise.each(hooks, async (hook) => {
      const error = await this._safelyRunFunction(hook.callback, hook.timeout, `${hookName} hook`);

      if (error) {
        const errorPrefix = `Error occurred in "${testContext.name}" ${hookName} Hook: `;

        if (test) {
          this._reportTestError(test, error, Date.now() - testStart, errorPrefix);
        } else {
          this._reportAllTestsAsFailed(testContext, error, testStart, errorPrefix);
        }

        throw new Error();
      }
    }).then(() => true).catch(() => false);
  }

  /**
   *
   * @param testContext
   * @param error
   * @param testStart
   * @param errorPrefix
   * @private
   */
  _reportAllTestsAsFailed(testContext, error, testStart, errorPrefix) {
    testContext.tests.forEach((test) => {
      this._reportTestError(test, error, Date.now() - testStart, errorPrefix);
    });

    testContext.childContextIds.forEach((contextId) => {
      this._reportAllTestsAsFailed(this.testContext[contextId], error, testStart, errorPrefix);
    });
  }

  /**
   * Synchronously run a list of tests
   * @param {TestContext} testContext - Test context to run beforeEach and AfterEach hooks
   * for
   * @param {Test[]} tests - List of tests to run
   * @param {Function[]} beforeEachHooks - list of functions to run before each test
   * @param {Function[]} afterEachHooks - list of functions to run after each test
   * @returns {Promise.<void>} - Resolves once all tests and their afterEach hooks have
   * been run
   * @private
   */
  async _runTests(testContext, tests, beforeEachHooks, afterEachHooks) {
    return Promise.each(tests, async (test) => {
      this._updateStatus(EVENTS.TEST_STATUS, {
        testId: test.id,
        status: RunStatus.RUNNING,
        time: 0,
        message: '',
      });

      const testStart = Date.now();

      const beforeEachRan = await this._runHookChain(test, testStart, testContext, 'beforeEach', beforeEachHooks);

      if (beforeEachRan) {
        const error = await this._safelyRunFunction(test.func.bind(null, [test, this.testSuite.reduxStore.getState()]), test.timeout, 'Test');

        // Update test status

        if (error) {
          this._reportTestError(test, error, Date.now() - testStart);
          console.groupCollapsed(`%c ❌ Test Failed: ${test.description} (${this.testSuite.name})`, 'color: #f44336;');
          console.log(`Test Description: ${test.description}`);
          console.log(`Test Time Taken: ${Date.now() - testStart}`);
          console.log(`Suite Name: ${this.testSuite.name}`);
          console.log(`Suite Description: ${this.testSuite.description}`);
          console.log(error);
          console.groupEnd();
        } else {
          // eslint-disable-next-line no-param-reassign
          test.status = RunStatus.OK;

          this._updateStatus(EVENTS.TEST_STATUS, {
            testId: test.id,
            status: RunStatus.OK,
            time: Date.now() - testStart,
            message: '',
          });

          console.groupCollapsed(`%c ✅ Test Passed: ${test.description} (${this.testSuite.name})`, 'color: #4CAF50;');
          console.log(`Test Description: ${test.description}`);
          console.log(`Test Time Taken: ${Date.now() - testStart}`);
          console.log(`Suite Name: ${this.testSuite.name}`);
          console.log(`Suite Description: ${this.testSuite.description}`);
          console.groupEnd();
        }

        // Update suite progress

        this.completedTests += 1;

        this._updateStatus(EVENTS.TEST_SUITE_STATUS, {
          suiteId: this.testSuite.id,
          status: RunStatus.RUNNING,
          progress: (this.completedTests / this.tests.length) * 100,
          time: Date.now() - this.runStartTime,
          message: '',
        });

        await this._runHookChain(test, testStart, testContext, 'afterEach', afterEachHooks);
      }
    }).catch((error) => {
      this._updateStatus(EVENTS.TEST_SUITE_STATUS, {
        suiteId: this.testSuite.id,
        status: RunStatus.ERR,
        time: Date.now() - this.runStartTime,
        message: `Test suite failed: ${error.message}`,
      });
    });
  }

  /**
   *
   * @param test
   * @param error
   * @param time
   * @param errorPrefix
   * @private
   */
  _reportTestError(test, error, time, errorPrefix = '') {
    // eslint-disable-next-line no-param-reassign
    test.status = RunStatus.ERR;
    this._updateStatus(EVENTS.TEST_STATUS, {
      testId: test.id,
      status: RunStatus.ERR,
      time,
      message: `${errorPrefix}${error.message ? `${error.name}: ${error.message}` : error}`,
      stackTrace: cleanStack(error.stack),
    });
  }

  /**
   *
   * @param func
   * @param timeOutDuration
   * @param description
   * @return {Promise.<*>}
   * @private
   */
  async _safelyRunFunction(func, timeOutDuration, description) {
    const syncResultOrPromise = captureThrownErrors(func);

    if (syncResultOrPromise.error) {
      // Synchronous Error
      return syncResultOrPromise.error;
    }

    // Asynchronous Error
    return capturePromiseErrors(syncResultOrPromise.result, timeOutDuration, description);
  }

}

/**
 * Call a function and capture any errors that are immediately thrown.
 * @returns {Object} Object containing result of executing the function, or the error
 * message that was captured
 * @private
 */

function captureThrownErrors(func) {
  const result = {};

  try {
    result.result = func();
  } catch (error) {
    result.error = error;
  }

  return result;
}

/**
 * Wraps a promise so that if it's rejected or an error is thrown while it's being
 * evaluated, it's captured and thrown no further
 * @param {*} target - Target to wrap. If a thenable object, it's wrapped so if it's
 * rejected or an error is thrown, it will be captured. If a non-thenable object,
 * wrapped in resolved promise and returned.
 * @param {Number} timeoutDuration - Number of milliseconds the promise is allowed
 * to pend before it's considered timed out
 * @param {String} description - Description of the context the promises is defined
 * in, used for reporting where a timeout occurred in the resulting error message.
 * @private
 */

function capturePromiseErrors(target, timeoutDuration, description) {
  let returnValue = null;

  try {
    returnValue = Promise.resolve(target)
      .then(() => {
        return null;
      }, (error) => {
        return Promise.resolve(error);
      })
      .catch((error) => {
        return Promise.resolve(error);
      })
      .timeout(timeoutDuration,
        `${description} took longer than ${timeoutDuration}ms. This can be extended with the timeout option.`
      );
  } catch (error) {
    returnValue = Promise.resolve(error);
  }

  return returnValue;
}

/**
 * Flatten a two dimensional array to a single dimensional array
 * @param {*[]} list - two dimensional array
 * @returns {*[]} One-dimensional array
 */
function flatten(list) {
  return list.reduce((memo, contextHooks) => {
    return memo.concat(contextHooks);
  }, []);
}

/**
 * Log a runtime error to the console
 * @param {String} error - Message to log to the console
 */
function testRuntimeError(error) {
  console.error(`ReactNativeFirebaseTests.TestRuntimeError: ${error}`);
}

export default TestRun;
