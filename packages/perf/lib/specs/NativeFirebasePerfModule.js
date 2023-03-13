// @flow
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  +getConstants: () => {|
    isPerformanceCollectionEnabled: boolean,
    isInstrumentationEnabled: boolean,
  |};

  +setPerformanceCollectionEnabled: (enabled: boolean) => Promise<boolean>;
  +startTrace: (id: Int32, identifier: string) => Promise<void>;
  +stopTrace: (id: Int32, traceData: Object) => Promise<void>;
  +startScreenTrace: (id: Int32, identifier: string) => Promise<void>;
  +stopScreenTrace: (id: Int32) => Promise<void>;
  +startHttpMetric: (id: Int32, url: string, httpMethod: string) => Promise<void>;
  +stopHttpMetric: (id: Int32, metricData: Object) => Promise<void>;
  +instrumentationEnabled: (enabled: boolean) => Promise<void>;
}
  
export default (TurboModuleRegistry.get<Spec>('RNFBPerfModule'): ?Spec);
