import { getApp } from '@react-native-firebase/app/lib/internal/web/firebaseApp';
import { guard } from '@react-native-firebase/app/lib/internal/web/utils';

import { AnalyticsApi } from './api';
import type {
  AnalyticsEventParameters,
  AnalyticsUserProperties,
  AnalyticsConsent,
  RNFBAnalyticsModule,
} from '../types/web';

interface AnalyticsInstances {
  [measurementId: string]: AnalyticsApi;
}

let analyticsInstances: AnalyticsInstances = {};

function getAnalyticsApi(appName: string): AnalyticsApi {
  const app = getApp(appName);
  const measurementId = app.options.measurementId;
  if (!measurementId) {
    // eslint-disable-next-line no-console
    console.warn(
      'No measurement id (`FirebaseOptions.measurementId`) found for Firebase Analytics. Analytics will be unavailable.',
    );
    // Return a default instance with empty measurementId for cases where it's not configured
    const defaultKey = 'default';
    if (!analyticsInstances[defaultKey]) {
      analyticsInstances[defaultKey] = new AnalyticsApi('[DEFAULT]', '');
    }
    return analyticsInstances[defaultKey];
  }
  if (!analyticsInstances[measurementId]) {
    analyticsInstances[measurementId] = new AnalyticsApi('[DEFAULT]', measurementId);
    if ((globalThis as any).RNFBDebug) {
      analyticsInstances[measurementId].setDebug(true);
    }
  }
  return analyticsInstances[measurementId];
}

/**
 * This is a 'NativeModule' for the web platform.
 * Methods here are identical to the ones found in
 * the native android/ios modules e.g. `@ReactMethod` annotated
 * java methods on Android.
 */
const RNFBAnalyticsModule: RNFBAnalyticsModule = {
  logEvent(name: string, params?: AnalyticsEventParameters): Promise<null> {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.logEvent(name, params);
      return null;
    });
  },

  setUserId(userId: string | null): Promise<null> {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setUserId(userId);
      return null;
    });
  },

  setUserProperty(key: string, value: string | null): Promise<null> {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setUserProperty(key, value);
      return null;
    });
  },

  setUserProperties(properties: AnalyticsUserProperties): Promise<null> {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setUserProperties(properties);
      return null;
    });
  },

  setDefaultEventParameters(params: AnalyticsEventParameters | null): Promise<null> {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setDefaultEventParameters(params);
      return null;
    });
  },

  setConsent(consent: AnalyticsConsent): Promise<null> {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      // TODO currently we only support ad_personalization
      if (consent && consent.ad_personalization !== undefined) {
        api.setConsent({ ad_personalization: consent.ad_personalization });
      }
      return null;
    });
  },

  setAnalyticsCollectionEnabled(enabled: boolean): Promise<null> {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setAnalyticsCollectionEnabled(enabled);
      return null;
    });
  },

  resetAnalyticsData(): Promise<null> {
    // Unsupported for web.
    return guard(async () => {
      return null;
    });
  },

  setSessionTimeoutDuration(): Promise<null> {
    // Unsupported for web.
    return guard(async () => {
      return null;
    });
  },

  getAppInstanceId(): Promise<string | null> {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      return api._getCid();
    });
  },

  getSessionId(): Promise<null> {
    // Unsupported for web.
    return guard(async () => {
      return null;
    });
  },
};

export { RNFBAnalyticsModule };
