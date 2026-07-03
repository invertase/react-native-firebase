/*
 * Consumer-facing API type tests for @react-native-firebase/auth (modular API only).
 */

import { getApp } from '@react-native-firebase/app';
import {
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
  revokeToken,
  initializeAuth,
  isSignInWithEmailLink,
  multiFactor,
  onAuthStateChanged,
  onIdTokenChanged,
  OperationType,
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
  SDK_VERSION,
  type ActionCodeInfo,
  type ActionCodeSettings,
  type ApplicationVerifier,
  type Auth,
  type AuthError,
  type AuthProvider,
  type AuthSettings,
  type Config,
  type Dependencies,
  type IdTokenResult,
  type MultiFactorSession,
  type OAuthCredentialOptions,
  type PasswordPolicy,
  type PasswordValidationStatus,
  type Persistence,
  type PopupRedirectResolver,
  type TotpMultiFactorAssertion,
  type TotpSecret,
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

console.log(SDK_VERSION);
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
const modularAuthFromApp: Auth = getAuth(getApp());
const initializedAuth: Auth = initializeAuth(getApp(), dependencies);
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
const isEmailLink: boolean = isSignInWithEmailLink(modularAuth, 'https://example.com/link');
const totpQrCodeUrl: string = totpSecret.generateQrCodeUrl('account@example.com', 'Example App');
console.log(modularAuth.app.name, modularAuthFromApp.app.name, initializedAuth.app.name);
console.log(phoneVerificationId, isEmailLink, totpQrCodeUrl);
console.log(totpAssertionForSignIn, totpAssertionForEnrollment, generatedTotpSecret);

const emailCredential = EmailAuthProvider.credential('test@example.com', 'password123');
const phoneCredential = PhoneAuthProvider.credential('verification-id', '123456');
console.log(emailCredential.providerId, phoneCredential.providerId);

applyActionCode(modularAuth, 'oob-code');
checkActionCode(modularAuth, 'oob-code').then((info: ActionCodeInfo) =>
  console.log(info.data.email),
);
connectAuthEmulator(modularAuth, 'http://localhost:9099', { disableWarnings: false });
signOut(modularAuth);
sendSignInLinkToEmail(modularAuth, 'test@example.com', actionCodeSettings);
setLanguageCode(modularAuth, 'fr');
modularAuth.tenantId = 'tenant-id';
console.log(modularAuth.emulatorConfig?.host);
console.log(modularAuth.config);

const modularUser = {} as User;
multiFactor(modularUser).getSession();
getIdTokenResult(modularUser).then((result: IdTokenResult) => console.log(result.claims));
deleteUser(modularUser);
sendEmailVerification(modularUser, actionCodeSettings);
verifyBeforeUpdateEmail(modularUser, 'new@example.com', actionCodeSettings);
EmailAuthCredential.fromJSON({ email: 'a@b.com', password: 'pw', signInMethod: 'password' });
OAuthCredential.fromJSON({ providerId: 'google.com', idToken: 'token' });
PhoneAuthCredential.fromJSON({ verificationId: 'vid', verificationCode: '123456' });

void [
  beforeAuthStateChanged,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo,
  getCustomAuthDomain,
  getMultiFactorResolver,
  getRedirectResult,
  revokeToken,
  isSignInWithEmailLink,
  onAuthStateChanged,
  onIdTokenChanged,
  parseActionCodeURL,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithCredential,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  updateCurrentUser,
  useDeviceLanguage,
  useUserAccessGroup,
  validatePassword,
  verifyPasswordResetCode,
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
  ActionCodeURL,
  redirectProvider,
  popupRedirectResolver,
];
