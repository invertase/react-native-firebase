import * as fcmTypes from '../actions/FCMActions';
import * as appTypes from '../actions/AppActions';

type State = {
  appState: 'string',
  isConnected: boolean,
  fcmToken: string,
};

const initialState = {
  appState: 'active',
  isConnected: true,
  fcmToken: '',
};

function device(state: State = initialState, action: Object): State {

  if (action.type === appTypes.APP_SET_NETWORK_STATE) {
    return {
      ...state,
      isConnected: action.isConnected,
    };
  }

  if (action.type === appTypes.APP_SET_APP_STATE) {
    return {
      ...state,
      appState: action.appState,
    };
  }

  return state;
}

export default device;
