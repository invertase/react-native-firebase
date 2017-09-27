// import whereTests from './whereTests';

const testGroups = [
  // whereTests,
];

function registerTestSuite(testSuite) {
  testSuite.beforeEach(async function () {
    // todo reset test data
  });

  testSuite.afterEach(async function () {
    // todo reset test data
  });

  testGroups.forEach((testGroup) => {
    testGroup(testSuite);
  });
}


module.exports = registerTestSuite;
