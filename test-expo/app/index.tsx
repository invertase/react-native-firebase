import { Link } from 'expo-router';
import { Text } from 'react-native';

import { ScreenChrome } from '../src/ScreenChrome';

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
      {ROUTES.map(route => (
        <Link key={route.href} href={route.href}>
          <Text>{route.label}</Text>
        </Link>
      ))}
    </ScreenChrome>
  );
}
