import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type HttpMethod =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

export interface TraceData {
  metrics: { [key: string]: number };
  attributes: { [key: string]: string };
}

export interface HttpMetricData {
  attributes: { [key: string]: string };
  httpResponseCode?: number;
  requestPayloadSize?: number;
  responsePayloadSize?: number;
  responseContentType?: string;
}

export interface Spec extends TurboModule {
  getConstants(): {
    isPerformanceCollectionEnabled: boolean;
    isInstrumentationEnabled: boolean;
  };

  setPerformanceCollectionEnabled(enabled: boolean): Promise<void>;
  instrumentationEnabled(enabled: boolean): Promise<void>;
  startTrace(id: number, identifier: string): Promise<void>;
  stopTrace(id: number, traceData: TraceData): Promise<void>;
  startScreenTrace(id: number, identifier: string): Promise<void>;
  stopScreenTrace(id: number): Promise<void>;
  startHttpMetric(id: number, url: string, httpMethod: HttpMethod): Promise<void>;
  stopHttpMetric(id: number, metricData: HttpMetricData): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboPerf');
