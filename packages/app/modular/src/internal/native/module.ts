import { NativeModuleOptions, NativeModule } from './types';

// Stub for web
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getNativeModule<T>(_options: NativeModuleOptions): NativeModule<T> {
  return {} as NativeModule<T>;
}
