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
            <Pressable style={({ pressed }) => [pressed && styles.rowPressed]}>
              <View style={[styles.row, index > 0 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{route.label}</Text>
                <Text style={styles.chevron}>{'\u203A'}</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 17, color: theme.subtleText, marginTop: -8 },
  list: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: theme.border },
  rowPressed: { backgroundColor: theme.background },
  rowLabel: { fontSize: 19, color: theme.text, fontWeight: '500' },
  chevron: { fontSize: 20, color: theme.subtleText },
});
