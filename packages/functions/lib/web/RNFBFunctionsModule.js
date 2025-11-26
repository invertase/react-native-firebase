import {
  getApp,
  getFunctions,
  httpsCallable,
  httpsCallableFromURL,
  connectFunctionsEmulator,
} from '@react-native-firebase/app/lib/internal/web/firebaseFunctions';
import RNFBAppModule from '@react-native-firebase/app/lib/internal/web/RNFBAppModule';

const FUNCTIONS_STREAMING_EVENT = 'functions_streaming_event';
const STREAM_CONTROLLERS = {};

function emitStreamingEvent(appName, listenerId, body) {
  RNFBAppModule.eventsPing(FUNCTIONS_STREAMING_EVENT, {
    listenerId,
    body,
    appName,
    eventName: FUNCTIONS_STREAMING_EVENT,
  });
}

/**
 * This is a 'NativeModule' for the web platform.
 * Methods here are identical to the ones found in
 * the native android/ios modules e.g. `@ReactMethod` annotated
 * java methods on Android.
 */
export default {
  /**
   * Get and execute a Firebase Functions callable.
   * @param {string} appName - The name of the app to get the functions instance for.
   * @param {string} regionOrCustomDomain - The region or custom domain to use for the functions instance.
   * @param {string} host - The host to use for the functions emulator.
   * @param {number} port - The port to use for the functions emulator.
   * @param {string} name - The name of the functions callable.
   * @param {object} wrapper - The wrapper object to use for the functions callable.
   * @param {object} options - The options to use for the functions callable.
   * @returns {object} - The result of the functions callable.
   */
  async httpsCallable(appName, regionOrCustomDomain, host, port, name, wrapper, options) {
    try {
      const app = getApp(appName);
      let functionsInstance;
      if (regionOrCustomDomain) {
        functionsInstance = getFunctions(app, regionOrCustomDomain);
        // Hack to work around custom domain and region not being set on the instance.
        if (regionOrCustomDomain.startsWith('http')) {
          functionsInstance.customDomain = regionOrCustomDomain;
          functionsInstance.region = 'us-central1';
        } else {
          functionsInstance.region = regionOrCustomDomain;
          functionsInstance.customDomain = null;
        }
      } else {
        functionsInstance = getFunctions(app);
        functionsInstance.region = 'us-central1';
        functionsInstance.customDomain = null;
      }
      if (host) {
        connectFunctionsEmulator(functionsInstance, host, port);
        // Hack to work around emulator origin not being set on the instance.
        functionsInstance.emulatorOrigin = `http://${host}:${port}`;
      }
      let callable;
      if (Object.keys(options).length) {
        callable = httpsCallable(functionsInstance, name, options);
      } else {
        callable = httpsCallable(functionsInstance, name);
      }
      // if data is undefined use null,
      const data = wrapper['data'] ?? null;
      const result = await callable(data);
      return result;
    } catch (error) {
      const { code, message, details } = error;
      const nativeError = {
        code,
        message,
        userInfo: {
          code: code ? code.replace('functions/', '') : 'unknown',
          message,
          details,
        },
      };
      return Promise.reject(nativeError);
    }
  },

  /**
   * Get and execute a Firebase Functions callable from a URL.
   * @param {string} appName - The name of the app to get the functions instance for.
   * @param {string} regionOrCustomDomain - The region or custom domain to use for the functions instance.
   * @param {string} host - The host to use for the functions emulator.
   * @param {number} port - The port to use for the functions emulator.
   * @param {string} url - The URL to use for the functions callable.
   * @param {object} wrapper - The wrapper object to use for the functions callable.
   * @param {object} options - The options to use for the functions callable.
   * @returns {object} - The result of the functions callable.
   */
  async httpsCallableFromUrl(appName, regionOrCustomDomain, host, port, url, wrapper, options) {
    try {
      const app = getApp(appName);
      let functionsInstance;
      if (regionOrCustomDomain) {
        functionsInstance = getFunctions(app, regionOrCustomDomain);
        // Hack to work around custom domain and` region not being set on the instance.
        if (regionOrCustomDomain.startsWith('http')) {
          functionsInstance.customDomain = regionOrCustomDomain;
        } else {
          functionsInstance.region = regionOrCustomDomain;
        }
      } else {
        functionsInstance = getFunctions(app);
        functionsInstance.region = 'us-central1';
        functionsInstance.customDomain = null;
      }
      if (host) {
        connectFunctionsEmulator(functionsInstance, host, port);
        // Hack to work around emulator origin not being set on the instance.
        functionsInstance.emulatorOrigin = `http://${host}:${port}`;
      }
      const callable = httpsCallableFromURL(functionsInstance, url, options);
      const result = await callable(wrapper['data']);
      return result;
    } catch (error) {
      const { code, message, details } = error;
      const nativeError = {
        code,
        message,
        userInfo: {
          code: code ? code.replace('functions/', '') : 'unknown',
          message,
          details,
        },
      };
      return Promise.reject(nativeError);
    }
  },

  /**
   * Start a streaming HTTP request to an onRequest endpoint using a function name.
   * Mirrors the native streaming implementation, but uses fetch on web.
   *
   * Signature:
   *   (appName, regionOrCustomDomain, host, port, name, listenerId)
   */
  async httpsCallableStream(appName, regionOrCustomDomain, host, port, name, listenerId) {
    const fetchImpl = typeof fetch === 'function' ? fetch : null;
    if (!fetchImpl) {
      emitStreamingEvent(appName, listenerId, { error: 'fetch_not_available' });
      emitStreamingEvent(appName, listenerId, { done: true });
      return;
    }

    const supportsAbort = typeof AbortController === 'function';
    const controller = supportsAbort ? new AbortController() : null;
    if (controller) {
      STREAM_CONTROLLERS[listenerId] = controller;
    }

    try {
      const app = getApp(appName);
      const appOptions = app.options || {};
      const projectId = appOptions.projectId || appOptions.projectID || '';

      let targetUrl;
      const region = regionOrCustomDomain || 'us-central1';

      if (host && port != null && port !== -1) {
        // Emulator: http://host:port/{projectId}/{region}/{name}
        targetUrl = `http://${host}:${port}/${projectId}/${region}/${name}`;
      } else if (regionOrCustomDomain && regionOrCustomDomain.startsWith('http')) {
        // Custom domain: https://example.com/{name}
        const base = regionOrCustomDomain.replace(/\/+$/, '');
        targetUrl = `${base}/${name}`;
      } else {
        // Prod: https://{region}-{projectId}.cloudfunctions.net/{name}
        targetUrl = `https://${region}-${projectId}.cloudfunctions.net/${name}`;
      }

      const response = await fetchImpl(targetUrl, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream, application/x-ndjson, */*',
        },
        signal: controller ? controller.signal : undefined,
      });

      if (!response.ok) {
        const msg = `http_error_${response.status}_${response.statusText || 'error'}`;
        emitStreamingEvent(appName, listenerId, { error: msg });
      } else {
        const payload = await response.text();
        const lines = payload.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line || !line.trim()) continue;
          const trimmed = line.startsWith('data: ') ? line.slice(6) : line;
          emitStreamingEvent(appName, listenerId, { text: trimmed });
        }
      }
    } catch (error) {
      if (!(supportsAbort && error && error.name === 'AbortError')) {
        emitStreamingEvent(appName, listenerId, {
          error: error && error.message ? error.message : String(error),
        });
      }
    } finally {
      emitStreamingEvent(appName, listenerId, { done: true });
      if (controller && STREAM_CONTROLLERS[listenerId] === controller) {
        delete STREAM_CONTROLLERS[listenerId];
      }
    }
  },

  /**
   * Start a streaming HTTP request to an onRequest endpoint using a URL.
   *
   * Signature:
   *   (appName, url, listenerId)
   */
  async httpsCallableStreamFromUrl(appName, url, listenerId) {
    const fetchImpl = typeof fetch === 'function' ? fetch : null;
    if (!fetchImpl) {
      emitStreamingEvent(appName, listenerId, { error: 'fetch_not_available' });
      emitStreamingEvent(appName, listenerId, { done: true });
      return;
    }

    const supportsAbort = typeof AbortController === 'function';
    const controller = supportsAbort ? new AbortController() : null;
    if (controller) {
      STREAM_CONTROLLERS[listenerId] = controller;
    }

    try {
      // For web we use the provided URL directly. If host/port are provided they
      // have already been baked into the URL by caller (e.g. emulator).
      const response = await fetchImpl(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream, application/x-ndjson, */*',
        },
        signal: controller ? controller.signal : undefined,
      });

      if (!response.ok) {
        const msg = `http_error_${response.status}_${response.statusText || 'error'}`;
        emitStreamingEvent(appName, listenerId, { error: msg });
      } else {
        const payload = await response.text();
        const lines = payload.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (!line || !line.trim()) continue;
          const trimmed = line.startsWith('data: ') ? line.slice(6) : line;
          emitStreamingEvent(appName, listenerId, { text: trimmed });
        }
      }
    } catch (error) {
      if (!(supportsAbort && error && error.name === 'AbortError')) {
        emitStreamingEvent(appName, listenerId, {
          error: error && error.message ? error.message : String(error),
        });
      }
    } finally {
      emitStreamingEvent(appName, listenerId, { done: true });
      if (controller && STREAM_CONTROLLERS[listenerId] === controller) {
        delete STREAM_CONTROLLERS[listenerId];
      }
    }
  },
};
