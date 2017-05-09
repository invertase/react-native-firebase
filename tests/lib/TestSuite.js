import 'should';
import 'should-sinon';

import TestSuiteDefinition from './TestSuiteDefinition';
import TestRun from './TestRun';

/**
 * Incrementing counter to assign each test suite a globally unique id. Should be
 * accessed only through assignTestSuiteId
 * @type {number} Counter that maintains globally unique id and increments each time
 * a new id is assigned
 */
let testSuiteCounter = 0;

/**
 * Increment the testSuiteCounter and return the new value. Used
 * for assigning a new globally unique id to a test suite.
 * @returns {number} globally unique id assigned to each test suite
 */
function assignTestSuiteId() {
  testSuiteCounter += 1;
  return testSuiteCounter;
}

/**
 * Class that provides imperative interface for constructing and running a test suite.
 * Used for instantiating a new test suite, adding tests to it and then running all or
 * a subset of those tests.
 *
 * @example
 * // Creates a new test suite
 * const testSuit = new TestSuite('Feature Group A', 'Feature a, b and c');
 */
class TestSuite {
  /**
   * Creates a new test suite.
   * @param {String} name - The name of the test suite
   * @param {String} description - A short description of the test suite
   * @param {Object} firebase - Object containing native and web firebase instances
   * @param {Object} firebase.native - Native firebase instance
   * @para {Object} firebase.web - Web firebase instance
   */
  constructor(name, description, firebase) {
    this.id = assignTestSuiteId();
    this.name = name;
    this.description = description;

    this.reduxStore = null;
    this.testDefinitions = new TestSuiteDefinition(this, firebase);
  }

  /**
   * @typedef {Function} TestDefinitionFunction
   * @param {TestDSL} testDSL - class instance that defines the testing DSL that can
   * be used in defining tests
   */

  /**
   * Adds tests defined in a function to the test suite
   * @param {TestDefinitionFunction} testDefinition - A function that defines one or
   * more test suites using the test DSL.
   * @example
   * // Adding tests
   * const testDefinition = function({ describe, it }) {
   *  describe('Some context', () => {
   *    it('then does something', () => {
   *      // Test assertions here
   *    })
   * })
   * testSuite.addTests(testDefinition);
   */
  addTests(testDefinition) {
    testDefinition(this.testDefinitions.DSL);
  }

  /**
   * @typedef {Object} ReduxStore
   * @property {Function} getState - Returns the current state of the store
   * @property {Function} dispatch - Dispatches a new action to update to store
   */

  /**
   * Sets the redux store assigned to the test suite
   * @param {ReduxStore} store - The redux store to add to the test suite
   * @param {Function} testSuiteAction - Function that accepts an object of
   * event values and returns another that is suitable to dispatch to the
   * redux store. Responsible for handling events when the test suite's status
   * has changed.
   * @param {Function} testAction - Function that accepts an object of
   * event values and returns another that is suitable to dispatch to the
   * redux store. Responsible for handling events when a test's status
   * has changed.
   */
  setStore(store, testSuiteAction, testAction) {
    this.reduxStore = store;
    this.suiteChangHandler = testSuiteAction;
    this.testChangHandler = testAction;
  }

  /**
   * Run all the tests matching an array of ids. If the array is not provided, run all
   * test in the test suite.
   * @param {number[]=} testIds - array of ids for tests to run
   * @throws {RangeError} testIds must correspond with tests in the test suite
   * @example
   * // Running all tests in the test suite
   * testSuite.run();
   * @example
   * // Run only tests with id 1 and 2
   * testSuite.run([1, 2]);
   */
  async run(testIds = undefined) {
    const testsToRun = (() => {
      return (testIds || Object.keys(this.testDefinitions.tests)).reduce((memo, id) => {
        const test = this.testDefinitions.tests[id];

        if (!test) {
          throw new RangeError(`ReactNativeFirebaseTests.TestRunError: Test with id ${id} not found in test suite ${this.name}`);
        }

        if (!this.testDefinitions.pendingTestIds[id]) {
          memo.push(test);
        }

        return memo;
      }, []);
    })();

    const testRun = new TestRun(this, testsToRun.reverse(), this.testDefinitions);

    testRun.onChange('TEST_SUITE_STATUS', (values) => {
      if (this.suiteChangHandler) {
        this.suiteChangHandler(values);
      }
    });

    testRun.onChange('TEST_STATUS', (values) => {
      if (this.testChangHandler) {
        this.testChangHandler(values);
      }
    });

    await testRun.execute();
  }

}

export default TestSuite;
