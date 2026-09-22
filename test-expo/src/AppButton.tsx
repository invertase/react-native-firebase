import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from './theme';

type Variant = 'primary' | 'secondary';

function containerStyle(variant: Variant, pressed: boolean) {
  return [
    styles.button,
    variant === 'primary' ? styles.primary : styles.secondary,
    pressed && styles.pressed,
  ];
}

function labelStyle(variant: Variant) {
  return [styles.label, variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel];
}

/** Pressable button used in place of the platform-default `<Button>`. */
export function AppButton({
  title,
  onPress,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => containerStyle(variant, pressed)}>
      <Text style={labelStyle(variant)}>{title}</Text>
    </Pressable>
  );
}

/** Same visual as `AppButton`, but navigates via expo-router instead of firing a callback. */
export function LinkButton({
  title,
  href,
  variant = 'secondary',
}: {
  title: string;
  href: Href;
  variant?: Variant;
}) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => containerStyle(variant, pressed)}>
        <Text style={labelStyle(variant)}>{title}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  primary: { backgroundColor: theme.accent },
  secondary: { backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.accent },
  pressed: { opacity: 0.7 },
  label: { fontSize: 16, fontWeight: '600' },
  primaryLabel: { color: theme.background },
  secondaryLabel: { color: theme.accent },
});
