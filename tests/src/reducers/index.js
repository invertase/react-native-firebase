import { combineReducers } from 'redux';

import device from './device';
import tests from './testsReducers';
import testContexts from './testContextsReducers';
import testSuites from './testSuitesReducers';
import pendingTestIds from './pendingTestIdsReducers';
import focusedTestIds from './focusedTestIdsReducers';

export default combineReducers({
  device,
  pendingTestIds,
  focusedTestIds,
  testContexts,
  tests,
  testSuites,
});
