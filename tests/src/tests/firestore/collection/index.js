// import docSnapTests from './docSnapTests';
// import querySnapTests from './querySnapTests';
// import onSnapshotTests from './onSnapshotTests';
// import bugTests from './bugTests';
import whereTests from './whereTests';

const testGroups = [
  // onSnapshotTests,
  // querySnapTests,
  // docSnapTests,
  // bugTests,
  whereTests,
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
