import type { ReactNode } from 'react';
import { Button, Text, View } from 'react-native';

type ScreenChromeProps = {
  title: string;
  onRun?: () => void;
  result?: string | null;
  error?: string | null;
  children?: ReactNode;
};

export function ScreenChrome({ title, onRun, result, error, children }: ScreenChromeProps) {
  return (
    <View>
      <Text>{title}</Text>
      {onRun ? <Button title="Run" onPress={onRun} /> : null}
      {result ? <Text>{result}</Text> : null}
      {error ? <Text>{error}</Text> : null}
      {children}
    </View>
  );
}
