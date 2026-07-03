/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getConstants(): {
    APP_LANGUAGE: Object;
    APP_USER: Object;
  };

  configureAuthDomain(appName: string): void;
  getCustomAuthDomain(appName: string): Promise<string | null>;
  addAuthStateListener(appName: string): void;
  removeAuthStateListener(appName: string): void;
  addIdTokenListener(appName: string): void;
  removeIdTokenListener(appName: string): void;
  forceRecaptchaFlowForTesting(appName: string, forceRecaptchaFlow: boolean): Promise<void>;
  setAutoRetrievedSmsCodeForPhoneNumber(
    appName: string,
    phoneNumber: string,
    smsCode: string,
  ): Promise<void>;
  setAppVerificationDisabledForTesting(appName: string, disabled: boolean): Promise<void>;
  useUserAccessGroup(appName: string, userAccessGroup: string): Promise<void>;
  signOut(appName: string): Promise<void>;
  signInAnonymously(appName: string): Promise<Object>;
  createUserWithEmailAndPassword(appName: string, email: string, password: string): Promise<Object>;
  isSignInWithEmailLink(appName: string, emailLink: string): boolean;
  signInWithEmailAndPassword(appName: string, email: string, password: string): Promise<Object>;
  signInWithEmailLink(appName: string, email: string, emailLink: string): Promise<Object>;
  signInWithCustomToken(appName: string, token: string): Promise<Object>;
  revokeToken(appName: string, authorizationCode: string): Promise<void>;
  sendPasswordResetEmail(
    appName: string,
    email: string,
    actionCodeSettings?: Object | null,
  ): Promise<void>;
  sendSignInLinkToEmail(appName: string, email: string, actionCodeSettings: Object): Promise<void>;
  deleteUser(appName: string): Promise<void>;
  reload(appName: string): Promise<Object>;
  sendEmailVerification(appName: string, actionCodeSettings?: Object | null): Promise<Object>;
  verifyBeforeUpdateEmail(
    appName: string,
    email: string,
    actionCodeSettings?: Object | null,
  ): Promise<Object>;
  updateEmail(appName: string, email: string): Promise<Object>;
  updatePassword(appName: string, password: string): Promise<Object>;
  updatePhoneNumber(
    appName: string,
    provider: string,
    authToken: string,
    authSecret: string,
  ): Promise<Object>;
  updateProfile(appName: string, props: Object): Promise<Object>;
  getIdToken(appName: string, forceRefresh: boolean): Promise<string>;
  getIdTokenResult(appName: string, forceRefresh: boolean): Promise<Object>;
  signInWithCredential(
    appName: string,
    provider: string,
    authToken: string,
    authSecret: string,
  ): Promise<Object>;
  signInWithProvider(appName: string, provider: Object): Promise<Object>;
  signInWithPhoneNumber(
    appName: string,
    phoneNumber: string,
    forceResend: boolean,
  ): Promise<Object>;
  verifyPhoneNumberWithMultiFactorInfo(
    appName: string,
    hintUid: string,
    sessionKey: string,
  ): Promise<string>;
  verifyPhoneNumberForMultiFactor(
    appName: string,
    phoneNumber: string,
    sessionKey: string,
  ): Promise<string>;
  resolveMultiFactorSignIn(
    appName: string,
    session: string,
    verificationId: string,
    verificationCode: string,
  ): Promise<Object>;
  resolveTotpSignIn(
    appName: string,
    sessionKey: string,
    uid: string,
    oneTimePassword: string,
  ): Promise<Object>;
  generateTotpSecret(appName: string, sessionKey: string): Promise<Object>;
  generateQrCodeUrl(appName: string, secretKey: string, account: string, issuer: string): string;
  openInOtpApp(appName: string, secretKey: string, qrCodeUri: string): void;
  getSession(appName: string): Promise<string>;
  unenrollMultiFactor(appName: string, factorUID: string): Promise<void>;
  finalizeMultiFactorEnrollment(
    appName: string,
    verificationId: string,
    verificationCode: string,
    displayName?: string | null,
  ): Promise<void>;
  finalizeTotpEnrollment(
    appName: string,
    totpSecret: string,
    verificationCode: string,
    displayName?: string | null,
  ): Promise<void>;
  confirmationResultConfirm(appName: string, verificationCode: string): Promise<Object>;
  verifyPhoneNumber(
    appName: string,
    phoneNumber: string,
    requestKey: string,
    timeout: number,
    forceResend: boolean,
  ): void;
  confirmPasswordReset(appName: string, code: string, newPassword: string): Promise<void>;
  applyActionCode(appName: string, code: string): Promise<Object | null>;
  checkActionCode(appName: string, code: string): Promise<Object>;
  linkWithCredential(
    appName: string,
    provider: string,
    authToken: string,
    authSecret: string,
  ): Promise<Object>;
  linkWithProvider(appName: string, provider: Object): Promise<Object>;
  unlink(appName: string, providerId: string): Promise<Object>;
  reauthenticateWithCredential(
    appName: string,
    provider: string,
    authToken: string,
    authSecret: string,
  ): Promise<Object>;
  reauthenticateWithProvider(appName: string, provider: Object): Promise<Object>;
  fetchSignInMethodsForEmail(appName: string, email: string): Promise<Array<string>>;
  setLanguageCode(appName: string, code: string | null): void;
  setTenantId(appName: string, tenantId: string | null): Promise<void>;
  useDeviceLanguage(appName: string): void;
  verifyPasswordResetCode(appName: string, code: string): Promise<string>;
  useEmulator(appName: string, host: string, port: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboAuth');
