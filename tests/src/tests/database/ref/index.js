import onTests from './on/onTests';
import onValueTests from './on/onValueTests';
import offTests from './offTests';
import onceTests from './onceTests';
import setTests from './setTests';
import updateTests from './updateTests';
import removeTests from './removeTests';
import pushTests from './pushTests';
import factoryTests from './factoryTests';
import keyTests from './keyTests';
import parentTests from './parentTests';
import childTests from './childTests';
import isEqualTests from './isEqualTests';
import refTests from './refTests';
import rootTests from './rootTests';
import transactionTests from './transactionTests';
import queryTests from './queryTests';
import issueSpecificTests from './issueSpecificTests';

import DatabaseContents from '../../support/DatabaseContents';

const testGroups = [
  issueSpecificTests, factoryTests, keyTests, parentTests, childTests, rootTests,
  pushTests, onTests, onValueTests, offTests, onceTests, updateTests,
  removeTests, setTests, transactionTests, queryTests, refTests, isEqualTests,
];

function registerTestSuite(testSuite) {
  testSuite.beforeEach(async function () {
    this._databaseRef = testSuite.firebase.native.database().ref('tests/types');

    await this._databaseRef.set(DatabaseContents.DEFAULT);
    await this._databaseRef.parent.child('issues').set(DatabaseContents.ISSUES);
  });

  testSuite.afterEach(async function () {
    await this._databaseRef.set(DatabaseContents.DEFAULT);
    await this._databaseRef.parent.child('issues').set(DatabaseContents.ISSUES);
  });

  testGroups.forEach((testGroup) => {
    testGroup(testSuite);
  });
}


module.exports = registerTestSuite;
