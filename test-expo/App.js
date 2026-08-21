import { getApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';
import { Text, View } from 'react-native';

// Referencing both native modules here (not just declaring them as
// dependencies) keeps the JS graph from tree-shaking/dead-code-eliminating
// the native dependency before it ever reaches the linker. This fixture
// exists only to exercise the native iOS link step for CPRN-301 /
// GitHub #9158 (undefined `_OBJC_CLASS_$_FIRApp` / missing app-target
// FirebaseCore under SPM + dynamic frameworks) - it is never meant to run.
getMessaging(getApp());

export default function App() {
  return (
    <View>
      <Text>test-expo</Text>
    </View>
  );
}
