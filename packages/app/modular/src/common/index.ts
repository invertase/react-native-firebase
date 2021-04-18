import { Platform } from 'react-native';

export * from './guards';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isWeb = Platform.OS === 'web';

export function noop(): void {
  // noop-🐈
}

export async function asyncNoop(): Promise<void> {
  // noop-...-🐈
}
