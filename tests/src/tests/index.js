import { setSuiteStatus, setTestStatus } from '../actions/TestActions';
import analytics from './analytics';
import crash from './crash';
import core from './core';
import database from './database';
import messaging from './messaging';
import storage from './storage';
import auth from './auth';
import config from './config';
import performance from './perf';
import admob from './admob';
import firestore from './firestore';
import links from './links/index';

window.getCoverage = function getCoverage() {
  return (JSON.stringify(global.__coverage__));
};

const testSuiteInstances = [
  admob,
  analytics,
  auth,
  config,
  core,
  crash,
  database,
  firestore,
  messaging,
  performance,
  storage,
  links,
];

/*
  A map of test suite instances to their ids so they may be retrieved
  at run time and called upon to run individual tests
 */
const testSuiteRunners = {};

/*
  Attributes to hold initial Redux store state
 */
const testSuites = {};
const tests = {};
const focusedTestIds = {};
const pendingTestIds = {};
const testContexts = {};

/**
 * @typedef {number} TestId
 * @typedef {number} TestSuiteId
 *
 * @typedef {Object} Test
 * @property {number} id
 * @property {number} testSuiteId
 *
 * @typedef {Object} TestSuite
 * @property {number} id
 * @property {TestId[]} testIds
 *
 * @typedef {Object.<TestId,Test>} IndexedTestGroup
 * @typedef {Object.<TestSuiteId,TestSuite>} IndexedTestSuiteGroup
 * @typedef {Object.<TestId,bool>} IdLookup
 */

/**
 * Return initial state for the tests to provide to Redux
 * @returns {{suites: {}, descriptions: {}}}
 */
export function initialState() {
  testSuiteInstances.forEach((testSuite) => {
    const { id, name, description } = testSuite;

    // Add to test suite runners for later recall
    testSuiteRunners[testSuite.id] = testSuite;

    const testDefinitions = testSuite.testDefinitions;

    // Add to test suites to place in the redux store
    testSuites[testSuite.id] = {
      id,
      name,
      description,

      testContextIds: Object.keys(testDefinitions.testContexts),
      testIds: Object.keys(testDefinitions.tests),

      status: null,
      message: null,
      time: 0,
      progress: 0,
    };

    Object.assign(tests, testDefinitions.tests);
    Object.assign(testContexts, testDefinitions.testContexts);
    Object.assign(focusedTestIds, testDefinitions.focusedTestIds);
    Object.assign(pendingTestIds, testDefinitions.pendingTestIds);
  });

  return {
    tests,
    testSuites,
    testContexts,
    focusedTestIds,
    pendingTestIds,
  };
}

/**
 * Provide a redux store to the test suites
 * @param store
 */
export function setupSuites(store) {
  Object.values(testSuiteRunners).forEach((testSuite) => {
    // eslint-disable-next-line no-param-reassign
    testSuite.setStore(store, (action) => {
      store.dispatch(setSuiteStatus(action));
    }, (action) => {
      store.dispatch(setTestStatus(action));
    });
  });
}

/**
 * Run a single test by id, ignoring whether it's pending or focused.
 * @param {number} testId - id of test to run
 */
export function runTest(testId) {
  const test = tests[testId];

  runTests({ [testId]: test });
}

/**
 * Run all tests in all test suites. If testIds is provided, only run the tests
 * that match the ids included.
 * @params {IndexedTestGroup} testGroup - Group of tests to run
 * @param {Object=} options - options limiting which tests should be run
 * @param {IdLookup} options.pendingTestIds - map of ids of pending tests
 * @param {IdLookup} options.focusedTestIds - map of ids of focused tests
 */
export function runTests(testGroup, options = { pendingTestIds: {}, focusedTestIds: {} }) {
  const areFocusedTests = Object.keys(options.focusedTestIds).length > 0;

  if (areFocusedTests) {
    runOnlyTestsInLookup(testGroup, options.focusedTestIds);
  } else {
    const arePendingTests = Object.keys(options.pendingTestIds).length > 0;

    if (arePendingTests) {
      runAllButTestsInLookup(testGroup, options.pendingTestIds);
    } else {
      const testsBySuiteId = getTestsBySuiteId(testGroup);
      runTestsBySuiteId(testsBySuiteId);
    }
  }
}

/**
 * Runs all tests listed in tests, except those with ids matching values in
 * testLookup
 * @param {IndexedTestGroup} testGroup - complete list of tests
 * @param {IdLookup} testLookup - id lookup of pending tests
 */
function runAllButTestsInLookup(testGroup, testLookup) {
  const testsToRunBySuiteId = Object.keys(testGroup).reduce((memo, testId) => {
    const testIsNotPending = !testLookup[testId];

    if (testIsNotPending) {
      const test = testGroup[testId];
      // eslint-disable-next-line no-param-reassign
      memo[test.testSuiteId] = memo[test.testSuiteId] || [];
      memo[test.testSuiteId].push(testId);
    }

    return memo;
  }, {});

  Promise.each(Object.keys(testsToRunBySuiteId), (testSuiteId) => {
    const testIds = testsToRunBySuiteId[testSuiteId];
    return runSuite(testSuiteId, testIds);
  });
}

/**
 * Runs only the tests listed in focused tests
 * @param {IndexedTestGroup} testGroup - complete list of tests
 * @param {IdLookup} testLookup - id lookup of focused tests
 */
function runOnlyTestsInLookup(testGroup, testLookup) {
  const testsInLookupBySuiteId = getTestsBySuiteId(testGroup, testLookup);
  runTestsBySuiteId(testsInLookupBySuiteId);
}

function runTestsBySuiteId(suiteIdTests) {
  Promise.each(Object.keys(suiteIdTests), (testSuiteId) => {
    const testIds = suiteIdTests[testSuiteId];

    return runSuite(testSuiteId, testIds);
  });
}

/**
 * Run tests in a suite. If testIds is provided, only run the tests that match the
 * ids included.
 * @param {number} testSuiteId - Id of test suite to run
 * @param {number[]=} testIds - array of test ids to run from the test suite
 */
function runSuite(testSuiteId, testIds = null) {
  const testSuiteRunner = testSuiteRunners[testSuiteId];

  if (testSuiteRunner) {
    return testSuiteRunner.run(testIds);
  }

  console.error(`runSuite: Suite with id "${testSuiteId}" not found`);
  return Promise.reject();
}

function getTestsBySuiteId(testGroup, testLookup = testGroup) {
  return Object.keys(testLookup).reduce((memo, testId) => {
    const test = testGroup[testId];

    if (test) {
      // eslint-disable-next-line no-param-reassign
      memo[test.testSuiteId] = memo[test.testSuiteId] || [];
      memo[test.testSuiteId].push(testId);
    }

    return memo;
  }, {});
}
