import auth, {
  firebase,
  FirebaseAuthTypes,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithCustomToken,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  fetchSignInMethodsForEmail,
  useDeviceLanguage,
  setLanguageCode,
  connectAuthEmulator,
  getMultiFactorResolver,
  multiFactor,
  EmailAuthProvider,
} from '.';

console.log(auth().app);

// checks module exists at root
console.log(firebase.auth().app.name);
console.log(firebase.auth().currentUser);

// checks module exists at app level
console.log(firebase.app().auth().app.name);
console.log(firebase.app().auth().currentUser);

// checks statics exist
console.log(firebase.auth.SDK_VERSION);

// checks statics exist on defaultExport
console.log(auth.firebase.SDK_VERSION);

// checks root exists
console.log(firebase.SDK_VERSION);

// checks multi-app support exists
console.log(firebase.auth(firebase.app()).app.name);

// checks default export supports app arg
console.log(auth(firebase.app()).app.name);

// checks statics - providers
console.log(firebase.auth.EmailAuthProvider.PROVIDER_ID);
console.log(firebase.auth.PhoneAuthProvider.PROVIDER_ID);
console.log(firebase.auth.GoogleAuthProvider.PROVIDER_ID);
console.log(firebase.auth.GithubAuthProvider.PROVIDER_ID);
console.log(firebase.auth.TwitterAuthProvider.PROVIDER_ID);
console.log(firebase.auth.FacebookAuthProvider.PROVIDER_ID);
console.log(firebase.auth.AppleAuthProvider.PROVIDER_ID);
console.log(firebase.auth.OAuthProvider);
console.log(firebase.auth.OIDCAuthProvider);
console.log(firebase.auth.PhoneAuthState.CODE_SENT);
console.log(firebase.auth.PhoneMultiFactorGenerator);
console.log(firebase.auth.getMultiFactorResolver);
console.log(firebase.auth.multiFactor);

// checks Module instance APIs
const authInstance = firebase.auth();
console.log(authInstance.currentUser);
console.log(authInstance.tenantId);
console.log(authInstance.languageCode);
console.log(authInstance.settings);

authInstance.setTenantId('tenant-123').then(() => {
  console.log('Tenant set');
});

authInstance.setLanguageCode('fr').then(() => {
  console.log('Language set');
});

authInstance.useEmulator('http://localhost:9099');

const unsubscribe1 = authInstance.onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
  if (user) {
    console.log(user.email);
    console.log(user.displayName);
    console.log(user.uid);
  }
});

const unsubscribe2 = authInstance.onIdTokenChanged((user: FirebaseAuthTypes.User | null) => {
  if (user) {
    console.log(user.email);
  }
});

unsubscribe1();
unsubscribe2();

authInstance.signInAnonymously().then((credential: FirebaseAuthTypes.UserCredential) => {
  console.log(credential.user.uid);
});

authInstance
  .signInWithEmailAndPassword('test@example.com', 'password123')
  .then((credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.email);
  });

authInstance
  .signInWithCustomToken('custom-token')
  .then((credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.uid);
  });

authInstance
  .signInWithEmailLink('test@example.com', 'email-link')
  .then((credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.email);
  });

authInstance
  .signInWithPhoneNumber('+1234567890')
  .then((result: FirebaseAuthTypes.ConfirmationResult) => {
    console.log(result.verificationId);
  });

authInstance.signOut().then(() => {
  console.log('Signed out');
});

authInstance
  .createUserWithEmailAndPassword('new@example.com', 'password123')
  .then((credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.email);
  });

authInstance.sendPasswordResetEmail('test@example.com').then(() => {
  console.log('Password reset email sent');
});

authInstance.confirmPasswordReset('code', 'newPassword').then(() => {
  console.log('Password reset confirmed');
});

authInstance.verifyPasswordResetCode('code').then((email: string) => {
  console.log(email);
});

authInstance.sendSignInLinkToEmail('test@example.com').then(() => {
  console.log('Sign in link sent');
});

authInstance.isSignInWithEmailLink('email-link').then((isLink: boolean) => {
  console.log(isLink);
});

authInstance.fetchSignInMethodsForEmail('test@example.com').then((methods: string[]) => {
  console.log(methods);
});

const resolver = authInstance.getMultiFactorResolver({} as FirebaseAuthTypes.MultiFactorError);
console.log(resolver);

authInstance.getCustomAuthDomain().then((domain: string) => {
  console.log(domain);
});

// checks modular API functions
const authModular1 = getAuth();
console.log(authModular1.app.name);

const authModular2 = getAuth(firebase.app());
console.log(authModular2.app.name);

const authModular3 = initializeAuth(firebase.app());
console.log(authModular3.app.name);

onAuthStateChanged(authInstance, (user: FirebaseAuthTypes.User | null) => {
  console.log(user?.email);
});

onIdTokenChanged(authInstance, (user: FirebaseAuthTypes.User | null) => {
  console.log(user?.email);
});

signInAnonymously(authInstance).then((credential: FirebaseAuthTypes.UserCredential) => {
  console.log(credential.user.uid);
});

signInWithEmailAndPassword(authInstance, 'test@example.com', 'password123').then(
  (credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.email);
  },
);

const emailCredential = EmailAuthProvider.credential('test@example.com', 'password');
signInWithCredential(authInstance, emailCredential).then(
  (credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.email);
  },
);

signInWithCustomToken(authInstance, 'custom-token').then(
  (credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.uid);
  },
);

signInWithEmailLink(authInstance, 'test@example.com', 'email-link').then(
  (credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.email);
  },
);

signInWithPhoneNumber(authInstance, '+1234567890').then(
  (result: FirebaseAuthTypes.ConfirmationResult) => {
    console.log(result.verificationId);
  },
);

signOut(authInstance).then(() => {
  console.log('Signed out');
});

createUserWithEmailAndPassword(authInstance, 'new@example.com', 'password123').then(
  (credential: FirebaseAuthTypes.UserCredential) => {
    console.log(credential.user.email);
  },
);

sendPasswordResetEmail(authInstance, 'test@example.com').then(() => {
  console.log('Password reset email sent');
});

confirmPasswordReset(authInstance, 'code', 'newPassword').then(() => {
  console.log('Password reset confirmed');
});

verifyPasswordResetCode(authInstance, 'code').then((email: string) => {
  console.log(email);
});

sendSignInLinkToEmail(authInstance, 'test@example.com').then(() => {
  console.log('Sign in link sent');
});

isSignInWithEmailLink(authInstance, 'email-link').then((isLink: boolean) => {
  console.log(isLink);
});

fetchSignInMethodsForEmail(authInstance, 'test@example.com').then((methods: string[]) => {
  console.log(methods);
});

useDeviceLanguage(authInstance);

setLanguageCode(authInstance, 'fr').then(() => {
  console.log('Language set');
});

connectAuthEmulator(authInstance, 'http://localhost:9099', { disableWarnings: false });

const modularResolver = getMultiFactorResolver(
  authInstance,
  {} as FirebaseAuthTypes.MultiFactorError,
);
console.log(modularResolver);

// Test User methods if currentUser exists
const currentUser = authInstance.currentUser;
if (currentUser) {
  currentUser.reload().then(() => {
    console.log('User reloaded');
  });

  currentUser.getIdToken().then((token: string) => {
    console.log(token);
  });

  currentUser.getIdToken(true).then((token: string) => {
    console.log(token);
  });

  currentUser.getIdTokenResult().then((result: FirebaseAuthTypes.IdTokenResult) => {
    console.log(result.token);
  });

  currentUser.sendEmailVerification().then(() => {
    console.log('Verification email sent');
  });

  currentUser.updateEmail('new@example.com').then(() => {
    console.log('Email updated');
  });

  currentUser.updatePassword('newPassword').then(() => {
    console.log('Password updated');
  });

  currentUser.updateProfile({ displayName: 'New Name' }).then(() => {
    console.log('Profile updated');
  });

  const multiFactorUser = multiFactor(currentUser);
  console.log(multiFactorUser);
}
