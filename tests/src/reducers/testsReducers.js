import { flatten, unflatten } from 'deeps';
import * as testActions from '../actions/TestActions';
import { initialState } from '../tests/index';

const initState = initialState();

function testsReducers(state = initState.tests, action: Object): State {
  if (action.type === testActions.TEST_SET_STATUS) {
    const flattened = flatten(state);

    flattened[`${action.testId}.status`] = action.status;
    flattened[`${action.testId}.message`] = action.message;
    flattened[`${action.testId}.time`] = action.time;
    flattened[`${action.testId}.stackTrace`] = action.stackTrace;

    return unflatten(flattened);
  }

  return state;
}

export default testsReducers;
