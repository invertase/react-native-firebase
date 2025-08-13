import type { ReactNativeFirebase } from '@react-native-firebase/app';
import defaultExport, { FirebaseAnalyticsModule } from './namespaced';
import { Statics } from './types/analytics';
export * from './modular';
export * from './namespaced';

export default defaultExport as ReactNativeFirebase.FirebaseModuleWithStatics<
  FirebaseAnalyticsModule,
  Statics
>;
