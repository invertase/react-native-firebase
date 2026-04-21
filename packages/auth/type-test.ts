/*
 * Consumer-facing API type tests for @react-native-firebase/auth.
 * Part 1: namespaced API (firebase.auth(), default auth()).
 * Part 2: modular API (getAuth, signInWithEmailAndPassword, etc. from lib/modular.ts).
 */

import auth, {
  firebase,
  applyActionCode,
  beforeAuthStateChanged,
  checkActionCode,
  confirmPasswordReset,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo,
  getAuth,
  getCustomAuthDomain,
  getMultiFactorResolver,
  getRedirectResult,
  initializeAuth,
  isSignInWithEmailLink,
  multiFactor,
  onAuthStateChanged,
  onIdTokenChanged,
  parseActionCodeURL,
  PhoneAuthProvider,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  setLanguageCode,
  signInAnonymously,
  signInWithCredential,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateCurrentUser,
  useDeviceLanguage,
  useUserAccessGroup,
  validatePassword,
  verifyPasswordResetCode,
  type ActionCodeInfo,
  type ActionCodeSettings,
  type ApplicationVerifier,
  type Auth,
  type AuthCredential,
  type AuthProvider,
  type AuthSettings,
  type Config,
  type ConfirmationResult,
  type Dependencies,
  type IdTokenResult,
  type MultiFactorError,
  type PasswordPolicy,
  type PasswordValidationStatus,
  type Persistence,
  type PopupRedirectResolver,
  type Unsubscribe,
  type User,
  type UserCredential,
} from '.';

const authModule = auth();
const namespacedAuth = firebase.auth();
const authFromApp = firebase.app().auth();
const authFromAppArg = auth(firebase.app());

console.log(authModule.app.name);
console.log(namespacedAuth.currentUser);
console.log(authFromApp.app.name);
console.log(authFromAppArg.app.name);
console.log(firebase.auth.SDK_VERSION);
console.log(auth.firebase.SDK_VERSION);
console.log(firebase.SDK_VERSION);

const actionCodeSettings: ActionCodeSettings = {
  url: 'https://example.com/auth',
  handleCodeInApp: true,
  android: { packageName: 'io.invertase.demo', installApp: true },
  iOS: { bundleId: 'io.invertase.demo' },
};

const appVerifier: ApplicationVerifier = {
  type: 'recaptcha',
  verify: async () => 'token',
};

const popupRedirectResolver: PopupRedirectResolver = {};
const redirectProvider: AuthProvider = {
  PROVIDER_ID: 'oidc.test',
  credential: (token: string | null, secret?: string) =>
    ({ token, secret, providerId: 'oidc.test' }) as AuthCredential,
};
const authSettings: AuthSettings = { appVerificationDisabledForTesting: true };
const persistence: Persistence = { type: 'NONE' };
const authConfig: Config = {
  apiKey: 'api-key',
  apiHost: 'identitytoolkit.googleapis.com',
  apiScheme: 'https',
  tokenApiHost: 'securetoken.googleapis.com',
  sdkClientVersion: 'web/0.0.0',
};
const dependencies: Dependencies = {
  persistence,
  popupRedirectResolver,
};
const passwordPolicy: PasswordPolicy = {
  customStrengthOptions: { minPasswordLength: 6 },
  allowedNonAlphanumericCharacters: '!@#',
  enforcementState: 'OFF',
  forceUpgradeOnSignin: false,
};
const passwordValidationStatus: PasswordValidationStatus = {
  isValid: true,
  passwordPolicy,
};

console.log(authSettings.appVerificationDisabledForTesting);
console.log(authConfig.apiHost);
console.log(dependencies.persistence);
console.log(passwordValidationStatus.passwordPolicy.enforcementState);

const modularAuth: Auth = getAuth();
const modularAuthFromApp: Auth = getAuth(firebase.app());
const initializedAuth: Auth = initializeAuth(firebase.app(), dependencies);
console.log(modularAuth.app.name, modularAuthFromApp.app.name, initializedAuth.app.name);

namespacedAuth.setTenantId('tenant-123');
namespacedAuth.setLanguageCode('en');
namespacedAuth.useEmulator('http://localhost:9099');
namespacedAuth.sendPasswordResetEmail('test@example.com');
namespacedAuth.sendSignInLinkToEmail('test@example.com', actionCodeSettings);
namespacedAuth.verifyPasswordResetCode('oob-code').then((email: string) => console.log(email));
namespacedAuth
  .checkActionCode('oob-code')
  .then((info: ActionCodeInfo) => console.log(info.operation));
namespacedAuth.getCustomAuthDomain().then((domain: string) => console.log(domain));

const namespacedUnsubscribe: Unsubscribe = namespacedAuth.onAuthStateChanged(
  (user: User | null) => {
    console.log(user?.uid);
  },
);
namespacedUnsubscribe();

namespacedAuth.onIdTokenChanged((user: User | null) => {
  console.log(user?.email);
});

namespacedAuth
  .signInAnonymously()
  .then((credential: UserCredential) => console.log(credential.user.uid));
namespacedAuth
  .createUserWithEmailAndPassword('new@example.com', 'password123')
  .then((credential: UserCredential) => console.log(credential.user.email));
namespacedAuth
  .signInWithEmailAndPassword('test@example.com', 'password123')
  .then((credential: UserCredential) => console.log(credential.user.email));
namespacedAuth
  .signInWithCustomToken('custom-token')
  .then((credential: UserCredential) => console.log(credential.user.uid));
namespacedAuth
  .signInWithEmailLink('test@example.com', 'email-link')
  .then((credential: UserCredential) => console.log(credential.user.email));
namespacedAuth
  .signInWithPhoneNumber('+1234567890')
  .then((result: ConfirmationResult) => console.log(result.verificationId));
namespacedAuth.signOut();

const emailCredential = EmailAuthProvider.credential('test@example.com', 'password123');
const phoneCredential = PhoneAuthProvider.credential('verification-id', '123456');
console.log(emailCredential.providerId, phoneCredential.providerId);

applyActionCode(modularAuth, 'oob-code');
checkActionCode(modularAuth, 'oob-code').then((info: ActionCodeInfo) =>
  console.log(info.data.email),
);
confirmPasswordReset(modularAuth, 'oob-code', 'new-password');
connectAuthEmulator(modularAuth, 'http://localhost:9099', { disableWarnings: false });
createUserWithEmailAndPassword(modularAuth, 'new@example.com', 'password123').then(
  (credential: UserCredential) => console.log(credential.user.uid),
);
fetchSignInMethodsForEmail(modularAuth, 'test@example.com').then((methods: string[]) =>
  console.log(methods),
);
getMultiFactorResolver(modularAuth, {} as MultiFactorError);
getRedirectResult(modularAuth, popupRedirectResolver).then(result => console.log(result?.user.uid));
isSignInWithEmailLink(modularAuth, 'email-link').then((valid: boolean) => console.log(valid));

const modularUnsubscribe: Unsubscribe = onAuthStateChanged(modularAuth, (user: User | null) =>
  console.log(user?.email),
);
modularUnsubscribe();

onIdTokenChanged(modularAuth, (user: User | null) => console.log(user?.uid));
signInAnonymously(modularAuth).then((credential: UserCredential) =>
  console.log(credential.user.uid),
);
signInWithCredential(modularAuth, emailCredential).then((credential: UserCredential) =>
  console.log(credential.user.email),
);
signInWithCustomToken(modularAuth, 'custom-token').then((credential: UserCredential) =>
  console.log(credential.user.uid),
);
signInWithEmailAndPassword(modularAuth, 'test@example.com', 'password123').then(
  (credential: UserCredential) => console.log(credential.user.email),
);
signInWithEmailLink(modularAuth, 'test@example.com', 'email-link').then(
  (credential: UserCredential) => console.log(credential.user.email),
);
signInWithPhoneNumber(modularAuth, '+1234567890', appVerifier).then((result: ConfirmationResult) =>
  console.log(result.verificationId),
);
signInWithPopup(modularAuth, redirectProvider, popupRedirectResolver).then(result =>
  console.log(result.user.uid),
);
signInWithRedirect(modularAuth, redirectProvider, popupRedirectResolver).then(result =>
  console.log(result.user.uid),
);
signOut(modularAuth);
sendPasswordResetEmail(modularAuth, 'test@example.com', actionCodeSettings);
sendSignInLinkToEmail(modularAuth, 'test@example.com', actionCodeSettings);
setLanguageCode(modularAuth, 'fr');
useUserAccessGroup(modularAuth, 'group.example');
verifyPasswordResetCode(modularAuth, 'oob-code').then((email: string) => console.log(email));
getCustomAuthDomain(modularAuth).then((domain: string) => console.log(domain));
validatePassword(modularAuth, 'password123').then((status: PasswordValidationStatus) =>
  console.log(status.isValid),
);

beforeAuthStateChanged(modularAuth, async (user: User | null) => {
  console.log(user?.uid);
});
updateCurrentUser(modularAuth, null);
useDeviceLanguage(modularAuth);

const parsedActionCode = parseActionCodeURL(
  'https://example.com/auth?mode=verifyEmail&oobCode=abc',
);
console.log(parsedActionCode?.code);

const additionalUserInfo = getAdditionalUserInfo({
  additionalUserInfo: null,
  user: {} as User,
} as unknown as UserCredential);
console.log(additionalUserInfo);

const maybeUser = namespacedAuth.currentUser;
if (maybeUser) {
  maybeUser.reload();
  maybeUser.getIdToken().then((token: string) => console.log(token));
  maybeUser.getIdTokenResult().then((result: IdTokenResult) => console.log(result.claims));
  maybeUser.sendEmailVerification(actionCodeSettings);
  maybeUser.updateEmail('new@example.com');
  maybeUser.updatePassword('new-password');
  maybeUser.updatePhoneNumber(phoneCredential);
  maybeUser.updateProfile({ displayName: 'New Name', photoURL: 'https://example.com/photo.png' });

  const mfaUser = multiFactor(maybeUser);
  mfaUser.getSession();
}
