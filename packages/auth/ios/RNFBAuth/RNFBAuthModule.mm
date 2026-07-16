/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

// This module intentionally has no Firebase imports -- see RNFBAuthHelper.h /
// RNFBAuthModule.h for why. Every Firebase Auth SDK call is routed through the
// plain Objective-C RNFBAuthHelper class instead, which can safely `@import
// FirebaseAuth` because it compiles as ObjC, not ObjC++.
#import "RNFBAuthModule.h"
#import "RNFBAuthHelper.h"
#import "RNFBAuthTurboModules.h"

@implementation RNFBAuthModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE(NativeRNFBTurboAuth);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboAuthSpecJSI>(params);
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  [RNFBAuthHelper invalidate];
}

#pragma mark -
#pragma mark Firebase Auth Methods

- (void)addAuthStateListener:(NSString *)appName {
  [RNFBAuthHelper addAuthStateListener:appName];
}

- (void)removeAuthStateListener:(NSString *)appName {
  [RNFBAuthHelper removeAuthStateListener:appName];
}

- (void)addIdTokenListener:(NSString *)appName {
  [RNFBAuthHelper addIdTokenListener:appName];
}

- (void)removeIdTokenListener:(NSString *)appName {
  [RNFBAuthHelper removeIdTokenListener:appName];
}

- (void)configureAuthDomain:(NSString *)appName {
  [RNFBAuthHelper configureAuthDomain:appName];
}

- (void)getCustomAuthDomain:(NSString *)appName
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper getCustomAuthDomain:appName resolve:resolve reject:reject];
}

- (void)setAppVerificationDisabledForTesting:(NSString *)appName
                                    disabled:(BOOL)disabled
                                     resolve:(RCTPromiseResolveBlock)resolve
                                      reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper setAppVerificationDisabledForTesting:appName
                                              disabled:disabled
                                               resolve:resolve
                                                reject:reject];
}

- (void)forceRecaptchaFlowForTesting:(NSString *)appName
                  forceRecaptchaFlow:(BOOL)forceRecaptchaFlow
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  resolve([NSNull null]);
}

- (void)setAutoRetrievedSmsCodeForPhoneNumber:(NSString *)appName
                                  phoneNumber:(NSString *)phoneNumber
                                      smsCode:(NSString *)smsCode
                                      resolve:(RCTPromiseResolveBlock)resolve
                                       reject:(RCTPromiseRejectBlock)reject {
  resolve([NSNull null]);
}

- (void)useUserAccessGroup:(NSString *)appName
           userAccessGroup:(NSString *)userAccessGroup
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper useUserAccessGroup:appName
                     userAccessGroup:userAccessGroup
                             resolve:resolve
                              reject:reject];
}

- (void)signOut:(NSString *)appName
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper signOut:appName resolve:resolve reject:reject];
}

- (void)signInAnonymously:(NSString *)appName
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper signInAnonymously:appName resolve:resolve reject:reject];
}

- (void)signInWithEmailAndPassword:(NSString *)appName
                             email:(NSString *)email
                          password:(NSString *)password
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper signInWithEmailAndPassword:appName
                                       email:email
                                    password:password
                                     resolve:resolve
                                      reject:reject];
}

- (NSNumber *)isSignInWithEmailLink:(NSString *)appName emailLink:(NSString *)emailLink {
  return [RNFBAuthHelper isSignInWithEmailLink:appName emailLink:emailLink];
}

- (void)signInWithEmailLink:(NSString *)appName
                      email:(NSString *)email
                  emailLink:(NSString *)emailLink
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper signInWithEmailLink:appName
                                email:email
                            emailLink:emailLink
                              resolve:resolve
                               reject:reject];
}

- (void)createUserWithEmailAndPassword:(NSString *)appName
                                 email:(NSString *)email
                              password:(NSString *)password
                               resolve:(RCTPromiseResolveBlock)resolve
                                reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper createUserWithEmailAndPassword:appName
                                           email:email
                                        password:password
                                         resolve:resolve
                                          reject:reject];
}

- (void)deleteUser:(NSString *)appName
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper deleteUser:appName resolve:resolve reject:reject];
}

- (void)reload:(NSString *)appName
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper reload:appName resolve:resolve reject:reject];
}

- (void)sendEmailVerification:(NSString *)appName
           actionCodeSettings:(NSDictionary *)actionCodeSettings
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper sendEmailVerification:appName
                     actionCodeSettings:actionCodeSettings
                                resolve:resolve
                                 reject:reject];
}

- (void)verifyBeforeUpdateEmail:(NSString *)appName
                          email:(NSString *)email
             actionCodeSettings:(NSDictionary *)actionCodeSettings
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper verifyBeforeUpdateEmail:appName
                                    email:email
                       actionCodeSettings:actionCodeSettings
                                  resolve:resolve
                                   reject:reject];
}

- (void)updateEmail:(NSString *)appName
              email:(NSString *)email
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper updateEmail:appName email:email resolve:resolve reject:reject];
}

- (void)updatePassword:(NSString *)appName
              password:(NSString *)password
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper updatePassword:appName password:password resolve:resolve reject:reject];
}

#if TARGET_OS_IOS
- (void)updatePhoneNumber:(NSString *)appName
                 provider:(NSString *)provider
                authToken:(NSString *)authToken
               authSecret:(NSString *)authSecret
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper updatePhoneNumber:appName
                           provider:provider
                          authToken:authToken
                         authSecret:authSecret
                            resolve:resolve
                             reject:reject];
}
#endif

- (void)updateProfile:(NSString *)appName
                props:(NSDictionary *)props
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper updateProfile:appName props:props resolve:resolve reject:reject];
}

- (void)getIdToken:(NSString *)appName
      forceRefresh:(BOOL)forceRefresh
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper getIdToken:appName forceRefresh:forceRefresh resolve:resolve reject:reject];
}

- (void)getIdTokenResult:(NSString *)appName
            forceRefresh:(BOOL)forceRefresh
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper getIdTokenResult:appName forceRefresh:forceRefresh resolve:resolve reject:reject];
}

- (void)signInWithCredential:(NSString *)appName
                    provider:(NSString *)provider
                   authToken:(NSString *)authToken
                  authSecret:(NSString *)authSecret
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper signInWithCredential:appName
                              provider:provider
                             authToken:authToken
                            authSecret:authSecret
                               resolve:resolve
                                reject:reject];
}

- (void)signInWithProvider:(NSString *)appName
                  provider:(NSDictionary *)provider
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper signInWithProvider:appName provider:provider resolve:resolve reject:reject];
}

- (void)confirmPasswordReset:(NSString *)appName
                        code:(NSString *)code
                 newPassword:(NSString *)newPassword
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper confirmPasswordReset:appName
                                  code:code
                           newPassword:newPassword
                               resolve:resolve
                                reject:reject];
}

- (void)applyActionCode:(NSString *)appName
                   code:(NSString *)code
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper applyActionCode:appName code:code resolve:resolve reject:reject];
}

- (void)checkActionCode:(NSString *)appName
                   code:(NSString *)code
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper checkActionCode:appName code:code resolve:resolve reject:reject];
}

- (void)revokeToken:(NSString *)appName
    authorizationCode:(NSString *)authorizationCode
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper revokeToken:appName
            authorizationCode:authorizationCode
                      resolve:resolve
                       reject:reject];
}

- (void)sendPasswordResetEmail:(NSString *)appName
                         email:(NSString *)email
            actionCodeSettings:(NSDictionary *)actionCodeSettings
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper sendPasswordResetEmail:appName
                                   email:email
                      actionCodeSettings:actionCodeSettings
                                 resolve:resolve
                                  reject:reject];
}

- (void)sendSignInLinkToEmail:(NSString *)appName
                        email:(NSString *)email
           actionCodeSettings:(NSDictionary *)actionCodeSettings
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper sendSignInLinkToEmail:appName
                                  email:email
                     actionCodeSettings:actionCodeSettings
                                resolve:resolve
                                 reject:reject];
}

- (void)signInWithCustomToken:(NSString *)appName
                  customToken:(NSString *)customToken
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper signInWithCustomToken:appName
                            customToken:customToken
                                resolve:resolve
                                 reject:reject];
}

#if TARGET_OS_IOS
- (void)signInWithPhoneNumber:(NSString *)appName
                  phoneNumber:(NSString *)phoneNumber
                  forceResend:(BOOL)forceResend
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper signInWithPhoneNumber:appName
                            phoneNumber:phoneNumber
                            forceResend:forceResend
                                resolve:resolve
                                 reject:reject];
}

- (void)verifyPhoneNumberWithMultiFactorInfo:(NSString *)appName
                                     hintUid:(NSString *)hintUid
                                  sessionKey:(NSString *)sessionKey
                                     resolve:(RCTPromiseResolveBlock)resolve
                                      reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper verifyPhoneNumberWithMultiFactorInfo:appName
                                               hintUid:hintUid
                                            sessionKey:sessionKey
                                               resolve:resolve
                                                reject:reject];
}

- (void)verifyPhoneNumberForMultiFactor:(NSString *)appName
                            phoneNumber:(NSString *)phoneNumber
                             sessionKey:(NSString *)sessionKey
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper verifyPhoneNumberForMultiFactor:appName
                                      phoneNumber:phoneNumber
                                       sessionKey:sessionKey
                                          resolve:resolve
                                           reject:reject];
}

- (void)resolveMultiFactorSignIn:(NSString *)appName
                         session:(NSString *)session
                  verificationId:(NSString *)verificationId
                verificationCode:(NSString *)verificationCode
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper resolveMultiFactorSignIn:appName
                                   session:session
                            verificationId:verificationId
                          verificationCode:verificationCode
                                   resolve:resolve
                                    reject:reject];
}

- (void)resolveTotpSignIn:(NSString *)appName
               sessionKey:(NSString *)sessionKey
                      uid:(NSString *)uid
          oneTimePassword:(NSString *)oneTimePassword
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper resolveTotpSignIn:appName
                         sessionKey:sessionKey
                                uid:uid
                    oneTimePassword:oneTimePassword
                            resolve:resolve
                             reject:reject];
}

- (void)generateTotpSecret:(NSString *)appName
                sessionKey:(NSString *)sessionKey
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper generateTotpSecret:appName sessionKey:sessionKey resolve:resolve reject:reject];
}

- (NSString *)generateQrCodeUrl:(NSString *)appName
                      secretKey:(NSString *)secretKey
                        account:(NSString *)account
                         issuer:(NSString *)issuer {
  return [RNFBAuthHelper generateQrCodeUrl:appName
                                 secretKey:secretKey
                                   account:account
                                    issuer:issuer];
}

- (void)openInOtpApp:(NSString *)appName
           secretKey:(NSString *)secretKey
           qrCodeUri:(NSString *)qrCodeUri {
  [RNFBAuthHelper openInOtpApp:appName secretKey:secretKey qrCodeUri:qrCodeUri];
}

- (void)getSession:(NSString *)appName
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper getSession:appName resolve:resolve reject:reject];
}

- (void)unenrollMultiFactor:(NSString *)appName
                  factorUID:(NSString *)factorUID
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper unenrollMultiFactor:appName factorUID:factorUID resolve:resolve reject:reject];
}

- (void)finalizeMultiFactorEnrollment:(NSString *)appName
                       verificationId:(NSString *)verificationId
                     verificationCode:(NSString *)verificationCode
                          displayName:(NSString *_Nullable)displayName
                              resolve:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper finalizeMultiFactorEnrollment:appName
                                 verificationId:verificationId
                               verificationCode:verificationCode
                                    displayName:displayName
                                        resolve:resolve
                                         reject:reject];
}

- (void)finalizeTotpEnrollment:(NSString *)appName
                    totpSecret:(NSString *)totpSecret
              verificationCode:(NSString *)verificationCode
                   displayName:(NSString *_Nullable)displayName
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper finalizeTotpEnrollment:appName
                              totpSecret:totpSecret
                        verificationCode:verificationCode
                             displayName:displayName
                                 resolve:resolve
                                  reject:reject];
}

- (void)verifyPhoneNumber:(NSString *)appName
              phoneNumber:(NSString *)phoneNumber
               requestKey:(NSString *)requestKey
                  timeout:(double)timeout
              forceResend:(BOOL)forceResend {
  [RNFBAuthHelper verifyPhoneNumber:appName
                        phoneNumber:phoneNumber
                         requestKey:requestKey
                            timeout:timeout
                        forceResend:forceResend];
}

- (void)confirmationResultConfirm:(NSString *)appName
                 verificationCode:(NSString *)verificationCode
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper confirmationResultConfirm:appName
                           verificationCode:verificationCode
                                    resolve:resolve
                                     reject:reject];
}
#endif

- (void)linkWithCredential:(NSString *)appName
                  provider:(NSString *)provider
                 authToken:(NSString *)authToken
                authSecret:(NSString *)authSecret
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper linkWithCredential:appName
                            provider:provider
                           authToken:authToken
                          authSecret:authSecret
                             resolve:resolve
                              reject:reject];
}

- (void)linkWithProvider:(NSString *)appName
                provider:(NSDictionary *)provider
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper linkWithProvider:appName provider:provider resolve:resolve reject:reject];
}

- (void)unlink:(NSString *)appName
    providerId:(NSString *)providerId
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper unlink:appName providerId:providerId resolve:resolve reject:reject];
}

- (void)reauthenticateWithCredential:(NSString *)appName
                            provider:(NSString *)provider
                           authToken:(NSString *)authToken
                          authSecret:(NSString *)authSecret
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper reauthenticateWithCredential:appName
                                      provider:provider
                                     authToken:authToken
                                    authSecret:authSecret
                                       resolve:resolve
                                        reject:reject];
}

- (void)reauthenticateWithProvider:(NSString *)appName
                          provider:(NSDictionary *)provider
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper reauthenticateWithProvider:appName
                                    provider:provider
                                     resolve:resolve
                                      reject:reject];
}

- (void)fetchSignInMethodsForEmail:(NSString *)appName
                             email:(NSString *)email
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper fetchSignInMethodsForEmail:appName email:email resolve:resolve reject:reject];
}

- (void)setLanguageCode:(NSString *)appName code:(NSString *)code {
  [RNFBAuthHelper setLanguageCode:appName code:code];
}

- (void)setTenantId:(NSString *)appName
           tenantId:(NSString *)tenantId
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper setTenantId:appName tenantId:tenantId resolve:resolve reject:reject];
}

- (void)useDeviceLanguage:(NSString *)appName {
  [RNFBAuthHelper useDeviceLanguage:appName];
}

- (void)verifyPasswordResetCode:(NSString *)appName
                           code:(NSString *)code
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  [RNFBAuthHelper verifyPasswordResetCode:appName code:code resolve:resolve reject:reject];
}

- (void)useEmulator:(NSString *)appName host:(nonnull NSString *)host port:(double)port {
  [RNFBAuthHelper useEmulator:appName host:host port:port];
}

#pragma mark -
#pragma mark Constants

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboAuth::Constants::Builder>)constantsToExport {
  return
      [_RCTTypedModuleConstants newWithUnsafeDictionary:[RNFBAuthHelper authConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboAuth::Constants::Builder>)getConstants {
  return [self constantsToExport];
}

@end
