/*
 * Consumer-facing API type tests for @react-native-firebase/auth.
 * Part 1: namespaced API (firebase.auth(), default auth()).
 * Part 2: modular API (getAuth, signInWithEmailAndPassword, etc. from lib/modular.ts).
 */

import auth, {
  firebase,
  applyActionCode,
  ActionCodeOperation,
  beforeAuthStateChanged,
  checkActionCode,
  confirmPasswordReset,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  FactorId,
  getAdditionalUserInfo,
  getAuth,
  getCustomAuthDomain,
  getIdTokenResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  getMultiFactorResolver,
  getRedirectResult,
  initializeAuth,
  isSignInWithEmailLink,
  multiFactor,
  onAuthStateChanged,
  onIdTokenChanged,
  OperationType,
  ProviderId,
  OAuthProvider,
  ActionCodeURL,
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
  SignInMethod,
  TotpMultiFactorGenerator,
  TwitterAuthProvider,
  updateCurrentUser,
  useDeviceLanguage,
  useUserAccessGroup,
  validatePassword,
  verifyPasswordResetCode,
  type ActionCodeInfo,
  type ActionCodeSettings,
  type ApplicationVerifier,
  type Auth,
  type AuthError,
  type AuthProvider,
  type AuthSettings,
  type Config,
  type ConfirmationResult,
  type Dependencies,
  type FirebaseAuthTypes,
  type IdTokenResult,
  type MultiFactorError,
  type MultiFactorSession,
  type OAuthCredentialOptions,
  type PasswordPolicy,
  type PasswordValidationStatus,
  type Persistence,
  type PopupRedirectResolver,
  type TotpMultiFactorAssertion,
  type TotpSecret,
  type Unsubscribe,
  type User,
  type UserCredential,
  deleteUser,
  getIdToken,
  linkWithCredential,
  linkWithPopup,
  linkWithRedirect,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  reauthenticateWithRedirect,
  reload,
  unlink,
  updateEmail,
  updatePassword,
  updatePhoneNumber,
  updateProfile,
  verifyBeforeUpdateEmail,
  sendEmailVerification,
  EmailAuthCredential,
  OAuthCredential,
  PhoneAuthCredential,
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
const redirectProvider = { providerId: 'oidc.test' } as AuthProvider;
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
const emailAuthCredential: EmailAuthCredential = EmailAuthProvider.credential(
  'email@example.com',
  'password',
);
const phoneAuthCredential: PhoneAuthCredential = PhoneAuthProvider.credential(
  'verification-id',
  '123456',
);
const oauthCredentialOptions: OAuthCredentialOptions = {
  idToken: 'id-token',
  accessToken: 'access-token',
  rawNonce: 'nonce',
};
const oauthCredential: OAuthCredential = new OAuthProvider('apple.com').credential(
  oauthCredentialOptions,
);
const oauthCredentialFromJSON: OAuthCredential = OAuthProvider.credentialFromJSON({
  providerId: 'apple.com',
  idToken: 'apple-id-token',
  accessToken: 'apple-access-token',
  rawNonce: 'nonce',
});
const facebookCredential: OAuthCredential = FacebookAuthProvider.credential('facebook-token');
const facebookCredentialFromResult: OAuthCredential | null =
  FacebookAuthProvider.credentialFromResult({} as UserCredential);
const facebookCredentialFromError: OAuthCredential | null =
  FacebookAuthProvider.credentialFromError({} as AuthError);
const githubCredential: OAuthCredential = GithubAuthProvider.credential('github-token');
const githubCredentialFromResult: OAuthCredential | null = GithubAuthProvider.credentialFromResult(
  {} as UserCredential,
);
const githubCredentialFromError: OAuthCredential | null = GithubAuthProvider.credentialFromError(
  {} as AuthError,
);
const googleCredential: OAuthCredential = GoogleAuthProvider.credential('google-id-token', null);
const googleCredentialFromResult: OAuthCredential | null = GoogleAuthProvider.credentialFromResult(
  {} as UserCredential,
);
const googleCredentialFromError: OAuthCredential | null = GoogleAuthProvider.credentialFromError(
  {} as AuthError,
);
const twitterCredential: OAuthCredential = TwitterAuthProvider.credential(
  'twitter-token',
  'twitter-secret',
);
const twitterCredentialFromResult: OAuthCredential | null =
  TwitterAuthProvider.credentialFromResult({} as UserCredential);
const twitterCredentialFromError: OAuthCredential | null = TwitterAuthProvider.credentialFromError(
  {} as AuthError,
);

console.log(authSettings.appVerificationDisabledForTesting);
console.log(authConfig.apiHost);
console.log(dependencies.persistence);
console.log(passwordValidationStatus.passwordPolicy.enforcementState);
console.log(emailAuthCredential.signInMethod);
console.log(phoneAuthCredential.providerId);
console.log(phoneAuthCredential.signInMethod);
console.log(oauthCredentialOptions.idToken);
console.log(oauthCredential.providerId);
console.log(oauthCredential.rawNonce);
console.log(oauthCredentialFromJSON.accessToken);
console.log(facebookCredential.accessToken);
console.log(facebookCredentialFromResult?.accessToken);
console.log(facebookCredentialFromError?.accessToken);
console.log(githubCredential.accessToken);
console.log(githubCredentialFromResult?.accessToken);
console.log(githubCredentialFromError?.accessToken);
console.log(googleCredential.idToken);
console.log(googleCredentialFromResult?.idToken);
console.log(googleCredentialFromError?.idToken);
console.log(twitterCredential.accessToken);
console.log(twitterCredentialFromResult?.accessToken);
console.log(twitterCredentialFromError?.accessToken);
console.log(
  ActionCodeOperation.VERIFY_EMAIL,
  FactorId.PHONE,
  OperationType.SIGN_IN,
  SignInMethod.EMAIL_LINK,
);

const modularAuth: Auth = getAuth();
const modularAuthFromApp: Auth = getAuth(firebase.app());
const initializedAuth: Auth = initializeAuth(firebase.app(), dependencies);
const phoneVerificationId: Promise<string> = new PhoneAuthProvider(modularAuth).verifyPhoneNumber(
  '+16505550101',
  appVerifier,
);
const totpAssertionForSignIn: TotpMultiFactorAssertion =
  TotpMultiFactorGenerator.assertionForSignIn('totp-uid', '123456');
declare const multiFactorSession: MultiFactorSession;
declare const totpSecret: TotpSecret;
const totpAssertionForEnrollment: TotpMultiFactorAssertion =
  TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, '123456');
const generatedTotpSecret: Promise<TotpSecret> =
  TotpMultiFactorGenerator.generateSecret(multiFactorSession);
console.log(modularAuth.app.name, modularAuthFromApp.app.name, initializedAuth.app.name);
console.log(phoneVerificationId);
console.log(totpAssertionForSignIn, totpAssertionForEnrollment, generatedTotpSecret);

namespacedAuth.setTenantId('tenant-123');
namespacedAuth.setLanguageCode('en');
namespacedAuth.useEmulator('http://localhost:9099');
namespacedAuth.sendPasswordResetEmail('test@example.com');
namespacedAuth.sendSignInLinkToEmail('test@example.com', actionCodeSettings);
namespacedAuth.verifyPasswordResetCode('oob-code').then((email: string) => console.log(email));
namespacedAuth
  .checkActionCode('oob-code')
  .then((info: FirebaseAuthTypes.ActionCodeInfo) => console.log(info.operation));
namespacedAuth.getCustomAuthDomain().then((domain: string) => console.log(domain));

const namespacedUnsubscribe: Unsubscribe = namespacedAuth.onAuthStateChanged(
  (user: FirebaseAuthTypes.User | null) => {
    console.log(user?.uid);
  },
);
namespacedUnsubscribe();

namespacedAuth.onIdTokenChanged((user: FirebaseAuthTypes.User | null) => {
  console.log(user?.email);
});

namespacedAuth
  .signInAnonymously()
  .then((credential: FirebaseAuthTypes.UserCredential) => console.log(credential.user.uid));
namespacedAuth
  .createUserWithEmailAndPassword('new@example.com', 'password123')
  .then((credential: FirebaseAuthTypes.UserCredential) => console.log(credential.user.email));
namespacedAuth
  .signInWithEmailAndPassword('test@example.com', 'password123')
  .then((credential: FirebaseAuthTypes.UserCredential) => console.log(credential.user.email));
namespacedAuth
  .signInWithCustomToken('custom-token')
  .then((credential: FirebaseAuthTypes.UserCredential) => console.log(credential.user.uid));
namespacedAuth
  .signInWithEmailLink('test@example.com', 'email-link')
  .then((credential: FirebaseAuthTypes.UserCredential) => console.log(credential.user.email));
namespacedAuth
  .signInWithPhoneNumber('+1234567890')
  .then((result: FirebaseAuthTypes.ConfirmationResult) => console.log(result.verificationId));
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
signInWithEmailLink(modularAuth, 'test@example.com').then((credential: UserCredential) =>
  console.log(credential.user.email),
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

void ActionCodeURL.parseLink('https://example.com/auth?mode=verifyEmail&oobCode=abc');

const parsedActionCode = parseActionCodeURL(
  'https://example.com/auth?mode=verifyEmail&oobCode=abc',
);
if (parsedActionCode) {
  console.log(parsedActionCode.code);
}

const additionalUserInfo = getAdditionalUserInfo({
  additionalUserInfo: null,
  user: {} as User,
} as unknown as UserCredential);
console.log(additionalUserInfo);

const maybeUser = namespacedAuth.currentUser;
if (maybeUser) {
  maybeUser.reload();
  maybeUser.getIdToken().then((token: string) => console.log(token));
  maybeUser
    .getIdTokenResult()
    .then((result: FirebaseAuthTypes.IdTokenResult) => console.log(result.claims));
  maybeUser.sendEmailVerification(actionCodeSettings);
  maybeUser.updateEmail('new@example.com');
  maybeUser.updatePassword('new-password');
  maybeUser.updatePhoneNumber(phoneCredential);
  maybeUser.updateProfile({ displayName: 'New Name', photoURL: 'https://example.com/photo.png' });

  const namespacedMfaUser = namespacedAuth.multiFactor(maybeUser);
  namespacedMfaUser.getSession();
}

const modularUser = {} as User;
const modularMfaUser = multiFactor(modularUser);
modularMfaUser.getSession();
getIdTokenResult(modularUser).then((result: IdTokenResult) => console.log(result.claims));
modularAuth.authStateReady().then(() => console.log('auth ready'));
modularAuth.tenantId = 'tenant-id';
console.log(modularAuth.emulatorConfig?.host);
console.log(modularAuth.config);
deleteUser(modularUser);
getIdToken(modularUser);
linkWithCredential(modularUser, emailCredential);
linkWithPopup(modularUser, redirectProvider, popupRedirectResolver);
linkWithRedirect(modularUser, redirectProvider, popupRedirectResolver);
reauthenticateWithCredential(modularUser, emailCredential);
reauthenticateWithPopup(modularUser, redirectProvider, popupRedirectResolver);
reauthenticateWithRedirect(modularUser, redirectProvider, popupRedirectResolver);
reload(modularUser);
sendEmailVerification(modularUser, actionCodeSettings);
unlink(modularUser, ProviderId.GOOGLE);
updateEmail(modularUser, 'new@example.com');
updatePassword(modularUser, 'new-password');
updatePhoneNumber(modularUser, phoneCredential);
updateProfile(modularUser, { displayName: 'Name', photoURL: 'https://example.com/photo.png' });
verifyBeforeUpdateEmail(modularUser, 'new@example.com', actionCodeSettings);
namespacedAuth.sendSignInLinkToEmail('test@example.com');
EmailAuthCredential.fromJSON({ email: 'a@b.com', password: 'pw', signInMethod: 'password' });
OAuthCredential.fromJSON({ providerId: 'google.com', idToken: 'token' });
PhoneAuthCredential.fromJSON({ verificationId: 'vid', verificationCode: '123456' });
