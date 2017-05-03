import { initialState } from '../tests/index';

const initState = initialState();

function testsReducers(state = initState.testContexts): State {
  return state;
}

export default testsReducers;
