import {
  getApp,
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  onIdTokenChanged,
  signInAnonymously,
  sendSignInLinkToEmail,
  getAdditionalUserInfo,
  multiFactor,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithCustomToken,
  sendPasswordResetEmail,
  useDeviceLanguage,
  verifyPasswordResetCode,
  connectAuthEmulator,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  confirmPasswordReset,
  updateEmail,
  updatePassword,
  updateProfile,
  updatePhoneNumber,
  signInWithCredential,
  unlink,
  linkWithCredential,
  reauthenticateWithCredential,
  getIdToken,
  getIdTokenResult,
  applyActionCode,
  checkActionCode,
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  PhoneAuthProvider,
  OAuthProvider,
} from '@react-native-firebase/app/lib/internal/web/firebaseAuth';
import { guard, getWebError, emitEvent } from '@react-native-firebase/app/lib/internal/web/utils';
import {
  getReactNativeAsyncStorageInternal,
  isMemoryStorage,
} from '@react-native-firebase/app/lib/internal/asyncStorage';

/**
 * Resolves or rejects an auth method promise without a user (user was missing).
 * @param {boolean} isError whether to reject the promise.
 * @returns {Promise<void>} - Void promise.
 */
function promiseNoUser(isError = false) {
  if (isError) {
    return rejectPromiseWithCodeAndMessage('no-current-user', 'No user currently signed in.');
  }

  // TODO(ehesp): Should this be null, or undefined?
  return Promise.resolve(null);
}

/**
 * Returns a structured error object.
 * @param {string} code - The error code.
 * @param {string} message - The error message.
 */
function rejectPromiseWithCodeAndMessage(code, message) {
  return rejectPromise(getWebError({ code: `auth/${code}`, message }));
}

function rejectWithCodeAndMessage(code, message) {
  return Promise.reject(
    getWebError({
      code,
      message,
    }),
  );
}

/**
 * Returns a structured error object.
 * @param {error} error The error object.
 * @returns {never}
 */
function rejectPromise(error) {
  const { code, message, details } = error;
  const nativeError = {
    code,
    message,
    userInfo: {
      code: code ? code.replace('auth/', '') : 'unknown',
      message,
      details,
    },
  };
  return Promise.reject(nativeError);
}

/**
 * Converts a user object to a plain object.
 * @param {User} user - The User object to convert.
 * @returns {object}
 */
function userToObject(user) {
  return {
    ...userInfoToObject(user),
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
    tenantId: user.tenantId !== null && user.tenantId !== '' ? user.tenantId : null,
    providerData: user.providerData.map(userInfoToObject),
    metadata: userMetadataToObject(user.metadata),
    multiFactor: {
      enrolledFactors: multiFactor(user).enrolledFactors.map(multiFactorInfoToObject),
    },
  };
}

/**
 * Returns an AuthCredential object for the given provider.
 * @param {Auth} auth - The Auth instance to use.
 * @param {string} provider - The provider to get the credential for.
 * @param {string} token - The token to use for the credential.
 * @param {string|null} secret - The secret to use for the credential.
 * @returns {AuthCredential|null} - The AuthCredential object.
 */
function getAuthCredential(_auth, provider, token, secret) {
  if (provider.startsWith('oidc.')) {
    return new OAuthProvider(provider).credential({
      idToken: token,
    });
  }

  switch (provider) {
    case 'facebook.com':
      return FacebookAuthProvider().credential(token);
    case 'google.com':
      return GoogleAuthProvider().credential(token, secret);
    case 'twitter.com':
      return TwitterAuthProvider().credential(token, secret);
    case 'github.com':
      return GithubAuthProvider().credential(token);
    case 'apple.com':
      return new OAuthProvider(provider).credential({
        idToken: token,
        rawNonce: secret,
      });
    case 'oauth':
      return OAuthProvider(provider).credential({
        idToken: token,
        accessToken: secret,
      });
    case 'phone':
      return PhoneAuthProvider.credential(token, secret);
    case 'password':
      return EmailAuthProvider.credential(token, secret);
    case 'emailLink':
      return EmailAuthProvider.credentialWithLink(token, secret);
    default:
      return null;
  }
}

/**
 * Converts a user info object to a plain object.
 * @param {UserInfo} userInfo - The UserInfo object to convert.
 */
function userInfoToObject(userInfo) {
  return {
    providerId: userInfo.providerId,
    uid: userInfo.uid,
    displayName:
      userInfo.displayName !== null && userInfo.displayName !== '' ? userInfo.displayName : null,
    email: userInfo.email !== null && userInfo.email !== '' ? userInfo.email : null,
    photoURL: userInfo.photoURL !== null && userInfo.photoURL !== '' ? userInfo.photoURL : null,
    phoneNumber:
      userInfo.phoneNumber !== null && userInfo.phoneNumber !== '' ? userInfo.phoneNumber : null,
  };
}

/**
 * Converts a user metadata object to a plain object.
 * @param {UserMetadata} metadata - The UserMetadata object to convert.
 */
function userMetadataToObject(metadata) {
  return {
    creationTime: metadata.creationTime ? new Date(metadata.creationTime).toISOString() : null,
    lastSignInTime: metadata.lastSignInTime
      ? new Date(metadata.lastSignInTime).toISOString()
      : null,
  };
}

/**
 * Converts a MultiFactorInfo object to a plain object.
 * @param {MultiFactorInfo} multiFactorInfo - The MultiFactorInfo object to convert.
 */
function multiFactorInfoToObject(multiFactorInfo) {
  const obj = {
    displayName: multiFactorInfo.displayName,
    enrollmentTime: multiFactorInfo.enrollmentTime,
    factorId: multiFactorInfo.factorId,
    uid: multiFactorInfo.uid,
  };

  // If https://firebase.google.com/docs/reference/js/auth.phonemultifactorinfo
  if ('phoneNumber' in multiFactorInfo) {
    obj.phoneNumber = multiFactorInfo.phoneNumber;
  }

  return obj;
}

/**
 * Converts a user credential object to a plain object.
 * @param {UserCredential} userCredential - The user credential object to convert.
 */
function authResultToObject(userCredential) {
  const additional = getAdditionalUserInfo(userCredential);
  return {
    user: userToObject(userCredential.user),
    additionalUserInfo: {
      isNewUser: additional.isNewUser,
      profile: additional.profile,
      providerId: additional.providerId,
      username: additional.username,
    },
  };
}

const instances = {};
const authStateListeners = {};
const idTokenListeners = {};
const sessionMap = new Map();
const totpSecretMap = new Map();
let sessionId = 0;

// Returns a cached Firestore instance.
function getCachedAuthInstance(appName) {
  if (!instances[appName]) {
    if (isMemoryStorage()) {
      // Warn auth persistence is is disabled unless Async Storage implementation is provided.
      // eslint-disable-next-line no-console
      console.warn(
        'Firebase Auth persistence is disabled. To enable persistence, provide an Async Storage implementation.\n' +
          '\n' +
          'For example, to use React Native Async Storage:\n' +
          '\n' +
          "  import AsyncStorage from '@react-native-async-storage/async-storage';\n" +
          '\n' +
          '  // Before initializing Firebase set the Async Storage implementation\n' +
          '  // that will be used to persist user sessions.\n' +
          '  firebase.setReactNativeAsyncStorage(AsyncStorage);\n' +
          '\n' +
          '  // Then initialize Firebase as normal.\n' +
          '  await firebase.initializeApp({ ... });\n',
      );
    }
    instances[appName] = initializeAuth(getApp(appName), {
      persistence: getReactNativePersistence(getReactNativeAsyncStorageInternal()),
    });
  }
  return instances[appName];
}

// getConstants
const CONSTANTS = {
  APP_LANGUAGE: {},
  APP_USER: {},
};

// Not required for web, since it's dynamic initialization
// and we are not making instances of auth based on apps that already exist
// since there are none that exist before we initialize them in our code below.
// for (const appName of getApps()) {
//   const instance = getAuth(getApp(appName));
//   CONSTANTS.APP_LANGUAGE[appName] = instance.languageCode;
//   if (instance.currentUser) {
//     CONSTANTS.APP_USER[appName] = userToObject(instance.currentUser);
//   }
// }

/**
 * This is a 'NativeModule' for the web platform.
 * Methods here are identical to the ones found in
 * the native android/ios modules e.g. `@ReactMethod` annotated
 * java methods on Android.
 */
export default {
  // Expose all the constants.
  ...CONSTANTS,

  async useUserAccessGroup() {
    // noop
  },

  configureAuthDomain() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  async getCustomAuthDomain() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Create a new auth state listener instance for a given app.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns {Promise<void>} - Void promise.
   */
  addAuthStateListener(appName) {
    if (authStateListeners[appName]) {
      return;
    }

    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      authStateListeners[appName] = onAuthStateChanged(auth, user => {
        emitEvent('auth_state_changed', {
          appName,
          user: user ? userToObject(user) : null,
        });
      });
    });
  },

  /**
   * Remove an auth state listener instance for a given app.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns {Promise<void>} - Void promise.
   */
  removeAuthStateListener(appName) {
    if (authStateListeners[appName]) {
      authStateListeners[appName]();
      delete authStateListeners[appName];
    }
  },

  /**
   * Create a new ID token listener instance for a given app.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns {Promise<void>} - Void promise.
   */
  addIdTokenListener(appName) {
    if (idTokenListeners[appName]) {
      return;
    }

    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      idTokenListeners[appName] = onIdTokenChanged(auth, user => {
        emitEvent('auth_id_token_changed', {
          authenticated: !!user,
          appName,
          user: user ? userToObject(user) : null,
        });
      });
    });
  },

  /**
   * Remove an ID token listener instance for a given app.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns {Promise<void>} - Void promise.
   */
  removeIdTokenListener(appName) {
    if (idTokenListeners[appName]) {
      idTokenListeners[appName]();
      delete idTokenListeners[appName];
    }
  },

  async forceRecaptchaFlowForTesting() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  async setAutoRetrievedSmsCodeForPhoneNumber() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  async setAppVerificationDisabledForTesting() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Sign out the current user.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns {Promise<void>} - Void promise.
   */
  signOut(appName) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      await auth.signOut();
      return promiseNoUser();
    });
  },

  /**
   * Sign in anonymously.
   * @param {*} appName - The name of the app to get the auth instance for.
   * @returns
   */
  signInAnonymously(appName) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const credential = await signInAnonymously(auth);
      return authResultToObject(credential);
    });
  },

  /**
   * Sign in with email and password.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} email - The email to sign in with.
   * @param {string} password - The password to sign in with.
   * @returns {Promise<object>} - The result of the sign in.
   */
  async createUserWithEmailAndPassword(appName, email, password) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      return authResultToObject(credential);
    });
  },

  /**
   * Sign in with email and password.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} email - The email to sign in with.
   * @param {string} password - The password to sign in with.
   * @returns {Promise<object>} - The result of the sign in.
   */
  async signInWithEmailAndPassword(appName, email, password) {
    // The default guard / getWebError process doesn't work well here,
    // since it creates a new error object that is then passed through
    // a native module proxy and gets processed again.
    // We need lots of information from the error so that MFA will work
    // later if needed. So we handle the error custom here.
    // return guard(async () => {
    try {
      const credential = await signInWithEmailAndPassword(
        getCachedAuthInstance(appName),
        email,
        password,
      );
      return authResultToObject(credential);
    } catch (e) {
      e.userInfo = {
        code: e.code.split('/')[1],
        message: e.message,
        customData: e.customData,
      };
      throw e;
    }
    // });
  },

  /**
   * Check if a sign in with email link is valid
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} emailLink - The email link to sign in with.
   * @returns {Promise<boolean>} - Whether the link is a valid sign in with email link.
   */
  async isSignInWithEmailLink(appName, emailLink) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      return await isSignInWithEmailLink(auth, emailLink);
    });
  },

  /**
   * Sign in with email link.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} email - The email to sign in with.
   * @param {string} emailLink - The email link to sign in with.
   * @returns {Promise<object>} - The result of the sign in.
   */
  async signInWithEmailLink(appName, email, emailLink) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const credential = await signInWithEmailLink(auth, email, emailLink);
      return authResultToObject(credential);
    });
  },

  /**
   * Sign in with a custom token.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} token - The token to sign in with.
   * @returns {Promise<object>} - The result of the sign in.
   */
  async signInWithCustomToken(appName, token) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const credential = await signInWithCustomToken(auth, token);
      return authResultToObject(credential);
    });
  },

  /**
   * Not implemented on web.
   */
  async revokeToken() {
    return promiseNoUser();
  },

  /**
   * Send a password reset email.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} email - The email to send the password reset email to.
   * @param {ActionCodeSettings} settings - The settings to use for the password reset email.
   * @returns {Promise<null>}
   */
  async sendPasswordResetEmail(appName, email, settings) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      await sendPasswordResetEmail(auth, email, settings);
      return promiseNoUser();
    });
  },

  /**
   * Send a sign in link to an email.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} email - The email to send the password reset email to.
   * @param {ActionCodeSettings} settings - The settings to use for the password reset email.
   * @returns {Promise<null>}
   */
  async sendSignInLinkToEmail(appName, email, settings) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      await sendSignInLinkToEmail(auth, email, settings);
      return promiseNoUser();
    });
  },

  /* ----------------------
   *  .currentUser methods
   * ---------------------- */

  /**
   * Delete the current user.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns {Promise<null>}
   */
  async delete(appName) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      await auth.currentUser.delete();
      return promiseNoUser();
    });
  },

  /**
   * Reload the current user.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns {Promise<object>} - The current user object.
   */
  async reload(appName) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      await auth.currentUser.reload();
      return userToObject(auth.currentUser);
    });
  },

  /**
   * Send a verification email to the current user.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {ActionCodeSettings} actionCodeSettings - The settings to use for the email verification.
   * @returns {Promise<object>} - The current user object.
   */
  async sendEmailVerification(appName, actionCodeSettings) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      return userToObject(auth.currentUser);
    });
  },

  /**
   * Verify the email before updating it.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} email - The email to verify.
   * @param {ActionCodeSettings} actionCodeSettings - The settings to use for the email verification.
   * @returns {Promise<object>} - The current user object.
   */
  async verifyBeforeUpdateEmail(appName, email, actionCodeSettings) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      await verifyBeforeUpdateEmail(auth.currentUser, email, actionCodeSettings);
      return userToObject(auth.currentUser);
    });
  },

  /**
   * Update the current user's email.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} email - The email to update.
   * @returns {Promise<object>} - The current user object.
   */
  async updateEmail(appName, email) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      await updateEmail(auth.currentUser, email);
      return userToObject(auth.currentUser);
    });
  },

  /**
   * Update the current user's password.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} password - The password to update.
   * @returns {Promise<object>} - The current user object.
   */
  async updatePassword(appName, password) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      await updatePassword(auth.currentUser, password);
      return userToObject(auth.currentUser);
    });
  },

  /**
   * Update the current user's phone number.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} provider - The provider to update the phone number with.
   * @param {string} authToken - The auth token to update the phone number with.
   * @param {string} authSecret - The auth secret to update the phone number with.
   * @returns {Promise<object>} - The current user object.
   */
  async updatePhoneNumber(appName, provider, authToken, authSecret) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      if (provider !== 'phone') {
        return rejectPromiseWithCodeAndMessage(
          'invalid-credential',
          'The supplied auth credential does not have a phone provider.',
        );
      }

      const credential = getAuthCredential(auth, provider, authToken, authSecret);

      if (!credential) {
        return rejectPromiseWithCodeAndMessage(
          'invalid-credential',
          'The supplied auth credential is malformed, has expired or is not currently supported.',
        );
      }

      await updatePhoneNumber(auth.currentUser, credential);

      return userToObject(auth.currentUser);
    });
  },

  /**
   * Update the current user's profile.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {object} props - The properties to update.
   * @returns {Promise<object>} - The current user object.
   */
  async updateProfile(appName, props) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      await updateProfile(auth.currentUser, {
        displayName: props.displayName,
        photoURL: props.photoURL,
      });

      return userToObject(auth.currentUser);
    });
  },

  /**
   * Sign in with a credential.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} provider - The provider to sign in with.
   * @param {string} authToken - The auth token to sign in with.
   * @param {string} authSecret - The auth secret to sign in with.
   * @returns {Promise<object>} - The result of the sign in.
   */
  async signInWithCredential(appName, provider, authToken, authSecret) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const credential = getAuthCredential(auth, provider, authToken, authSecret);

      if (credential === null) {
        return rejectPromiseWithCodeAndMessage(
          'invalid-credential',
          'The supplied auth credential is malformed, has expired or is not currently supported.',
        );
      }

      const credentialResult = await signInWithCredential(auth, credential);
      return authResultToObject(credentialResult);
    });
  },

  async signInWithProvider() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  async signInWithPhoneNumber() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Get a multi-factor session.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns {Promise<string>} - The session ID.
   */
  async getSession(appName) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      const session = await multiFactor(auth.currentUser).getSession();

      // Increment the session ID.
      sessionId++;

      const key = `${sessionId}`;
      sessionMap.set(key, session);
      return key;
    });
  },

  verifyPhoneNumberForMultiFactor() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  finalizeMultiFactorEnrollment() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  resolveMultiFactorSignIn() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  confirmationResultConfirm() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  verifyPhoneNumber() {
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Confirm the password reset code.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} code - The code to confirm.
   * @param {string} newPassword - The new password to set.
   * @returns {Promise<null>}
   */
  async confirmPasswordReset(appName, code, newPassword) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      await confirmPasswordReset(auth, code, newPassword);
      return promiseNoUser();
    });
  },

  /**
   * Apply an action code.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} code - The code to apply.
   * @returns {Promise<void>} - Void promise.
   */
  async applyActionCode(appName, code) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      await applyActionCode(auth, code);
    });
  },

  /**
   * Check an action code.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} code - The code to check.
   * @returns {Promise<object>} - The result of the check.
   */
  async checkActionCode(appName, code) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const result = await checkActionCode(auth, code);

      return {
        operation: result.operation,
        data: {
          email: result.data.email,
          fromEmail: result.data.previousEmail,
          // multiFactorInfo - not implemented
        },
      };
    });
  },

  /**
   * Link a credential to the current user.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} provider - The provider to link.
   * @param {string} authToken - The auth token to link.
   * @param {string} authSecret - The auth secret to link.
   * @returns {Promise<object>} - The current user object.
   */
  async linkWithCredential(appName, provider, authToken, authSecret) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const credential = getAuthCredential(auth, provider, authToken, authSecret);

      if (credential === null) {
        return rejectPromiseWithCodeAndMessage(
          'invalid-credential',
          'The supplied auth credential is malformed, has expired or is not currently supported.',
        );
      }

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      return authResultToObject(await linkWithCredential(auth.currentUser, credential));
    });
  },

  async linkWithProvider() {
    // TODO: We could check if window is available here, but for now it's not supported.
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Unlink a provider from the current user.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} providerId - The provider ID to unlink.
   * @returns {Promise<object>} - The current user object.
   */
  async unlink(appName, providerId) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      const user = await unlink(auth.currentUser, providerId);
      return userToObject(user);
    });
  },

  /**
   * Reauthenticate with a credential.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} provider - The provider to reauthenticate with.
   * @param {string} authToken - The auth token to reauthenticate with.
   * @param {string} authSecret - The auth secret to reauthenticate with.
   * @returns {Promise<object>} - The current user object.
   */
  async reauthenticateWithCredential(appName, provider, authToken, authSecret) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const credential = getAuthCredential(auth, provider, authToken, authSecret);

      if (credential === null) {
        return rejectPromiseWithCodeAndMessage(
          'invalid-credential',
          'The supplied auth credential is malformed, has expired or is not currently supported.',
        );
      }

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      return authResultToObject(await reauthenticateWithCredential(auth.currentUser, credential));
    });
  },

  async reauthenticateWithProvider() {
    // TODO: We could check if window is available here, but for now it's not supported.
    return rejectPromiseWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /**
   * Get the ID token for the current user.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {boolean} forceRefresh - Whether to force a token refresh.
   * @returns {Promise<string>} - The ID token.
   */
  async getIdToken(appName, forceRefresh) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      const token = await getIdToken(auth.currentUser, forceRefresh);
      return token;
    });
  },

  /**
   * Get the ID token result for the current user.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {boolean} forceRefresh - Whether to force a token refresh.
   * @returns {Promise<object>} - The ID token result.
   */
  async getIdTokenResult(appName, forceRefresh) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }

      const result = await getIdTokenResult(auth.currentUser, forceRefresh);

      // TODO(ehesp): Result looks expected, might be safer to keep fixed object?
      return {
        authTime: result.authTime,
        expirationTime: result.expirationTime,
        issuedAtTime: result.issuedAtTime,
        claims: result.claims,
        signInProvider: result.signInProvider,
        token: result.token,
      };
    });
  },

  /**
   * Get a MultiFactorResolver from the underlying SDK
   * @param {*} _appName the name of the app to get the auth instance for
   * @param {*} uid the uid of the TOTP MFA attempt
   * @param {*} code the code from the user TOTP app
   * @return TotpMultiFactorAssertion to use for resolving
   */
  assertionForSignIn(_appName, uid, code) {
    return TotpMultiFactorGenerator.assertionForSignIn(uid, code);
  },

  /**
   * Get a MultiFactorResolver from the underlying SDK
   * @param {*} appName the name of the app to get the auth instance for
   * @param {*} error the MFA error returned from initial factor login attempt
   * @return MultiFactorResolver to use for verifying the second factor
   */
  getMultiFactorResolver(appName, error) {
    return getMultiFactorResolver(getCachedAuthInstance(appName), error);
  },

  /**
   * generate a TOTP secret
   * @param {*} _appName - The name of the app to get the auth instance for.
   * @param {*} session - The MultiFactorSession to associate with the secret
   * @returns object with secretKey to associate with TotpSecret
   */
  async generateTotpSecret(_appName, session) {
    return guard(async () => {
      const totpSecret = await TotpMultiFactorGenerator.generateSecret(sessionMap.get(session));
      totpSecretMap.set(totpSecret.secretKey, totpSecret);
      return { secretKey: totpSecret.secretKey };
    });
  },

  /**
   * unenroll from TOTP
   * @param {*} appName - The name of the app to get the auth instance for.
   * @param {*} enrollmentId - The ID to associate with the enrollment
   * @returns
   */
  async unenrollMultiFactor(appName, enrollmentId) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }
      await multiFactor(auth.currentUser).unenroll(enrollmentId);
    });
  },

  /**
   * finalize a TOTP enrollment
   * @param {*} appName - The name of the app to get the auth instance for.
   * @param {*} secretKey - The secretKey to associate native TotpSecret
   * @param {*} verificationCode - The TOTP to verify
   * @param {*} displayName - The name to associate as a hint
   * @returns
   */
  async finalizeTotpEnrollment(appName, secretKey, verificationCode, displayName) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      if (auth.currentUser === null) {
        return promiseNoUser(true);
      }
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecretMap.get(secretKey),
        verificationCode,
      );
      await multiFactor(auth.currentUser).enroll(multiFactorAssertion, displayName);
    });
  },

  /**
   * generate a TOTP QR Code URL
   * @param {*} _appName - The name of the app to get the auth instance for.
   * @param {*} secretKey - The secretKey to associate with the TotpSecret
   * @param {*} accountName - The account name to use in auth app
   * @param {*} issuer - The issuer to use in auth app
   * @returns QR Code URL
   */
  generateQrCodeUrl(_appName, secretKey, accountName, issuer) {
    return totpSecretMap.get(secretKey).generateQrCodeUrl(accountName, issuer);
  },

  /**
   * open a QR Code URL in an app directly
   * @param {*} appName - The name of the app to get the auth instance for.
   * @param {*} qrCodeUrl the URL to open in the app, from generateQrCodeUrl
   * @throws Error not supported in this environment
   */
  openInOtpApp() {
    return rejectWithCodeAndMessage(
      'unsupported',
      'This operation is not supported in this environment.',
    );
  },

  /* ----------------------
   *  other methods
   * ---------------------- */

  /**
   * Fetch the sign in methods for an email.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} email - The email to fetch the sign in methods for.
   * @returns {Promise<string[]>} - The sign in methods for the email.
   */
  async fetchSignInMethodsForEmail(appName, email) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods;
    });
  },

  /**
   * Set the language code.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} code - The language code to set.
   * @returns {void}
   */
  setLanguageCode(appName, code) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      auth.languageCode = code;
    });
  },

  /**
   * Set the tenant ID.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} tenantId - The tenant ID to set.
   * @returns {void}
   */
  setTenantId(appName, tenantId) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      auth.tenantId = tenantId;
    });
  },

  /**
   * Use the device language.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @returns void
   */
  useDeviceLanguage(appName) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      useDeviceLanguage(auth);
    });
  },

  /**
   * Verify the provided password reset code.
   * @returns {string} - The users email address if valid.
   */
  verifyPasswordResetCode(appName, code) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const email = await verifyPasswordResetCode(auth, code);
      return email;
    });
  },

  /**
   * Connect to the auth emulator.
   * @param {string} appName - The name of the app to get the auth instance for.
   * @param {string} host - The host to use for the auth emulator.
   * @param {number} port - The port to use for the auth emulator.
   * @returns {void}
   */
  useEmulator(appName, host, port) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      connectAuthEmulator(auth, `http://${host}:${port}`);
    });
  },
};
