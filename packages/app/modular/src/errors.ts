import { FirebaseError, isAndroid, isIOS } from './internal';

export function noDefaultAppDelete(): FirebaseError {
  return new FirebaseError(
    new Error(`Unable to delete the default FirebaseApp instance.`),
    'app',
    'no-delete-default',
  );
}

export function noApp(name: string): FirebaseError {
  return new FirebaseError(
    new Error(`No Firebase App '${name}' has been created - call Firebase initializeApp()`),
    'app',
    'no-app',
  );
}

export function duplicateApp(name: string) {
  return new FirebaseError(
    new Error(`Firebase App named '${name}' already exists`),
    'app',
    'app/duplicate-app',
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
