import { getApp } from '@react-native-firebase/app';
import { Text, View } from 'react-native';

// Keep @react-native-firebase/app in the JS graph so autolink includes the
// native module. This fixture exists to compile the documented RN CLI iOS
// path (SPM + dynamic frameworks + prebuilt RNCore) for GitHub #8883.
getApp();

export default function App() {
  return (
    <View>
      <Text>test-rn-bare</Text>
    </View>
  );
}
