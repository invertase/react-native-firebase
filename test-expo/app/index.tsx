import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenChrome } from '../src/ScreenChrome';
import { theme } from '../src/theme';

const ROUTES = [
  { href: '/app', label: 'app' },
  { href: '/analytics', label: 'analytics' },
  { href: '/app-check', label: 'app-check' },
  { href: '/auth', label: 'auth' },
  { href: '/crashlytics', label: 'crashlytics' },
  { href: '/database', label: 'database' },
  { href: '/firestore', label: 'firestore' },
  { href: '/functions', label: 'functions' },
  { href: '/installations', label: 'installations' },
  { href: '/messaging', label: 'messaging' },
  { href: '/perf', label: 'perf' },
  { href: '/phone-number-verification', label: 'phone-number-verification' },
  { href: '/remote-config', label: 'remote-config' },
  { href: '/storage', label: 'storage' },
  { href: '/ai', label: 'ai' },
] as const;

export default function HomeScreen() {
  return (
    <ScreenChrome title="test-expo">
      <Text style={styles.subtitle}>One example screen per @react-native-firebase package.</Text>
      <View style={styles.list}>
        {ROUTES.map((route, index) => (
          <Link key={route.href} href={route.href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowBorder,
                pressed && styles.rowPressed,
              ]}
            >
              <Text style={styles.rowLabel}>{route.label}</Text>
              <Text style={styles.chevron}>{'\u203A'}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 15, color: theme.subtleText, marginTop: -8 },
  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: theme.border },
  rowPressed: { backgroundColor: theme.background },
  rowLabel: { fontSize: 16, color: theme.text },
  chevron: { fontSize: 18, color: theme.subtleText },
});
