import type { TextInputProps } from 'react-native';
import { StyleSheet, TextInput } from 'react-native';

import { theme } from './theme';

/** Styled stand-in for the borderless platform-default `<TextInput>`. */
export function TextField(props: TextInputProps) {
  return <TextInput placeholderTextColor={theme.placeholder} style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.card,
  },
});
