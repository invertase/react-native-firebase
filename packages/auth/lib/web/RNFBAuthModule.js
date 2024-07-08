import {
  getApp,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  signInAnonymously,
  getAdditionalUserInfo,
  multiFactor,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithCustomToken,
  signInWithRedirect,
  sendPasswordResetEmail,
  useDeviceLanguage,
  verifyPasswordResetCode,
  connectAuthEmulator,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  updateEmail,
  updatePassword,
  updateProfile,
  updatePhoneNumber,
  signInWithCredential,
  unlink,
  getIdToken,
  getIdTokenResult,
  applyActionCode,
  checkActionCode,
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  PhoneAuthProvider,
  OAuthProvider,
} from '@react-native-firebase/app/lib/internal/web/firebaseAuth';

// A general purpose guard function to catch errors and return a structured error object.
async function guard(fn) {
  try {
    return await fn();
  } catch (e) {
    return rejectPromiseWithCodeAndMessage(e);
  }
}

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
  return rejectPromise({ code: `auth/${code}`, message });
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
    multiFactor: multiFactor(user).enrolledFactors.map(multiFactorInfoToObject),
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
function getAuthCredential(auth, provider, token, secret) {
  if (provider.startsWith('oidc.')) {
    return new OAuthProvider(provider).credential({
      idToken: token,
    });
  }

  switch (provider) {
    case 'facebook.com':
      return new FacebookAuthProvider().credential(token);
    case 'google.com':
      return new GoogleAuthProvider().credential(token, secret);
    case 'twitter.com':
      return new TwitterAuthProvider().credential(token, secret);
    case 'github.com':
      return new GithubAuthProvider().credential(token);
    case 'apple.com':
      return new OAuthProvider(provider).credential({
        idToken: token,
        rawNonce: secret,
      });
    case 'oauth':
      // TODO(ehesp): Is this correct?
      return new OAuthProvider(provider).credential({
        idToken: token,
        accessToken: secret,
      });
    case 'phone':
      return new PhoneAuthProvider(auth).credential(token, secret);
    case 'password':
      return new EmailAuthProvider().credential(token, secret);
    case 'emailLink':
      return new EmailAuthProvider().credentialWithLink(token, secret);
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
    creationTime: metadata.creationTime ? new Date(metadata.creationTime).getTime() : null,
    creationTime: metadata.lastSignInTime ? new Date(metadata.lastSignInTime).getTime() : null,
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
const IdTokenListeners = {};
const sessionMap = new Map();
let sessionId = 0;

// Returns a cached Firestore instance.
function getCachedAuthInstance(appName) {
  return (instances[appName] ??= getAuth(getApp(appName)));
}

/**
 * This is a 'NativeModule' for the web platform.
 * Methods here are identical to the ones found in
 * the native android/ios modules e.g. `@ReactMethod` annotated
 * java methods on Android.
 */
export default {
  // TODO
  configureAuthDomain() {
    // TODO(ehesp): Is this a noop?
  },

  // TODO
  async getCustomAuthDomain() {
    // TODO(ehesp): Is this a noop?
  },

  // TODO
  addAuthStateListener(appName) {
    if (authStateListeners[appName]) {
      return;
    }

    return guard(() => {
      const auth = getCachedAuthInstance(appName);

      authStateListeners[appName] = onAuthStateChanged(auth, user => {
        const body = {
          appName,
          user: user ? userToObject(user) : null,
        };

        console.log(body);
        // TODO: Emit event: rnfb_auth_state_changed
      });
    });
  },

  // TODO
  removeAuthStateListener(appName) {
    if (authStateListeners[appName]) {
      authStateListeners[appName]();
      delete authStateListeners[appName];
    }
  },

  // TODO
  addIdTokenListener(appName) {
    if (IdTokenListeners[appName]) {
      return;
    }

    return guard(() => {
      const auth = getCachedAuthInstance(appName);

      IdTokenListeners[appName] = onIdTokenChanged(auth, user => {
        const body = {
          authenticated: !!user,
          appName,
          user: user ? userToObject(user) : null,
        };

        console.log(body);
        // TODO: Emit event: rnfb_auth_id_token_changed
      });
    });
  },

  // TODO
  removeIdTokenListener(appName) {
    if (IdTokenListeners[appName]) {
      IdTokenListeners[appName]();
      delete IdTokenListeners[appName];
    }
  },

  // TODO
  async forceRecaptchaFlowForTesting() {},

  // TODO
  async setAutoRetrievedSmsCodeForPhoneNumber() {},

  // TODO
  async setAppVerificationDisabledForTesting() {},

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
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return authResultToObject(credential);
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
      // TODO(ehesp): Looks like settings comes through as expected, but double check.
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
      // TODO(ehesp): Looks like settings comes through as expected, but double check.
      await sendPasswordResetEmail(auth, email, settings);
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
  async delete() {
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
  async reload() {
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

      // TODO(ehesp): Do action code settings come through as expected?
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

      // TODO(ehesp): Do action code settings come through as expected?
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

  // TODO...
  async signInWithProvider(appName, provider) {
    return guard(async () => {
      const auth = getCachedAuthInstance(appName);

      if (provider.providerId === null) {
        return rejectPromiseWithCodeAndMessage(
          'invalid-credential',
          'The supplied auth credential is malformed, has expired or is not currently supported.',
        );
      }

      const oauthProvider = new OAuthProvider(provider.providerId);

      if ('scopes' in provider) {
        for (const scope of provider.scopes) {
          oauthProvider.addScope(scope);
        }
      }

      if ('customParameters' in provider) {
        oauthProvider.setCustomParameters(provider.customParameters);
      }

      // TODO(ehesp): Is this correct? How do we get the result?
      await signInWithRedirect(auth, oauthProvider);
    });
  },

  // TODO...
  async signInWithPhoneNumber() {},

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

  // TODO
  async verifyPhoneNumberForMultiFactor(appName, phoneNumber, sessionKey) {
    return guard(async () => {
      const session = sessionMap.get(sessionKey);

      if (!session) {
        return rejectPromiseWithCodeAndMessage(
          'invalid-multi-factor-session',
          "can't find session for provided key",
        );
      }

      // TODO...
    });
  },

  // TODO
  async finalizeMultiFactorEnrollment() {},

  // TODO
  async resolveMultiFactorCredential() {},

  // TODO
  async resolveMultiFactorSignIn() {},

  // TODO
  async confirmationResultConfirm() {},

  // TODO
  async verifyPhoneNumber() {},

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

  // TODO
  async linkWithCredential() {},

  // TODO
  async linkWithProvider() {},

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

  // TODO
  async reauthenticateWithCredential() {},

  // TODO
  async reauthenticateWithProvider() {},

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
    return guard(() => {
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
  setTenantId() {
    return guard((appName, tenantId) => {
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
    return guard(() => {
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
    return guard(() => {
      const auth = getCachedAuthInstance(appName);
      connectAuthEmulator(auth, `http://${host}:${port}`);
    });
  },
};
