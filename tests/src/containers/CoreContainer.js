// @flow
import React from 'react';
import { View, Text, AppState, NetInfo, StatusBar, Platform } from 'react-native';
import { connect } from 'react-redux';

import Navigator from '../navigator';
import { setNetworkState, setAppState } from '../actions/AppActions';

type Props = {
  dispatch: () => void,
};

class CoreContainer extends React.Component {

  constructor() {
    super();
    this._isConnected = false;
  }

  /**
   * On app mount, listen for changes to app & network state
   */
  componentDidMount() {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#1976D2');
    }
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('light-content');
    }
    AppState.addEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.fetch().then((isConnected) => {
      this.handleAppStateChange('active'); // Force connect (react debugger issue)
      this.props.dispatch(setNetworkState(isConnected));
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
  }

  /**
   * Remove listeners on app unmount
   */
  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
  }

  props: Props;
  _isConnected: boolean;

  /**
   * Handle app state changes
   * https://facebook.github.io/react-native/docs/appstate.html
   * @param state
   */
  handleAppStateChange = (state) => {
    this.props.dispatch(setAppState(state));
    if (state === 'active' && this._isConnected) {
      // firestack.database().goOnline();
    } else if (state === 'background') {
      // firestack.database().goOffline();
    }
  };

  /**
   * Handle app network changes
   * https://facebook.github.io/react-native/docs/netinfo.html
   * @param isConnected
   */
  handleNetworkChange = (isConnected) => {
    this._isConnected = isConnected;
    this.props.dispatch(setNetworkState(isConnected));
    if (isConnected) {
      // firestack.database().goOnline();
    } else {
      // firestack.database().goOffline();
    }
  };

  render() {
    return <Navigator onNavigationStateChange={null} />;
  }
}

export default connect()(CoreContainer);
