import React from 'react';
import HarnessHomeScreen from './HarnessHomeScreen';
import Reproduction from './Reproduction';
import {ACTIVE_SCREEN} from './screenConfig';

function App(): React.JSX.Element {
  if (ACTIVE_SCREEN === 'reproduction') {
    return <Reproduction />;
  }

  return <HarnessHomeScreen />;
}

export default App;
