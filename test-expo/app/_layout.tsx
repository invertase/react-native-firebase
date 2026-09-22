import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

import '../src/keepNativeGraph';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.background },
          headerStyle: { backgroundColor: theme.background },
          headerShadowVisible: false,
          headerTintColor: theme.text,
        }}
      />
    </>
  );
}
