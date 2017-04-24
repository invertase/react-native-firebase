import 'babel-core/register';
import 'babel-polyfill';
import Promise from 'bluebird';
import 'colors';

import RunStatus from './lib/RunStatus';
import LifeCycleTestSuite from './hooks/index';
import TestsTestSuite from './tests/index';

let successfulTests = 0;
let failingTests = 0;
const testErrors = {};

const suites = [
  LifeCycleTestSuite,
  TestsTestSuite,
];

suites.forEach((suite) => {
  suite.setStore({
    getState: () => { return {}; },
  }, (testSuiteAction) => {
    if (testSuiteAction.message) {
      console.error(testSuiteAction.message.red);
      testErrors[suite.description] = {
        message: testSuiteAction.message,
        stackTrace: testSuiteAction.stackTrace,
      };
    }
  },
  (testAction) => {
    const test = suite.testDefinitions.tests[testAction.testId];
    const testContext = suite.testDefinitions.testContexts[test.testContextId];

    const description = (() => {
      if (testContext.name && !test.description.startsWith(testContext.name)) {
        return `${testContext.name} ${test.description}`;
      }

      return test.description;
    })();

    if (testAction.status === RunStatus.OK) {
      console.log(`   ✅  ${description}`.green);
      successfulTests += 1;
    } else if (testAction.status === RunStatus.ERR) {
      console.log(`   ❌  ${description}`.red);
      testErrors[test.description] = {
        message: testAction.message,
        stackTrace: testAction.stackTrace,
      };
      failingTests += 1;
    }
  });
});

Promise.each(suites, (suite) => {
  console.log(`\n\n${suite.name} ${suite.description}:\n\r`);
  return suite.run();
}).then(() => {
  console.log(`\n${successfulTests} tests passed.`);

  if (failingTests) {
    console.log(`${failingTests} tests failed.`);
  }

  if (Object.keys(testErrors).length > 0) {
    console.log('\nErrors:'.red);

    Object.keys(testErrors).forEach((failingTestDescription) => {
      const error = testErrors[failingTestDescription];
      console.error(`\n${failingTestDescription}: ${error.message} \n${error.stackTrace}`.red);
    });
  }
});
