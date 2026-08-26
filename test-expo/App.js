import { getApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';
import { Text, View } from 'react-native';

// Referencing both native modules here (not just declaring them as
// dependencies) keeps the JS graph from tree-shaking/dead-code-eliminating
// the native dependency before it ever reaches the linker. This fixture
// exists only to exercise the native iOS link step for GitHub #9158
// (missing app-target FirebaseCore) and #9202 (duplicate Firebase symbols
// from static RNFB archives) under SPM + dynamic frameworks. It never runs.
getMessaging(getApp());

export default function App() {
  return (
    <View>
      <Text>test-expo</Text>
    </View>
  );
}
