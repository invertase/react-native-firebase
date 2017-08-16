import TestDSL from './TestDSL';

/**
 * Incrementing counter to assign each test context a globally unique id.
 * @type {number} Counter that maintains globally unique id and increments each time
 * a new id is assigned
 */
let testContextCounter = 0;

/**
 * Incrementing counter to assign each test a globally unique id.
 * @type {number} Counter that maintains globally unique id and increments each time
 * a new id is assigned
 */
let testCounter = 0;

/**
 * Increment the testCounter and return the new value. Used
 * for assigning a new globally unique id to a test.
 * @returns {number} globally unique id assigned to each test
 */
function assignTestId() {
  testCounter += 1;
  return testCounter;
}

/**
 * Increment the testContextCounter and return the new value. Used
 * for assigning a new globally unique id to a test context.
 * @returns {number} globally unique id assigned to each test context
 */
function assignContextId() {
  testContextCounter += 1;
  return testContextCounter;
}

/**
 * Enum for operators that can be used when combining test properties with their
 * parents at definition time.
 * @readonly
 * @enum {String} ContextOperator
 */
const CONTEXT_OPERATORS = {
  /** Perform OR of test value with context chain values **/
  OR: 'OR',
};

/**
 * Class that provides imperative interface for defining tests. When defining tests
 * the declarative interface for this class, {@link TestDSL} should be use instead.
 */
class TestSuiteDefinition {
  /**
   * Creates a new TestSuiteDefinition
   * @param {TestSuite} testSuite - The {@link TestSuite} instance for which to
   * define tests for.
   * @param {Object} firebase - Object containing native and web firebase instances
   * @param {Object} firebase.native - Native firebase instance
   * @para {Object} firebase.web - Web firebase instance
   */
  constructor(testSuite, firebase) {
    this.testSuite = testSuite;

    this.tests = {};
    this.pendingTestIds = {};
    this.focusedTestIds = {};

    this.testContexts = {};

    this.rootTestContextId = assignContextId();
    this.rootTestContext = this._initialiseContext(this.rootTestContextId, {
      name: '',
      focus: false,
      pending: false,
      parentContextId: null,
    });

    this.currentTestContext = this.rootTestContext;

    this._testDSL = new TestDSL(this, firebase);
  }

  /**
   * Get the instance of {@link TestDSL} used for declaratively defining tests
   * @returns {TestDSL} The TestDSL used for defining tests
   */
  get DSL() {
    return this._testDSL;
  }

  /**
   * Add a function as a before hook to the current test context
   * @param {Function} callback - Function to add as before hook to current test context
   */
  addBeforeHook(callback, options = {}) {
    this._addHook('before', callback, options);
  }

  /**
   * Add a function as a before each hook to the current test context
   * @param {Function} callback - Function to add as before each hook to current test
   * context
   */
  addBeforeEachHook(callback, options = {}) {
    this._addHook('beforeEach', callback, options);
  }

  /**
   * Add a function as a after each hook to the current test context
   * @param {Function} callback - Function to add as after each hook to current test context
   */
  addAfterEachHook(callback, options = {}) {
    this._addHook('afterEach', callback, options);
  }

  /**
   * Add a function as a after hook to the current test context
   * @param {Function} callback - Function to add as after hook to current test context
   */
  addAfterHook(callback, options = {}) {
    this._addHook('after', callback, options);
  }

  /**
   * Add a function to the list of hooks matching hookName, for the current test context
   * @param {('before'|'beforeEach'|'afterEach'|'after')} hookName - The name of the hook to add the function to
   * @param {Function} callback - Function to add as a hook
   * @param {Object=} options - Hook configuration options
   * @private
   */
  _addHook(hookName, callback, options = {}) {
    const hookAttribute = `${hookName}Hooks`;

    if (callback && typeof callback === 'function') {
      this.currentTestContext[hookAttribute] = this.currentTestContext[hookAttribute] || [];
      this.currentTestContext[hookAttribute].push({
        callback,
        timeout: options.timeout || 15000,
      });
    } else {
      testDefinitionError(`non-function value ${callback} passed to ${hookName} for '${this.currentTestContext.name}'`);
    }
  }

  /**
   * @typedef {Object} ContextOptions
   * @property {Boolean} [focused=undefined] - whether context is focused or not.
   * @property {Boolean} [pending=undefined] - whether context is pending or not.
   */

  /**
   * @typedef {Object} TestOptions
   * @extends ContextOptions
   * @property {Number} [timeout=5000] - Number of milliseconds before test times out
   */

  /**
   * Push a test context onto the context stack, making it the new current test context
   * @param {String} name - The name of the new context
   * @param {ContextOptions} options - Options for new context
   */
  pushTestContext(name, options = {}) {
    const testContextId = assignContextId();
    const parentContext = this.currentTestContext;
    this.currentTestContext = this._initialiseContext(testContextId, Object.assign({ name, parentContextId: parentContext.id }, options));
  }

  /**
   * Pop test context off the context stack, making the previous context the new
   * current context.
   */
  popTestContext() {
    const parentContextId = this.currentTestContext.parentContextId;
    this.currentTestContext = this.testContexts[parentContextId];
  }

  /**
   * Add a test to the current test context
   * @param {String} description - The new test's description
   * @param {ContextOptions} options - The options for the new test
   * @param {Function} testFunction - The function that comprises the test's body
   */
  addTest(description, options, testFunction = undefined) {
    let _testFunction;
    let _options;

    if (testFunction) {
      _testFunction = testFunction;
      _options = options;
    } else {
      _testFunction = options;
      _options = {};
    }

    if (_testFunction && typeof _testFunction === 'function') {
      // Create test
      const testId = assignTestId();

      this._createTest(testId, {
        testContextId: this.currentTestContext.id,
        testSuiteId: this.testSuite.id,
        description: this._testDescriptionContextPrefix(this.currentTestContext) + description,
        func: _testFunction,
        timeout: _options.timeout || 5000,
      });

      // Add tests to context
      this.currentTestContext.testIds.push(testId);

      if (_options.focus || this.currentTestContext.focus) {
        this.focusedTestIds[testId] = true;
      }

      if (_options.pending || this.currentTestContext.pending) {
        this.pendingTestIds[testId] = true;
      }
    } else {
      testDefinitionError(`Invalid test function for "${description}".`);
    }
  }

  /**
   * Get the prefix to prepend to a test to fully describe it. Any context that is
   * nested 2 or more deep, i.e. non the root context nor a child of the root context,
   * has its name recursively prepended to all tests in that context or contexts it
   * contains. This allows tests to be easily displayed in a LinkedList during viewing
   * and reporting the test suite.
   * @param {Object} contextProperties - Properties of current context
   * @param {Number} contextProperties.id - Id of context
   * @param {String} contextProperties.name - Name of context
   * @param {Number} contextProperties.parentContextId - Id of context's parent
   * @param {String} [suffix=''] - Accumulation of context prefixes so far. Starts empty
   * and collects context prefixes as it recursively calls itself to iterate up the
   * context tree.
   * @returns {String} Prefix to be prepended to current accumulative string of context
   * names
   * @private
   */
  _testDescriptionContextPrefix({ id, name, parentContextId }, suffix = '') {
    if (id === this.rootTestContextId || parentContextId === this.rootTestContextId) {
      return suffix;
    }

    return this._testDescriptionContextPrefix(this.testContexts[parentContextId], `${name} ${suffix}`);
  }

  /**
   * @typedef {Object} TestContext
   * @property {Number} id - Globally unique id
   * @property {String} name - Short description of context
   * @property {Boolean} [focus=false] - Whether context is focused
   * @property {Boolean} [pending=false] - Whether context is pending
   * @property {Number} [parentContextId=undefined] - Id of context that contains the current one
   * @property {Number[]} testIds - List of ids of tests to be run in current context
   * @property {Number} testSuiteId - Id of test suite test context is apart of
   */

  /**
   * Create a context from options provided
   * @param {Number} testContextId - Id to assign to new context once it's created
   * @param {Object} options - options to use to create the context
   * @param {String} options.name - Name of context to create
   * @param {Boolean} options.focus - Whether context is focused or not
   * @param {Boolean} options.pending - Whether context is pending or not
   * @param {Number} [options.parentContextId=undefined] - Id of context's parent
   * @returns {TestContext} New test context once it has been initialised
   * @private
   */
  _initialiseContext(testContextId, { name, focus, pending, parentContextId }) {
    const existingContext = this.testContexts[testContextId];

    if (existingContext) {
      return existingContext;
    }

    const parentContext = this.testContexts[parentContextId];

    const newTestContext = {
      id: testContextId,
      name,
      focus: this._incorporateParentValue(parentContext, 'focus', focus, CONTEXT_OPERATORS.OR),
      pending: this._incorporateParentValue(parentContext, 'pending', pending, CONTEXT_OPERATORS.OR),
      parentContextId,
      testIds: [],
      testSuiteId: this.testSuite.id,
    };

    this.testContexts[testContextId] = newTestContext;

    return newTestContext;
  }

  /**
   * Recursively use an operator to consolidate a test's value with that of its test
   * context chain.
   * @param {TestContext} parentContext - Parent context to examine for its value
   * @param {String} attributeName - name of the attribute to use from parent
   * @param {*} value - Value of current context or test to use as one operand with
   * the parent context's value
   * @param {('OR')} operator - Operator to use to consolidate current value and
   * parent context's value
   * @returns {*} Consolidated value, encorporating context parents' values
   * @private
   */
  _incorporateParentValue(parentContext, attributeName, value, operator) {
    if (!parentContext) {
      return value;
    }

    switch (operator) {
      case CONTEXT_OPERATORS.OR:
        return parentContext[attributeName] || value;
      default:
        throw new Error(`Unknown context operator ${operator}`);
    }
  }

  /**
   * Create a new test from the options provided and add it to the suite
   * @param {Number} testId - Unique id to give to the test
   * @param {Object} testAttributes - attributes to create the test with
   * @param {Number} testAttributes.testContextId - Id of context test belongs to
   * @param {String} testAttributes.description - Short description of the test
   * @param {Function} testAttributes.func - Function that comprises the body of the test
   * @param {Number} testAttributes.testSuiteId - Id of test suite test belongs to
   * @param {Number} testAttributes.timeout - Number of milliseconds before test times out
   * @returns {Test} New test matching provided options
   * @private
   */
  _createTest(testId, { testContextId, description, func, testSuiteId, timeout }) {
    const newTest = {
      id: testId,
      testContextId,
      description,
      func,
      testSuiteId,
      status: null,
      message: null,
      time: 0,
      timeout,
    };

    this.tests[testId] = newTest;

    return newTest;
  }

}

/**
 * Log test definition error to the console with a message indicating the test
 * definition was skipped.
 * @param {String} error - Error message to include in message logged to the console
 */
function testDefinitionError(error) {
  console.error(`ReactNativeFirebaseTests.TestDefinitionError: ${error}`);
  console.error('This test was ignored.');
}

export default TestSuiteDefinition;
