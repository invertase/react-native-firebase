import { FirebaseError, isAndroid, isIOS } from './internal';

export function noDefaultAppDelete(): FirebaseError {
  return new FirebaseError(
    new Error(`Unable to delete the default FirebaseApp instance.`),
    'app',
    'no-delete-default',
  );
}

export function invalidApp(): FirebaseError {
  return new FirebaseError(
    new Error(
      `An invalid FirebaseApp was provided. Use initializeApp() or getApp() to get a FirebaseApp instance.`,
    ),
    'app',
    'invalid-app',
  );
}

export function noApp(name: string): FirebaseError {
  return new FirebaseError(
    new Error(`No Firebase App '${name}' has been created - call Firebase initializeApp()`),
    'app',
    'no-app',
  );
}

export function defaultAppNotInitialized() {
  if (isAndroid) {
    return new FirebaseError(new Error(`TODO Android Setup`), 'app', 'not-initialized');
  }

  if (isIOS) {
    return new FirebaseError(new Error(`TODO iOS Setup`), 'app', 'not-initialized');
  }

  return new FirebaseError(new Error(`TODO Web Setup`), 'app', 'not-initialized');
}
