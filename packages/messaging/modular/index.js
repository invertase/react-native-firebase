import { firebase } from '..';

/**
 * Returns a Messaging instance for the given app.
 * @param app - FirebaseApp. Optional.
 * @returns {Messaging}
 */
export function getMessaging(app) {
  if (app) {
    return firebase.app(app.name).messaging();
  }

  return firebase.app().messaging();
}

/**
 * Removes access to an FCM token previously authorized by it's scope. 
 * Messages sent by the server to this token will fail.
 * @param messaging Messaging instance
 * @param tokenOptions Options to override senderId (iOS) and projectId (Android).
 * @returns {Void}
 */
export function deleteToken(messaging, tokenOptions) {
  if (tokenOptions != null) {
    return messaging.deleteToken();
  }

  return messaging.deleteToken(tokenOptions);
}

/**
 * Returns an FCM token for this device. Optionally you can specify a custom options to your own use-case.
 * @param messaging Messaging instance
 * @param options Options to override senderId (iOS) and projectId (Android).
 * @returns {String}
 */
export function getToken(messaging, options) {
  if (options != null) {
    return messaging.getToken();
  }

  return messaging.getToken(options);
}

/**
 * When any FCM payload is received, the listener callback is called with a `RemoteMessage`.
 * > This subscriber method is only called when the app is active (in the foreground).
 * @param messaging Messaging instance
 * @param listener Called with a `RemoteMessage` when a new FCM payload is received from the server.
 * @returns {Function}
 */
export function onMessage(messaging, nextOrObserver) {
  return messaging.onMessage(nextOrObserver);
}

/**
 * When any FCM payload is received, the listener callback is called with a `RemoteMessage`.
 * > This subscriber method is only called when the app is active (in the foreground).
 * @param messaging Messaging instance
 * @param listener Called with a `RemoteMessage` when a new FCM payload is received from the server.
 * @returns {Function}
 */
export function isSupported(messaging, nextOrObserver) {
  return messaging.isSupported(nextOrObserver);
}
