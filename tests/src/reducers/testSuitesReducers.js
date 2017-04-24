import * as testActions from '../actions/TestActions';
import { flatten, unflatten } from 'deeps';
import { initialState } from '../tests/index';

const initState = initialState();

function testsReducers(state = initState.testSuites, action: Object): State {

  if (action.type === testActions.TEST_SET_SUITE_STATUS) {
    const flattened = flatten(state);

    if (action.status) flattened[`${action.suiteId}.status`] = action.status;
    if (action.message) flattened[`${action.suiteId}.message`] = action.message;
    if (action.progress) flattened[`${action.suiteId}.progress`] = action.progress;
    if (!isNaN(action.time)) flattened[`${action.suiteId}.time`] = action.time;

    return unflatten(flattened);
  }

  return state;
}

export default testsReducers;
