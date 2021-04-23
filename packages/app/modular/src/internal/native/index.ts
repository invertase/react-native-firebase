import * as impl from './module';
import { NativeModule, NativeModuleOptions } from './types';

export function getNativeModule<T = unknown>(options: NativeModuleOptions): NativeModule<T> {
  return impl.getNativeModule<T>(options);
}
