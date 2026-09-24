import type { ReactNode } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from './AppButton';
import { theme } from './theme';

type ScreenChromeProps = {
  title: string;
  onRun?: () => void;
  result?: string | null;
  error?: string | null;
  children?: ReactNode;
};

export function ScreenChrome({ title, onRun, result, error, children }: ScreenChromeProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <Image
            accessibilityIgnoresInvertColors
            source={require('../assets/Invertase_icon_honey.png')}
            style={styles.titleLogo}
          />
          <Text style={styles.title}>{title}</Text>
        </View>

        {onRun ? (
          <View style={styles.runButton}>
            <AppButton title="Run" onPress={onRun} />
          </View>
        ) : null}

        {result ? (
          <View style={[styles.banner, styles.successBanner]}>
            <Text style={[styles.bannerLabel, styles.successLabel]}>Result</Text>
            <Text style={styles.bannerText}>{result}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.banner, styles.errorBanner]}>
            <Text style={[styles.bannerLabel, styles.errorLabel]}>Error</Text>
            <Text style={[styles.bannerText, styles.errorText]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.children}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  content: { padding: 20, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleLogo: { width: 35, height: 32 },
  title: { fontSize: 30, fontWeight: '700', color: theme.text },
  runButton: { alignSelf: 'flex-start' },
  banner: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 4 },
  successBanner: { backgroundColor: theme.successBackground, borderColor: theme.successBorder },
  errorBanner: { backgroundColor: theme.errorBackground, borderColor: theme.errorBorder },
  bannerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  successLabel: { color: theme.success },
  errorLabel: { color: theme.error },
  bannerText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.text,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  errorText: { color: theme.error },
  children: { gap: 12 },
});
