import { initialState } from '../tests';

const initState = initialState();

function pendingTestIdsReducers(state = initState.pendingTestIds): State {
  return state;
}

export default pendingTestIdsReducers;
