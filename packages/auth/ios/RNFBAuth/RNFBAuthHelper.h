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

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

// Plain Objective-C helper (see docs/ios-spm.md and
// okf-bundle/ios-spm-native-imports.md) that owns every call touching
// `FIRAuth`/`FIRUser` for RNFBAuthModule. This keeps RNFBAuthModule.mm free of
// Firebase Auth imports, which is required because the real `FIRAuth`/`FIRUser`
// class interfaces are implemented in Swift -- FirebaseAuth ships real ObjC
// headers only for auxiliary types (error codes, typedefs, provider classes),
// never for the core `FIRAuth`/`FIRUser` classes themselves. `@import
// FirebaseAuth` is the only way to get the real interface, and that can't be
// used from an Objective-C++ (.mm) TurboModule when C++ modules are disabled
// (required by React Native's JSI headers).
@interface RNFBAuthHelper : NSObject

+ (void)invalidate;

#pragma mark - Listeners

+ (void)addAuthStateListener:(NSString *)appName;
+ (void)removeAuthStateListener:(NSString *)appName;
+ (void)addIdTokenListener:(NSString *)appName;
+ (void)removeIdTokenListener:(NSString *)appName;

#pragma mark - Domain / settings

+ (void)configureAuthDomain:(NSString *)appName;

+ (void)getCustomAuthDomain:(NSString *)appName
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject;

+ (void)setAppVerificationDisabledForTesting:(NSString *)appName
                                     disabled:(BOOL)disabled
                                      resolve:(RCTPromiseResolveBlock)resolve
                                       reject:(RCTPromiseRejectBlock)reject;

+ (void)useUserAccessGroup:(NSString *)appName
            userAccessGroup:(NSString *)userAccessGroup
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject;

+ (void)setLanguageCode:(NSString *)appName code:(NSString *)code;

+ (void)setTenantId:(NSString *)appName
           tenantId:(NSString *)tenantId
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject;

+ (void)useDeviceLanguage:(NSString *)appName;

+ (void)useEmulator:(NSString *)appName host:(nonnull NSString *)host port:(double)port;

#pragma mark - Sign in / sign out

+ (void)signOut:(NSString *)appName
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject;

+ (void)signInAnonymously:(NSString *)appName
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject;

+ (void)signInWithEmailAndPassword:(NSString *)appName
                              email:(NSString *)email
                           password:(NSString *)password
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject;

+ (NSNumber *)isSignInWithEmailLink:(NSString *)appName emailLink:(NSString *)emailLink;

+ (void)signInWithEmailLink:(NSString *)appName
                       email:(NSString *)email
                   emailLink:(NSString *)emailLink
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject;

+ (void)createUserWithEmailAndPassword:(NSString *)appName
                                  email:(NSString *)email
                               password:(NSString *)password
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject;

+ (void)signInWithCustomToken:(NSString *)appName
                   customToken:(NSString *)customToken
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject;

+ (void)signInWithCredential:(NSString *)appName
                     provider:(NSString *)provider
                    authToken:(NSString *)authToken
                   authSecret:(NSString *)authSecret
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject;

+ (void)signInWithProvider:(NSString *)appName
                   provider:(NSDictionary *)provider
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject;

#pragma mark - Current user

+ (void)deleteUser:(NSString *)appName
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;

+ (void)reload:(NSString *)appName
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject;

+ (void)sendEmailVerification:(NSString *)appName
           actionCodeSettings:(NSDictionary *)actionCodeSettings
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject;

+ (void)verifyBeforeUpdateEmail:(NSString *)appName
                           email:(NSString *)email
              actionCodeSettings:(NSDictionary *)actionCodeSettings
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject;

+ (void)updateEmail:(NSString *)appName
              email:(NSString *)email
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject;

+ (void)updatePassword:(NSString *)appName
              password:(NSString *)password
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

#if TARGET_OS_IOS
+ (void)updatePhoneNumber:(NSString *)appName
                 provider:(NSString *)provider
                authToken:(NSString *)authToken
               authSecret:(NSString *)authSecret
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject;
#endif

+ (void)updateProfile:(NSString *)appName
                props:(NSDictionary *)props
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

+ (void)getIdToken:(NSString *)appName
      forceRefresh:(BOOL)forceRefresh
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;

+ (void)getIdTokenResult:(NSString *)appName
            forceRefresh:(BOOL)forceRefresh
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

#pragma mark - Linking / re-auth / unlink

+ (void)linkWithCredential:(NSString *)appName
                  provider:(NSString *)provider
                 authToken:(NSString *)authToken
                authSecret:(NSString *)authSecret
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject;

+ (void)linkWithProvider:(NSString *)appName
                provider:(NSDictionary *)provider
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

+ (void)unlink:(NSString *)appName
    providerId:(NSString *)providerId
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject;

+ (void)reauthenticateWithCredential:(NSString *)appName
                            provider:(NSString *)provider
                           authToken:(NSString *)authToken
                          authSecret:(NSString *)authSecret
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject;

+ (void)reauthenticateWithProvider:(NSString *)appName
                          provider:(NSDictionary *)provider
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject;

+ (void)fetchSignInMethodsForEmail:(NSString *)appName
                              email:(NSString *)email
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject;

#pragma mark - Action codes

+ (void)confirmPasswordReset:(NSString *)appName
                         code:(NSString *)code
                  newPassword:(NSString *)newPassword
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject;

+ (void)applyActionCode:(NSString *)appName
                    code:(NSString *)code
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

+ (void)checkActionCode:(NSString *)appName
                    code:(NSString *)code
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

+ (void)revokeToken:(NSString *)appName
    authorizationCode:(NSString *)authorizationCode
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

+ (void)sendPasswordResetEmail:(NSString *)appName
                          email:(NSString *)email
             actionCodeSettings:(NSDictionary *)actionCodeSettings
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject;

+ (void)sendSignInLinkToEmail:(NSString *)appName
                         email:(NSString *)email
            actionCodeSettings:(NSDictionary *)actionCodeSettings
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject;

+ (void)verifyPasswordResetCode:(NSString *)appName
                            code:(NSString *)code
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject;

#pragma mark - Phone auth / multi-factor (iOS only)

#if TARGET_OS_IOS
+ (void)signInWithPhoneNumber:(NSString *)appName
                   phoneNumber:(NSString *)phoneNumber
                   forceResend:(BOOL)forceResend
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject;

+ (void)verifyPhoneNumberWithMultiFactorInfo:(NSString *)appName
                                      hintUid:(NSString *)hintUid
                                   sessionKey:(NSString *)sessionKey
                                      resolve:(RCTPromiseResolveBlock)resolve
                                       reject:(RCTPromiseRejectBlock)reject;

+ (void)verifyPhoneNumberForMultiFactor:(NSString *)appName
                             phoneNumber:(NSString *)phoneNumber
                              sessionKey:(NSString *)sessionKey
                                 resolve:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject;

+ (void)resolveMultiFactorSignIn:(NSString *)appName
                          session:(NSString *)session
                   verificationId:(NSString *)verificationId
                 verificationCode:(NSString *)verificationCode
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject;

+ (void)resolveTotpSignIn:(NSString *)appName
                sessionKey:(NSString *)sessionKey
                       uid:(NSString *)uid
           oneTimePassword:(NSString *)oneTimePassword
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject;

+ (void)generateTotpSecret:(NSString *)appName
                 sessionKey:(NSString *)sessionKey
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject;

+ (NSString *)generateQrCodeUrl:(NSString *)appName
                       secretKey:(NSString *)secretKey
                         account:(NSString *)account
                          issuer:(NSString *)issuer;

+ (void)openInOtpApp:(NSString *)appName secretKey:(NSString *)secretKey qrCodeUri:(NSString *)qrCodeUri;

+ (void)getSession:(NSString *)appName
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;

+ (void)unenrollMultiFactor:(NSString *)appName
                  factorUID:(NSString *)factorUID
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject;

+ (void)finalizeMultiFactorEnrollment:(NSString *)appName
                        verificationId:(NSString *)verificationId
                      verificationCode:(NSString *)verificationCode
                           displayName:(NSString *_Nullable)displayName
                               resolve:(RCTPromiseResolveBlock)resolve
                                reject:(RCTPromiseRejectBlock)reject;

+ (void)finalizeTotpEnrollment:(NSString *)appName
                     totpSecret:(NSString *)totpSecret
               verificationCode:(NSString *)verificationCode
                    displayName:(NSString *_Nullable)displayName
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject;

+ (void)verifyPhoneNumber:(NSString *)appName
               phoneNumber:(NSString *)phoneNumber
                requestKey:(NSString *)requestKey
                   timeout:(double)timeout
               forceResend:(BOOL)forceResend;

+ (void)confirmationResultConfirm:(NSString *)appName
                  verificationCode:(NSString *)verificationCode
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject;
#endif

#pragma mark - Constants

+ (NSDictionary *)authConstantsDictionary;

@end
