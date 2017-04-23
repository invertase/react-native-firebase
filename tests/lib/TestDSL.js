/**
 * Class that provides DSL for declaratively defining tests. Provides a declarative
 * interface for {@link TestSuiteDefinition} and only reveals methods that are part
 * of the test definition DSL.
 */
class TestDSL {
  /**
   * Create a new instance of TestDSL
   * @param {TestSuiteDefinition} testSuiteDefinition - Class to delegate the heavy lifting
   * of satisfying the DSL, to.
   * @param {Object} firebase - Object containing native and web firebase instances
   * @param {Object} firebase.native - Native firebase instance
   * @para {Object} firebase.web - Web firebase instance
   */
  constructor(testSuiteDefinition, firebase) {
    this._testSuiteDefinition = testSuiteDefinition;

    this.firebase = firebase;

    this.after = this.after.bind(this);
    this.afterEach = this.afterEach.bind(this);

    this.before = this.before.bind(this);
    this.beforeEach = this.beforeEach.bind(this);

    this.describe = this.describe.bind(this);
    /** Alias for {@link TestDSL#describe } */
    this.context = this.describe;
    this.fdescribe = this.fdescribe.bind(this);
    /** Alias for {@link TestDSL#fdescribe } */
    this.fcontext = this.fdescribe;
    this.xdescribe = this.xdescribe.bind(this);
    /** Alias for {@link TestDSL#xdescribe } */
    this.xcontext = this.xdescribe;

    this.tryCatch = this.tryCatch.bind(this);

    this.it = this.it.bind(this);
    this.xit = this.xit.bind(this);
    this.fit = this.fit.bind(this);
  }

  /**
   * Add a function as a before hook to the current test context
   * @param {Object=} options - Options object
   * @param {Number=10000} options.timeout - Number of milliseconds before callback times
   * out
   * @param {Function} callback - Function to add as before hook to current test context
   */
  before(options, callback = undefined) {
    const _options = callback ? options : {};
    const _callback = callback || options;

    this._testSuiteDefinition.addBeforeHook(_callback, _options);
  }

  /**
   * Add a function as a before each hook to the current test context
   * @param {Object=} options - Options object
   * @param {Number=10000} options.timeout - Number of milliseconds before callback times
   * out
   * @param {Function} callback - Function to add as before each hook to current test
   * context
   */
  beforeEach(options, callback = undefined) {
    const _options = callback ? options : {};
    const _callback = callback || options;

    this._testSuiteDefinition.addBeforeEachHook(_callback, _options);
  }

  /**
   * Add a function as a after each hook to the current test context
   * @param {Object=} options - Options object
   * @param {Number=10000} options.timeout - Number of milliseconds before callback times
   * out
   * @param {Function} callback - Function to add as after each hook to current test context
   */
  afterEach(options, callback = undefined) {
    const _options = callback ? options : {};
    const _callback = callback || options;

    this._testSuiteDefinition.addAfterEachHook(_callback, _options);
  }

  /**
   * Add a function as a after hook to the current test context
   * @param {Object=} options - Options object
   * @param {Number=10000} options.timeout - Number of milliseconds before callback times
   * out
   * @param {Function} callback - Function to add as after hook to current test context
   */
  after(options, callback = undefined) {
    const _options = callback ? options : {};
    const _callback = callback || options;

    this._testSuiteDefinition.addAfterHook(_callback, _options);
  }

  /**
   * Starts a new test context
   * @param {String} name - name of new test context
   * @param {ContextOptions} options - options for context
   * @param {Function} [testDefinitions={}] - function that defines further test contexts and
   * tests using the test DSL
   */
  describe(name, options, testDefinitions) {
    let _testDefinitions;
    let _options;

    if (testDefinitions) {
      _testDefinitions = testDefinitions;
      _options = options;
    } else {
      _testDefinitions = options;
      _options = {};
    }

    this._testSuiteDefinition.pushTestContext(name, _options);
    _testDefinitions();
    this._testSuiteDefinition.popTestContext();
  }

  /**
   * Starts a new pending test context. Tests in a pending test context are not
   * run when the test suite is executed. They also appear greyed out.
   * @param {String} name - name of new test context
   * @param {ContextOptions} [options={}] - options for context
   * @param {Function} testDefinitions - function that defines further test contexts and
   * tests using the test DSL
   */
  xdescribe(name, options, testDefinitions = undefined) {
    let _options = {};
    let _testDefinitions;

    if (typeof options === 'function') {
      _options = { pending: true };
      _testDefinitions = options;
    } else {
      Object.assign(_options, options, { pending: true });
      _testDefinitions = testDefinitions;
    }

    this.describe(name, _options, _testDefinitions);
  }

  /**
   * Starts a new focused test context. Tests in a focused test context are the only
   * ones that appear and are run when the test suite is executed.
   * @param {String} name - name of new test context
   * @param {ContextOptions} [options={}] - options for context
   * @param {Function} testDefinitions - function that defines further test contexts and
   * tests using the test DSL
   */
  fdescribe(name, options, testDefinitions = undefined) {
    let _options = {};
    let _testDefinitions;

    if (typeof options === 'function') {
      _options = { focus: true };
      _testDefinitions = options;
    } else {
      Object.assign(_options, options, { focus: true });
      _testDefinitions = testDefinitions;
    }

    this.describe(name, _options, _testDefinitions);
  }

  /**
   * Defines a new test.
   * @param {String} description - Brief description of what the test expects
   * @param {TestOptions} options - Options of whether test should be focused or pending
   * @param {Function} testFunction - Body of the test containing setup and assertions
   */
  it(description, options, testFunction = undefined) {
    this._testSuiteDefinition.addTest(description, options, testFunction);
  }

  /**
   * Defines a new pending test. Pending tests are not run when the test suite is
   * executed. They also appear greyed out.
   * @param {String} description - Brief description of what the test expects
   * @param {ContextOptions} [options={}] - Options of whether test should be focused or pending
   * @param {Function} testFunction - Body of the test containing setup and assertions
   */
  xit(description, options, testFunction = undefined) {
    let _options = {};
    let _testFunction;

    if (typeof options === 'function') {
      _options = { pending: true };
      _testFunction = options;
    } else {
      Object.assign(_options, options, { pending: true });
      _testFunction = testFunction;
    }

    this.it(description, _options, _testFunction);
  }


  /**
   * Defines a new focused test. Focused tests are the only
   * ones that appear and are run when the test suite is executed.
   * @param {String} description - Brief description of what the test expects
   * @param {ContextOptions} [options={}] - Options of whether test should be focused or pending
   * @param {Function} testFunction - Body of the test containing setup and assertions
   */
  fit(description, options, testFunction = undefined) {
    let _options = {};
    let _testFunction;

    if (typeof options === 'function') {
      _options = { focus: true };
      _testFunction = options;
    } else {
      Object.assign(_options, options, { focus: true });
      _testFunction = testFunction;
    }

    this.it(description, _options, _testFunction);
  }

  /**
   * Tries evaluating a function and calls a reject callback if it throws an error
   * @param {Function} callback - Function to evaluate
   * @param {Function} reject - Function to call if callback throws an error
   * @returns {function(...[*])} a function that will catch any errors thrown by callback,
   * passing them to reject instead.
   */
  tryCatch(callback, reject) {
    return (...args) => {
      try {
        callback(...args);
      } catch (error) {
        reject(error);
      }
    };
  }
}

/**
 * Log a test DSL error to the console.
 * @param {String} error - Message to included in message logged to the console
 */
function testDSLError(error) {
  console.error(`ReactNativeFirebaseTests.TestDSLError: ${error}`);
  console.error('This test was ignored.');
}
export default TestDSL;
