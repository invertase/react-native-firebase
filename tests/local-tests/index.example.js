/* eslint-disable react/react-in-jsx-scope */
import { View } from 'react-native';

import { CrashTestComponent } from './crash-test.jsx';

// import your components from your local-tests jsx file here...

const testComponents = [
  CrashTestComponent,

  // List your imported components here...
];

export function TestComponents() {
  return testComponents.map((component, index) => {
    return <View key={index}>{component.call()}</View>;
  });
}
