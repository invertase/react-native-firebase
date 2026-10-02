import { Stack } from 'expo-router';

import { theme } from '../../src/theme';
import { ensureAuthEmulator } from './authEmulator';

// Connect before any auth screen mounts and before useAuthUser / onAuthStateChanged.
ensureAuthEmulator();

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        headerStyle: { backgroundColor: theme.background },
        headerShadowVisible: false,
        headerTintColor: theme.text,
      }}
    />
  );
}
