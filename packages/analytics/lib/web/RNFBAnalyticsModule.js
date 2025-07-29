import { getApp } from '@react-native-firebase/app/lib/internal/web/firebaseApp';
import { guard } from '@react-native-firebase/app/lib/internal/web/utils';

import { AnalyticsApi } from './api';

let analyticsInstances = {};

function getAnalyticsApi(appName) {
  const app = getApp(appName);
  const measurementId = app.options.measurementId;
  if (!measurementId) {
    // eslint-disable-next-line no-console
    console.warn(
      'No measurement id (`FirebaseOptions.measurementId`) found for Firebase Analytics. Analytics will be unavailable.',
    );
  }
  if (!analyticsInstances[measurementId]) {
    analyticsInstances[measurementId] = new AnalyticsApi('[DEFAULT]', measurementId);
    if (globalThis.RNFBDebug) {
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
export default {
  logEvent(name, params) {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.logEvent(name, params);
      return null;
    });
  },

  setUserId(userId) {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setUserId(userId);
      return null;
    });
  },

  setUserProperty(key, value) {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setUserProperty(key, value);
      return null;
    });
  },

  setUserProperties(properties) {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setUserProperties(properties);
      return null;
    });
  },

  setDefaultEventParameters(params) {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setDefaultEventParameters(params);
      return null;
    });
  },

  setConsent(consent) {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      // TODO currently we only support ad_personalization
      if (consent && consent.ad_personalization) {
        api.setConsent({ ad_personalization: consent.ad_personalization });
      }
      return null;
    });
  },

  setAnalyticsCollectionEnabled(enabled) {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      api.setAnalyticsCollectionEnabled(enabled);
      return null;
    });
  },

  resetAnalyticsData() {
    // Unsupported for web.
    return guard(async () => {
      return null;
    });
  },

  setSessionTimeoutDuration() {
    // Unsupported for web.
    return guard(async () => {
      return null;
    });
  },

  getAppInstanceId() {
    return guard(async () => {
      const api = getAnalyticsApi('[DEFAULT]');
      return api._getCid();
    });
  },

  getSessionId() {
    // Unsupported for web.
    return guard(async () => {
      return null;
    });
  },
};
