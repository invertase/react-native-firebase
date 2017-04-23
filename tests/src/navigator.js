import { StackNavigator } from 'react-navigation';

import Overview from './screens/Overview';
import Suite from './screens/Suite';
import Test from './screens/Test';

export default StackNavigator({
  Overview: { screen: Overview },
  Suite: { screen: Suite },
  Test: { screen: Test },
});

export const initialNavState = {
  index: 0,
  routes: [
    {
      key: 'Overview',
    },
  ],
};
