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

#import <Firebase/Firebase.h>
#import <React/RCTUtils.h>

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBAppModule.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBAuthModule.h"

static NSString *const keyIOS = @"iOS";
static NSString *const keyUrl = @"url";
static NSString *const keyUid = @"uid";
static NSString *const keyUser = @"user";
static NSString *const keyEmail = @"email";
static NSString *const keyAndroid = @"android";
static NSString *const keyProfile = @"profile";
static NSString *const keyNewUser = @"isNewUser";
static NSString *const keyUsername = @"username";
static NSString *const keyMultiFactor = @"multiFactor";
static NSString *const keyPhotoUrl = @"photoURL";
static NSString *const keyBundleId = @"bundleId";
static NSString *const keyInstallApp = @"installApp";
static NSString *const keyProviderId = @"providerId";
static NSString *const keyPhoneNumber = @"phoneNumber";
static NSString *const keyDisplayName = @"displayName";
static NSString *const keyPackageName = @"packageName";
static NSString *const keyMinVersion = @"minimumVersion";
static NSString *const constAppLanguage = @"APP_LANGUAGE";
static NSString *const constAppUser = @"APP_USER";
static NSString *const keyHandleCodeInApp = @"handleCodeInApp";
static NSString *const keyLinkDomain = @"linkDomain";
static NSString *const keyAdditionalUserInfo = @"additionalUserInfo";
static NSString *const AUTH_STATE_CHANGED_EVENT = @"auth_state_changed";
static NSString *const AUTH_ID_TOKEN_CHANGED_EVENT = @"auth_id_token_changed";
static NSString *const PHONE_AUTH_STATE_CHANGED_EVENT = @"phone_auth_state_changed";

static __strong NSMutableDictionary *authStateHandlers;
static __strong NSMutableDictionary *idTokenHandlers;
static __strong NSMutableDictionary *emulatorConfigs;
// Used for caching credentials between method calls.
static __strong NSMutableDictionary<NSString *, FIRAuthCredential *> *credentials;
#if TARGET_OS_IOS
static __strong NSMutableDictionary<NSString *, FIRMultiFactorResolver *> *cachedResolver;
static __strong NSMutableDictionary<NSString *, FIRMultiFactorSession *> *cachedSessions;
static __strong NSMutableDictionary<NSString *, FIRTOTPSecret *> *cachedTotpSecrets;
#endif

@implementation RNFBAuthModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (id)init {
  self = [super init];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    authStateHandlers = [[NSMutableDictionary alloc] init];
    idTokenHandlers = [[NSMutableDictionary alloc] init];
    emulatorConfigs = [[NSMutableDictionary alloc] init];
    credentials = [[NSMutableDictionary alloc] init];
#if TARGET_OS_IOS
    cachedResolver = [[NSMutableDictionary alloc] init];
    cachedSessions = [[NSMutableDictionary alloc] init];
    cachedTotpSecrets = [[NSMutableDictionary alloc] init];
#endif
  });
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  for (NSString *key in authStateHandlers) {
    FIRApp *firebaseApp = [RCTConvert firAppFromString:key];

    [[FIRAuth authWithApp:firebaseApp]
        removeAuthStateDidChangeListener:[authStateHandlers valueForKey:key]];
  }
  [authStateHandlers removeAllObjects];

  for (NSString *key in idTokenHandlers) {
    FIRApp *firebaseApp = [RCTConvert firAppFromString:key];
    [[FIRAuth authWithApp:firebaseApp]
        removeIDTokenDidChangeListener:[idTokenHandlers valueForKey:key]];
  }
  [idTokenHandlers removeAllObjects];

  [credentials removeAllObjects];
#if TARGET_OS_IOS
  [cachedResolver removeAllObjects];
  [cachedSessions removeAllObjects];
  [cachedTotpSecrets removeAllObjects];
#endif
}

#pragma mark -
#pragma mark Firebase Auth Methods

RCT_EXPORT_METHOD(addAuthStateListener : (FIRApp *)firebaseApp) {
  if (![authStateHandlers valueForKey:firebaseApp.name]) {
    FIRAuthStateDidChangeListenerHandle newListenerHandle = [[FIRAuth authWithApp:firebaseApp]
        addAuthStateDidChangeListener:^(FIRAuth *_Nonnull auth, FIRUser *_Nullable user) {
          if (user != nil) {
            [RNFBSharedUtils sendJSEventForApp:firebaseApp
                                          name:AUTH_STATE_CHANGED_EVENT
                                          body:@{keyUser : [self firebaseUserToDict:user]}];
          } else {
            [RNFBSharedUtils sendJSEventForApp:firebaseApp name:AUTH_STATE_CHANGED_EVENT body:@{}];
          }
        }];
    authStateHandlers[firebaseApp.name] = newListenerHandle;
  }
}

RCT_EXPORT_METHOD(removeAuthStateListener : (FIRApp *)firebaseApp) {
  if ([authStateHandlers valueForKey:firebaseApp.name]) {
    [[FIRAuth authWithApp:firebaseApp]
        removeAuthStateDidChangeListener:[authStateHandlers valueForKey:firebaseApp.name]];
    [authStateHandlers removeObjectForKey:firebaseApp.name];
  }
}

RCT_EXPORT_METHOD(addIdTokenListener : (FIRApp *)firebaseApp) {
  if (![idTokenHandlers valueForKey:firebaseApp.name]) {
    FIRIDTokenDidChangeListenerHandle newListenerHandle = [[FIRAuth authWithApp:firebaseApp]
        addIDTokenDidChangeListener:^(FIRAuth *_Nonnull auth, FIRUser *_Nullable user) {
          if (user != nil) {
            [RNFBSharedUtils sendJSEventForApp:firebaseApp
                                          name:AUTH_ID_TOKEN_CHANGED_EVENT
                                          body:@{keyUser : [self firebaseUserToDict:user]}];
          } else {
            [RNFBSharedUtils sendJSEventForApp:firebaseApp
                                          name:AUTH_ID_TOKEN_CHANGED_EVENT
                                          body:@{}];
          }
        }];
    idTokenHandlers[firebaseApp.name] = newListenerHandle;
  }
}

RCT_EXPORT_METHOD(removeIdTokenListener : (FIRApp *)firebaseApp) {
  if ([idTokenHandlers valueForKey:firebaseApp.name]) {
    [[FIRAuth authWithApp:firebaseApp]
        removeIDTokenDidChangeListener:[idTokenHandlers valueForKey:firebaseApp.name]];
    [idTokenHandlers removeObjectForKey:firebaseApp.name];
  }
}

RCT_EXPORT_METHOD(configureAuthDomain : (FIRApp *)firebaseApp) {
  NSString *authDomain = [RNFBAppModule getCustomDomain:firebaseApp.name];
  DLog(@"RNFBAuth app: %@ customAuthDomain: %@", firebaseApp.name, authDomain);
  if (authDomain != nil) {
    [FIRAuth authWithApp:firebaseApp].customAuthDomain = authDomain;
  }
}

RCT_EXPORT_METHOD(getCustomAuthDomain
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  resolve([FIRAuth authWithApp:firebaseApp].customAuthDomain);
}

RCT_EXPORT_METHOD(setAppVerificationDisabledForTesting : (FIRApp *)firebaseApp : (BOOL)disabled) {
  [FIRAuth authWithApp:firebaseApp].settings.appVerificationDisabledForTesting = disabled;
}

RCT_EXPORT_METHOD(useUserAccessGroup
                  : (FIRApp *)firebaseApp
                  : (NSString *)userAccessGroup
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSError *error;
  [[FIRAuth authWithApp:firebaseApp] useUserAccessGroup:userAccessGroup error:&error];

  if (!error) {
    [self promiseNoUser:resolve rejecter:reject isError:NO];
  } else {
    [self promiseRejectAuthException:reject error:error];
  }
  return;
}

RCT_EXPORT_METHOD(signOut
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    NSError *error;
    [[FIRAuth authWithApp:firebaseApp] signOut:&error];
    if (!error) {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    } else {
      [self promiseRejectAuthException:reject error:error];
    }
    return;
  }

  [self promiseNoUser:resolve rejecter:reject isError:YES];
}

RCT_EXPORT_METHOD(signInAnonymously
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      signInAnonymouslyWithCompletion:^(FIRAuthDataResult *authResult, NSError *error) {
        if (error) {
          [self promiseRejectAuthException:reject error:error];
        } else {
          [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
        }
      }];
}

RCT_EXPORT_METHOD(signInWithEmailAndPassword
                  : (FIRApp *)firebaseApp
                  : (NSString *)email
                  : (NSString *)password
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      signInWithEmail:email
             password:password
           completion:^(FIRAuthDataResult *authResult, NSError *error) {
             if (error) {
               [self promiseRejectAuthException:reject error:error];
             } else {
               [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
             }
           }];
}

RCT_EXPORT_METHOD(isSignInWithEmailLink
                  : (FIRApp *)firebaseApp
                  : (NSString *)emailLink
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  resolve(
      @([RCTConvert BOOL:@([[FIRAuth authWithApp:firebaseApp] isSignInWithEmailLink:emailLink])]));
}

RCT_EXPORT_METHOD(signInWithEmailLink
                  : (FIRApp *)firebaseApp
                  : (NSString *)email
                  : (NSString *)emailLink
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      signInWithEmail:email
                 link:emailLink
           completion:^(FIRAuthDataResult *authResult, NSError *error) {
             if (error) {
               [self promiseRejectAuthException:reject error:error];
             } else {
               [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
             }
           }];
}

RCT_EXPORT_METHOD(createUserWithEmailAndPassword
                  : (FIRApp *)firebaseApp
                  : (NSString *)email
                  : (NSString *)password
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      createUserWithEmail:email
                 password:password
               completion:^(FIRAuthDataResult *authResult, NSError *error) {
                 if (error) {
                   [self promiseRejectAuthException:reject error:error];
                 } else {
                   [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
                 }
               }];
}

RCT_EXPORT_METHOD(delete
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user deleteWithCompletion:^(NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        [self promiseNoUser:resolve rejecter:reject isError:NO];
      }
    }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(reload
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  if (user) {
    [self reloadAndReturnUser:user resolver:resolve rejecter:reject firebaseApp:firebaseApp];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(sendEmailVerification
                  : (FIRApp *)firebaseApp
                  : (NSDictionary *)actionCodeSettings
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  if (user) {
    id handler = ^(NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        FIRUser *userAfterUpdate = [FIRAuth authWithApp:firebaseApp].currentUser;
        [self promiseWithUser:resolve rejecter:reject user:userAfterUpdate];
      }
    };
    if (actionCodeSettings) {
      FIRActionCodeSettings *settings = [self buildActionCodeSettings:actionCodeSettings];
      [user sendEmailVerificationWithActionCodeSettings:settings completion:handler];
    } else {
      [user sendEmailVerificationWithCompletion:handler];
    }
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(verifyBeforeUpdateEmail
                  : (FIRApp *)firebaseApp
                  : (NSString *)email
                  : (NSDictionary *)actionCodeSettings
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  if (user) {
    id handler = ^(NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        FIRUser *userAfterUpdate = [FIRAuth authWithApp:firebaseApp].currentUser;
        [self promiseWithUser:resolve rejecter:reject user:userAfterUpdate];
      }
    };
    if (actionCodeSettings) {
      FIRActionCodeSettings *settings = [self buildActionCodeSettings:actionCodeSettings];
      [user sendEmailVerificationBeforeUpdatingEmail:email
                                  actionCodeSettings:settings
                                          completion:handler];
    } else {
      [user sendEmailVerificationBeforeUpdatingEmail:email completion:handler];
    }
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(updateEmail
                  : (FIRApp *)firebaseApp
                  : (NSString *)email
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user updateEmail:email
           completion:^(NSError *_Nullable error) {
             if (error) {
               [self promiseRejectAuthException:reject error:error];
             } else {
               [self reloadAndReturnUser:user
                                resolver:resolve
                                rejecter:reject
                             firebaseApp:firebaseApp];
             }
           }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(updatePassword
                  : (FIRApp *)firebaseApp
                  : (NSString *)password
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user updatePassword:password
              completion:^(NSError *_Nullable error) {
                if (error) {
                  [self promiseRejectAuthException:reject error:error];
                } else {
                  FIRUser *userAfterUpdate = [FIRAuth authWithApp:firebaseApp].currentUser;
                  [self promiseWithUser:resolve rejecter:reject user:userAfterUpdate];
                }
              }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

#if TARGET_OS_IOS
RCT_EXPORT_METHOD(updatePhoneNumber
                  : (FIRApp *)firebaseApp
                  : (NSString *)provider
                  : (NSString *)authToken
                  : (NSString *)authSecret
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    FIRPhoneAuthCredential *credential =
        (FIRPhoneAuthCredential *)[self getCredentialForProvider:provider
                                                           token:authToken
                                                          secret:authSecret
                                                     firebaseApp:firebaseApp];

    if (credential == nil) {
      [RNFBSharedUtils
          rejectPromiseWithUserInfo:reject
                           userInfo:(NSMutableDictionary *)@{
                             @"code" : @"invalid-credential",
                             @"message" : @"The supplied auth credential is malformed, has expired "
                                          @"or is not currently supported.",
                           }];
    }

    [user updatePhoneNumberCredential:credential
                           completion:^(NSError *_Nullable error) {
                             if (error) {
                               [self promiseRejectAuthException:reject error:error];
                             } else {
                               FIRUser *userAfterUpdate =
                                   [FIRAuth authWithApp:firebaseApp].currentUser;
                               [self promiseWithUser:resolve rejecter:reject user:userAfterUpdate];
                             }
                           }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}
#endif

RCT_EXPORT_METHOD(updateProfile
                  : (FIRApp *)firebaseApp
                  : (NSDictionary *)props
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    FIRUserProfileChangeRequest *changeRequest = [user profileChangeRequest];
    NSMutableArray *allKeys = [[props allKeys] mutableCopy];

    for (NSString *key in allKeys) {
      @try {
        if ([key isEqualToString:keyPhotoUrl]) {
          NSURL *url = [NSURL URLWithString:[props valueForKey:key]];
          [changeRequest setValue:url forKey:key];
        } else {
          [changeRequest setValue:props[key] forKey:key];
        }
      } @catch (NSException *exception) {
        DLog(@"Exception occurred while configuring: %@", exception);
      }
    }

    [changeRequest commitChangesWithCompletion:^(NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        [self reloadAndReturnUser:user resolver:resolve rejecter:reject firebaseApp:firebaseApp];
      }
    }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(getIdToken
                  : (FIRApp *)firebaseApp
                  : (BOOL)forceRefresh
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user getIDTokenForcingRefresh:(BOOL)forceRefresh
                        completion:^(NSString *token, NSError *_Nullable error) {
                          if (error) {
                            [self promiseRejectAuthException:reject error:error];
                          } else {
                            resolve(token);
                          }
                        }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(getIdTokenResult
                  : (FIRApp *)firebaseApp
                  : (BOOL)forceRefresh
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user
        getIDTokenResultForcingRefresh:(BOOL)forceRefresh
                            completion:^(FIRAuthTokenResult *_Nullable tokenResult,
                                         NSError *_Nullable error) {
                              if (error) {
                                [self promiseRejectAuthException:reject error:error];
                              } else {
                                NSMutableDictionary *tokenResultDict =
                                    [NSMutableDictionary dictionary];
                                [tokenResultDict
                                    setValue:[RNFBSharedUtils getISO8601String:tokenResult.authDate]
                                      forKey:@"authTime"];
                                [tokenResultDict
                                    setValue:[RNFBSharedUtils
                                                 getISO8601String:tokenResult.issuedAtDate]
                                      forKey:@"issuedAtTime"];
                                [tokenResultDict
                                    setValue:[RNFBSharedUtils
                                                 getISO8601String:tokenResult.expirationDate]
                                      forKey:@"expirationTime"];

                                [tokenResultDict setValue:tokenResult.token forKey:@"token"];
                                [tokenResultDict setValue:tokenResult.claims forKey:@"claims"];

                                NSString *provider = tokenResult.signInProvider;
                                if (!provider) {
                                  provider = tokenResult.claims[@"firebase"][@"sign_in_provider"];
                                }

                                [tokenResultDict setValue:provider forKey:@"signInProvider"];
                                resolve(tokenResultDict);
                              }
                            }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(signInWithCredential
                  : (FIRApp *)firebaseApp
                  : (NSString *)provider
                  : (NSString *)authToken
                  : (NSString *)authSecret
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRAuthCredential *credential = [self getCredentialForProvider:provider
                                                           token:authToken
                                                          secret:authSecret
                                                     firebaseApp:firebaseApp];
  if (credential == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"invalid-credential",
                                        @"message" : @"The supplied auth credential is malformed, "
                                                     @"has expired or is not currently supported.",
                                      }];
  }
  DLog(@"using app SignInWithCredential: %@", firebaseApp.name);

  [[FIRAuth authWithApp:firebaseApp]
      signInWithCredential:credential
                completion:^(FIRAuthDataResult *authResult, NSError *error) {
                  if (error) {
                    [self promiseRejectAuthException:reject error:error];
                  } else {
                    [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
                  }
                }];
}

RCT_EXPORT_METHOD(signInWithProvider
                  : (FIRApp *)firebaseApp
                  : (NSDictionary *)provider
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSString *providerId = provider[@"providerId"];
  if (providerId == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"invalid-credential",
                                        @"message" : @"The supplied auth credential is malformed, "
                                                     @"has expired or is not currently supported.",
                                      }];
  }

  __block FIROAuthProvider *builder =
      [FIROAuthProvider providerWithProviderID:providerId auth:[FIRAuth authWithApp:firebaseApp]];
  // Add scopes if present
  if (provider[@"scopes"]) {
    [builder setScopes:provider[@"scopes"]];
  }
  // Add custom parameters if present
  if (provider[@"customParameters"]) {
    [builder setCustomParameters:provider[@"customParameters"]];
  }

#if TARGET_OS_IOS
  [builder getCredentialWithUIDelegate:nil
                            completion:^(FIRAuthCredential *_Nullable credential,
                                         NSError *_Nullable error) {
                              if (error) {
                                [self promiseRejectAuthException:reject error:error];
                                return;
                              }
                              if (credential) {
                                [[FIRAuth authWithApp:firebaseApp]
                                    signInWithCredential:credential
                                              completion:^(FIRAuthDataResult *_Nullable authResult,
                                                           NSError *_Nullable error) {
                                                if (error) {
                                                  [self promiseRejectAuthException:reject
                                                                             error:error];
                                                  return;
                                                }

                                                // NOTE: This variable has NO PURPOSE AT ALL, it is
                                                // only to keep a strong reference to the builder
                                                // variable so it is not deallocated prematurely by
                                                // ARC.
                                                NSString *providerID = builder.providerID;

                                                [self promiseWithAuthResult:resolve
                                                                   rejecter:reject
                                                                 authResult:authResult];
                                              }];
                              }
                            }];
#endif
}

RCT_EXPORT_METHOD(confirmPasswordReset
                  : (FIRApp *)firebaseApp
                  : (NSString *)code
                  : (NSString *)newPassword
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      confirmPasswordResetWithCode:code
                       newPassword:newPassword
                        completion:^(NSError *_Nullable error) {
                          if (error) {
                            [self promiseRejectAuthException:reject error:error];
                          } else {
                            [self promiseNoUser:resolve rejecter:reject isError:NO];
                          }
                        }];
}

RCT_EXPORT_METHOD(applyActionCode
                  : (FIRApp *)firebaseApp
                  : (NSString *)code
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      applyActionCode:code
           completion:^(NSError *_Nullable error) {
             if (error) {
               [self promiseRejectAuthException:reject error:error];
             } else {
               [self promiseWithUser:resolve
                            rejecter:reject
                                user:[FIRAuth authWithApp:firebaseApp].currentUser];
             }
           }];
}

RCT_EXPORT_METHOD(checkActionCode
                  : (FIRApp *)firebaseApp
                  : (NSString *)code
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      checkActionCode:code
           completion:^(FIRActionCodeInfo *_Nullable info, NSError *_Nullable error) {
             if (error) {
               [self promiseRejectAuthException:reject error:error];
             } else {
               NSString *actionType = @"ERROR";
               switch (info.operation) {
                 case FIRActionCodeOperationPasswordReset:
                   actionType = @"PASSWORD_RESET";
                   break;
                 case FIRActionCodeOperationVerifyEmail:
                   actionType = @"VERIFY_EMAIL";
                   break;
                 case FIRActionCodeOperationUnknown:
                   actionType = @"UNKNOWN";
                   break;
                 case FIRActionCodeOperationRecoverEmail:
                   actionType = @"RECOVER_EMAIL";
                   break;
                 case FIRActionCodeOperationEmailLink:
                   actionType = @"EMAIL_SIGNIN";
                   break;
                 case FIRActionCodeOperationVerifyAndChangeEmail:
                 case FIRActionCodeOperationRevertSecondFactorAddition:
                 default:
                   actionType = @"ERROR";
                   break;
               }

               NSMutableDictionary *data = [NSMutableDictionary dictionary];

               if (info.email != nil) {
                 [data setValue:info.email forKey:keyEmail];
               } else {
                 [data setValue:[NSNull null] forKey:keyEmail];
               }

               if (info.previousEmail != nil) {
                 [data setValue:info.previousEmail forKey:@"fromEmail"];
               } else {
                 [data setValue:[NSNull null] forKey:@"fromEmail"];
               }

               NSDictionary *result = @{@"data" : data, @"operation" : actionType};

               resolve(result);
             }
           }];
}

RCT_EXPORT_METHOD(revokeToken
                  : (FIRApp *)firebaseApp
                  : (NSString *)authorizationCode
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      revokeTokenWithAuthorizationCode:authorizationCode
                            completion:^(NSError *_Nullable error) {
                              if (error) {
                                [self promiseRejectAuthException:reject error:error];
                              } else {
                                [self promiseNoUser:resolve rejecter:reject isError:NO];
                              }
                            }];
}

RCT_EXPORT_METHOD(sendPasswordResetEmail
                  : (FIRApp *)firebaseApp
                  : (NSString *)email
                  : (NSDictionary *)actionCodeSettings
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  id handler = ^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    }
  };

  if (actionCodeSettings) {
    FIRActionCodeSettings *settings = [self buildActionCodeSettings:actionCodeSettings];
    [[FIRAuth authWithApp:firebaseApp] sendPasswordResetWithEmail:email
                                               actionCodeSettings:settings
                                                       completion:handler];
  } else {
    [[FIRAuth authWithApp:firebaseApp] sendPasswordResetWithEmail:email completion:handler];
  }
}

RCT_EXPORT_METHOD(sendSignInLinkToEmail
                  : (FIRApp *)firebaseApp
                  : (NSString *)email
                  : (NSDictionary *)actionCodeSettings
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  id handler = ^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    }
  };

  FIRActionCodeSettings *settings = [self buildActionCodeSettings:actionCodeSettings];
  [[FIRAuth authWithApp:firebaseApp] sendSignInLinkToEmail:email
                                        actionCodeSettings:settings
                                                completion:handler];
}

RCT_EXPORT_METHOD(signInWithCustomToken
                  : (FIRApp *)firebaseApp
                  : (NSString *)customToken
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      signInWithCustomToken:customToken
                 completion:^(FIRAuthDataResult *authResult, NSError *error) {
                   if (error) {
                     [self promiseRejectAuthException:reject error:error];
                   } else {
                     [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
                   }
                 }];
}

#if TARGET_OS_IOS
RCT_EXPORT_METHOD(signInWithPhoneNumber
                  : (FIRApp *)firebaseApp
                  : (NSString *)phoneNumber
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"SignInWthPhoneNumber instance: %@", firebaseApp.name);

  [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]]
      verifyPhoneNumber:phoneNumber
             UIDelegate:nil
             completion:^(NSString *_Nullable verificationID, NSError *_Nullable error) {
               if (error) {
                 [self promiseRejectAuthException:reject error:error];
               } else {
                 NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
                 [defaults setObject:verificationID forKey:@"authVerificationID"];
                 resolve(@{@"verificationId" : verificationID});
               }
             }];
}
RCT_EXPORT_METHOD(verifyPhoneNumberWithMultiFactorInfo
                  : (FIRApp *)firebaseApp
                  : (NSString *)hintUid
                  : (NSString *)sessionKey
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  if ([cachedResolver valueForKey:sessionKey] == nil) {
    [RNFBSharedUtils
        rejectPromiseWithUserInfo:reject
                         userInfo:(NSMutableDictionary *)@{
                           @"code" : @"invalid-multi-factor-session",
                           @"message" : @"No resolver for session found. Is the session id correct?"
                         }];
    return;
  }
  FIRMultiFactorSession *session = cachedResolver[sessionKey].session;
  NSPredicate *findByUid = [NSPredicate predicateWithFormat:@"UID == %@", hintUid];
  FIRMultiFactorInfo *_Nullable hint =
      [[cachedResolver[sessionKey].hints filteredArrayUsingPredicate:findByUid] firstObject];
  if (hint == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"multi-factor-info-not-found",
                                        @"message" : @"The user does not have a second factor "
                                                     @"matching the identifier provided."
                                      }];
    return;
  }
  DLog(@"using instance verifyPhoneNumberWithMultiFactorInfo: %@", firebaseApp.name);

  [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]]
      verifyPhoneNumberWithMultiFactorInfo:hint
                                UIDelegate:nil
                        multiFactorSession:session
                                completion:^(NSString *_Nullable verificationID,
                                             NSError *_Nullable error) {
                                  if (error) {
                                    [self promiseRejectAuthException:reject error:error];
                                  } else {
                                    DLog(@"verificationID: %@", verificationID)
                                        resolve(verificationID);
                                  }
                                }];
}

RCT_EXPORT_METHOD(verifyPhoneNumberForMultiFactor
                  : (FIRApp *)firebaseApp
                  : (NSString *)phoneNumber
                  : (NSString *)sessionId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"verifyPhoneNumberForMultifactor using app: %@", firebaseApp.name);
  DLog(@"verifyPhoneNumberForMultifactor phoneNumber: %@", phoneNumber);
  DLog(@"verifyPhoneNumberForMultifactor sessionId: %@", sessionId);
  FIRMultiFactorSession *session = cachedSessions[sessionId];
  if (session == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"invalid-multi-factor-session",
                                        @"message" : @"can't find session for provided key"
                                      }];
    return;
  }
  [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]]
       verifyPhoneNumber:phoneNumber
              UIDelegate:nil
      multiFactorSession:session
              completion:^(NSString *_Nullable verificationID, NSError *_Nullable error) {
                if (error != nil) {
                  [self promiseRejectAuthException:reject error:error];
                  return;
                }

                resolve(verificationID);
              }];
}

RCT_EXPORT_METHOD(resolveMultiFactorSignIn
                  : (FIRApp *)firebaseApp
                  : (NSString *)sessionKey
                  : (NSString *)verificationId
                  : (NSString *)verificationCode
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"using instance resolve MultiFactorSignIn: %@", firebaseApp.name);

  FIRPhoneAuthCredential *credential =
      [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]]
          credentialWithVerificationID:verificationId
                      verificationCode:verificationCode];
  DLog(@"credential: %@", credential);

  FIRMultiFactorAssertion *assertion =
      [FIRPhoneMultiFactorGenerator assertionWithCredential:credential];

  [cachedResolver[sessionKey] resolveSignInWithAssertion:assertion
                                              completion:^(FIRAuthDataResult *_Nullable authResult,
                                                           NSError *_Nullable error) {
                                                DLog(@"authError: %@", error) if (error) {
                                                  [self promiseRejectAuthException:reject
                                                                             error:error];
                                                }
                                                else {
                                                  [self promiseWithAuthResult:resolve
                                                                     rejecter:reject
                                                                   authResult:authResult];
                                                }
                                              }];
}

RCT_EXPORT_METHOD(resolveTotpSignIn
                  : (FIRApp *)firebaseApp
                  : (NSString *)sessionKey
                  : (NSString *)uid
                  : (NSString *)oneTimePassword
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"using instance resolve TotpSignIn: %@", firebaseApp.name);

  FIRMultiFactorAssertion *assertion =
      [FIRTOTPMultiFactorGenerator assertionForSignInWithEnrollmentID:uid
                                                      oneTimePassword:oneTimePassword];
  [cachedResolver[sessionKey] resolveSignInWithAssertion:assertion
                                              completion:^(FIRAuthDataResult *_Nullable authResult,
                                                           NSError *_Nullable error) {
                                                DLog(@"authError: %@", error) if (error) {
                                                  [self promiseRejectAuthException:reject
                                                                             error:error];
                                                }
                                                else {
                                                  [self promiseWithAuthResult:resolve
                                                                     rejecter:reject
                                                                   authResult:authResult];
                                                }
                                              }];
}

RCT_EXPORT_METHOD(generateTotpSecret
                  : (FIRApp *)firebaseApp
                  : (NSString *)sessionKey
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"using instance resolve generateTotpSecret: %@", firebaseApp.name);

  FIRMultiFactorSession *session = cachedSessions[sessionKey];
  DLog(@"using sessionKey: %@", sessionKey);
  DLog(@"using session: %@", session);
  [FIRTOTPMultiFactorGenerator
      generateSecretWithMultiFactorSession:session
                                completion:^(FIRTOTPSecret *_Nullable totpSecret,
                                             NSError *_Nullable error) {
                                  DLog(@"authError: %@", error) if (error) {
                                    [self promiseRejectAuthException:reject error:error];
                                  }
                                  else {
                                    NSString *secretKey = totpSecret.sharedSecretKey;
                                    DLog(@"secretKey generated: %@", secretKey);
                                    cachedTotpSecrets[secretKey] = totpSecret;
                                    DLog(@"cachedSecret: %@", cachedTotpSecrets[secretKey]);
                                    resolve(@{
                                      @"secretKey" : secretKey,
                                    });
                                  }
                                }];
}

RCT_EXPORT_METHOD(generateQrCodeUrl
                  : (FIRApp *)firebaseApp
                  : (NSString *)secretKey
                  : (NSString *)accountName
                  : (NSString *)issuer
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"generateQrCodeUrl using instance resolve generateQrCodeUrl: %@", firebaseApp.name);
  DLog(@"generateQrCodeUrl using secretKey: %@", secretKey);
  FIRTOTPSecret *totpSecret = cachedTotpSecrets[secretKey];
  NSString *url = [totpSecret generateQRCodeURLWithAccountName:accountName issuer:issuer];
  DLog(@"generateQrCodeUrl got QR Code URL %@", url);
  resolve(url);
}

RCT_EXPORT_METHOD(openInOtpApp
                  : (FIRApp *)firebaseApp
                  : (NSString *)secretKey
                  : (NSString *)qrCodeUri) {
  DLog(@"generateQrCodeUrl using secretKey: %@", secretKey);
  FIRTOTPSecret *totpSecret = cachedTotpSecrets[secretKey];
  DLog(@"openInOtpApp using qrCodeUri: %@", qrCodeUri);
  [totpSecret openInOTPAppWithQRCodeURL:qrCodeUri];
}

RCT_EXPORT_METHOD(getSession
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  [[user multiFactor] getSessionWithCompletion:^(FIRMultiFactorSession *_Nullable session,
                                                 NSError *_Nullable error) {
    if (error != nil) {
      [self promiseRejectAuthException:reject error:error];
      return;
    }

    NSString *sessionId = [NSString stringWithFormat:@"%@", @([session hash])];
    cachedSessions[sessionId] = session;
    resolve(sessionId);
  }];
}

RCT_EXPORT_METHOD(unenrollMultiFactor
                  : (FIRApp *)firebaseApp
                  : (NSString *)factorUID
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"using instance unenrollMultiFactor: %@", firebaseApp.name);

  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  [user.multiFactor unenrollWithFactorUID:factorUID
                               completion:^(NSError *_Nullable error) {
                                 if (error != nil) {
                                   [self promiseRejectAuthException:reject error:error];
                                   return;
                                 }

                                 resolve(nil);
                                 return;
                               }];
}

RCT_EXPORT_METHOD(finalizeMultiFactorEnrollment
                  : (FIRApp *)firebaseApp
                  : (NSString *)verificationId
                  : (NSString *)verificationCode
                  : (NSString *_Nullable)displayName
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"using instance finalizeMultifactorEnrollment: %@", firebaseApp.name);

  FIRPhoneAuthCredential *credential =
      [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]]
          credentialWithVerificationID:verificationId
                      verificationCode:verificationCode];
  FIRMultiFactorAssertion *assertion =
      [FIRPhoneMultiFactorGenerator assertionWithCredential:credential];
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  [user.multiFactor enrollWithAssertion:assertion
                            displayName:displayName
                             completion:^(NSError *_Nullable error) {
                               if (error != nil) {
                                 [self promiseRejectAuthException:reject error:error];
                                 return;
                               }

                               resolve(nil);
                               return;
                             }];
}

RCT_EXPORT_METHOD(finalizeTotpEnrollment
                  : (FIRApp *)firebaseApp
                  : (NSString *)totpSecret
                  : (NSString *)verificationCode
                  : (NSString *_Nullable)displayName
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"using instance finalizeTotpEnrollment: %@", firebaseApp.name);

  FIRTOTPSecret *cachedTotpSecret = cachedTotpSecrets[totpSecret];
  DLog(@"using totpSecretKey: %@", totpSecret);
  DLog(@"using cachedSecret: %@", cachedTotpSecret);
  FIRTOTPMultiFactorAssertion *assertion =
      [FIRTOTPMultiFactorGenerator assertionForEnrollmentWithSecret:cachedTotpSecret
                                                    oneTimePassword:verificationCode];

  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  [user.multiFactor enrollWithAssertion:assertion
                            displayName:displayName
                             completion:^(NSError *_Nullable error) {
                               if (error != nil) {
                                 [self promiseRejectAuthException:reject error:error];
                                 return;
                               }

                               resolve(nil);
                               return;
                             }];
}

RCT_EXPORT_METHOD(verifyPhoneNumber
                  : (FIRApp *)firebaseApp
                  : (NSString *)phoneNumber
                  : (NSString *)requestKey) {
  DLog(@"using instance verifyPhoneNumber: %@", firebaseApp.name);

  [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]]
      verifyPhoneNumber:phoneNumber
             UIDelegate:nil
             completion:^(NSString *_Nullable verificationID, NSError *_Nullable error) {
               if (error) {
                 NSDictionary *jsError = [self getJSError:error];
                 NSDictionary *body = @{
                   @"type" : @"onVerificationFailed",
                   @"requestKey" : requestKey,
                   @"state" : @{@"error" : jsError},
                 };
                 [RNFBSharedUtils sendJSEventForApp:firebaseApp
                                               name:PHONE_AUTH_STATE_CHANGED_EVENT
                                               body:body];
               } else {
                 NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
                 [defaults setObject:verificationID forKey:@"authVerificationID"];
                 NSDictionary *body = @{
                   @"type" : @"onCodeSent",
                   @"requestKey" : requestKey,
                   @"state" : @{@"verificationId" : verificationID},
                 };
                 [RNFBSharedUtils sendJSEventForApp:firebaseApp
                                               name:PHONE_AUTH_STATE_CHANGED_EVENT
                                               body:body];
               }
             }];
}

RCT_EXPORT_METHOD(confirmationResultConfirm
                  : (FIRApp *)firebaseApp
                  : (NSString *)verificationCode
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  NSString *verificationId = [defaults stringForKey:@"authVerificationID"];

  FIRAuthCredential *credential =
      [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]]
          credentialWithVerificationID:verificationId
                      verificationCode:verificationCode];

  [[FIRAuth authWithApp:firebaseApp]
      signInWithCredential:credential
                completion:^(FIRAuthDataResult *authResult, NSError *error) {
                  DLog(@"auth error: %long", (long)error.code);
                  if (error) {
                    [self promiseRejectAuthException:reject error:error];
                  } else {
                    [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
                  }
                }];
}
#endif

RCT_EXPORT_METHOD(linkWithCredential
                  : (FIRApp *)firebaseApp
                  : (NSString *)provider
                  : (NSString *)authToken
                  : (NSString *)authSecret
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRAuthCredential *credential = [self getCredentialForProvider:provider
                                                           token:authToken
                                                          secret:authSecret
                                                     firebaseApp:firebaseApp];

  if (credential == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"invalid-credential",
                                        @"message" : @"The supplied auth credential is malformed, "
                                                     @"has expired or is not currently supported.",
                                      }];
  }

  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  if (user) {
    [user linkWithCredential:credential
                  completion:^(FIRAuthDataResult *_Nullable authResult, NSError *_Nullable error) {
                    if (error) {
                      [self promiseRejectAuthException:reject error:error];
                    } else {
                      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
                    }
                  }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(linkWithProvider
                  : (FIRApp *)firebaseApp
                  : (NSDictionary *)provider
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSString *providerId = provider[@"providerId"];
  if (providerId == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"invalid-credential",
                                        @"message" : @"The supplied auth credential is malformed, "
                                                     @"has expired or is not currently supported.",
                                      }];
  }

  __block FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  if (user == nil) {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
    return;
  }

  __block FIROAuthProvider *builder =
      [FIROAuthProvider providerWithProviderID:providerId auth:[FIRAuth authWithApp:firebaseApp]];
  // Add scopes if present
  if (provider[@"scopes"]) {
    [builder setScopes:provider[@"scopes"]];
  }
  // Add custom parameters if present
  if (provider[@"parameters"]) {
    [builder setCustomParameters:provider[@"parameters"]];
  }

#if TARGET_OS_IOS
  [builder getCredentialWithUIDelegate:nil
                            completion:^(FIRAuthCredential *_Nullable credential,
                                         NSError *_Nullable error) {
                              if (error) {
                                [self promiseRejectAuthException:reject error:error];
                                return;
                              }
                              if (credential) {
                                [user linkWithCredential:credential
                                              completion:^(FIRAuthDataResult *_Nullable authResult,
                                                           NSError *_Nullable error) {
                                                if (error) {
                                                  [self promiseRejectAuthException:reject
                                                                             error:error];
                                                  return;
                                                }

                                                // NOTE: This variable has NO PURPOSE AT ALL, it is
                                                // only to keep a strong reference to the builder
                                                // variable so it is not deallocated prematurely by
                                                // ARC.
                                                NSString *providerID = builder.providerID;

                                                [self promiseWithAuthResult:resolve
                                                                   rejecter:reject
                                                                 authResult:authResult];
                                              }];
                              }
                            }];
#endif
}

RCT_EXPORT_METHOD(unlink
                  : (FIRApp *)firebaseApp
                  : (NSString *)providerId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user unlinkFromProvider:providerId
                  completion:^(FIRUser *_Nullable _user, NSError *_Nullable error) {
                    if (error) {
                      [self promiseRejectAuthException:reject error:error];
                    } else {
                      [self reloadAndReturnUser:user
                                       resolver:resolve
                                       rejecter:reject
                                    firebaseApp:firebaseApp];
                    }
                  }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(reauthenticateWithCredential
                  : (FIRApp *)firebaseApp
                  : (NSString *)provider
                  : (NSString *)authToken
                  : (NSString *)authSecret
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRAuthCredential *credential = [self getCredentialForProvider:provider
                                                           token:authToken
                                                          secret:authSecret
                                                     firebaseApp:firebaseApp];

  if (credential == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"invalid-credential",
                                        @"message" : @"The supplied auth credential is malformed, "
                                                     @"has expired or is not currently supported.",
                                      }];
  }

  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user reauthenticateWithCredential:credential
                            completion:^(FIRAuthDataResult *_Nullable authResult,
                                         NSError *_Nullable error) {
                              if (error) {
                                [self promiseRejectAuthException:reject error:error];
                              } else {
                                [self promiseWithAuthResult:resolve
                                                   rejecter:reject
                                                 authResult:authResult];
                              }
                            }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(reauthenticateWithProvider
                  : (FIRApp *)firebaseApp
                  : (NSDictionary *)provider
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  NSString *providerId = provider[@"providerId"];
  if (providerId == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"invalid-credential",
                                        @"message" : @"The supplied auth credential is malformed, "
                                                     @"has expired or is not currently supported.",
                                      }];
  }

  __block FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  if (user == nil) {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
    return;
  }

  __block FIROAuthProvider *builder =
      [FIROAuthProvider providerWithProviderID:providerId auth:[FIRAuth authWithApp:firebaseApp]];
  // Add scopes if present
  if (provider[@"scopes"]) {
    [builder setScopes:provider[@"scopes"]];
  }
  // Add custom parameters if present
  if (provider[@"parameters"]) {
    [builder setCustomParameters:provider[@"parameters"]];
  }
#if TARGET_OS_IOS
  [builder getCredentialWithUIDelegate:nil
                            completion:^(FIRAuthCredential *_Nullable credential,
                                         NSError *_Nullable error) {
                              if (error) {
                                [self promiseRejectAuthException:reject error:error];
                                return;
                              }
                              if (credential) {
                                [user reauthenticateWithCredential:credential
                                                        completion:^(
                                                            FIRAuthDataResult *_Nullable authResult,
                                                            NSError *_Nullable error) {
                                                          if (error) {
                                                            [self promiseRejectAuthException:reject
                                                                                       error:error];
                                                            return;
                                                          }

                                                          // NOTE: This variable has NO PURPOSE AT
                                                          // ALL, it is only to keep a strong
                                                          // reference to the builder variable so it
                                                          // is not deallocated prematurely by ARC.
                                                          NSString *providerID = builder.providerID;

                                                          [self promiseWithAuthResult:resolve
                                                                             rejecter:reject
                                                                           authResult:authResult];
                                                        }];
                              }
                            }];
#endif
}

RCT_EXPORT_METHOD(fetchSignInMethodsForEmail
                  : (FIRApp *)firebaseApp
                  : (NSString *)email
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      fetchSignInMethodsForEmail:email
                      completion:^(NSArray<NSString *> *_Nullable providers,
                                   NSError *_Nullable error) {
                        if (error) {
                          [self promiseRejectAuthException:reject error:error];
                        } else if (!providers) {
                          NSMutableArray *emptyResponse = [[NSMutableArray alloc] init];
                          resolve(emptyResponse);
                        } else {
                          resolve(providers);
                        }
                      }];
}

RCT_EXPORT_METHOD(setLanguageCode : (FIRApp *)firebaseApp : (NSString *)code) {
  if (code) {
    [FIRAuth authWithApp:firebaseApp].languageCode = code;
  } else {
    [[FIRAuth authWithApp:firebaseApp] useAppLanguage];
  }
}

RCT_EXPORT_METHOD(setTenantId : (FIRApp *)firebaseApp : (NSString *)tenantID) {
  [FIRAuth authWithApp:firebaseApp].tenantID = tenantID;
}

RCT_EXPORT_METHOD(useDeviceLanguage : (FIRApp *)firebaseApp) {
  [[FIRAuth authWithApp:firebaseApp] useAppLanguage];
}

RCT_EXPORT_METHOD(verifyPasswordResetCode
                  : (FIRApp *)firebaseApp
                  : (NSString *)code
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRAuth authWithApp:firebaseApp]
      verifyPasswordResetCode:code
                   completion:^(NSString *_Nullable email, NSError *_Nullable error) {
                     if (error) {
                       [self promiseRejectAuthException:reject error:error];
                     } else {
                       resolve(email);
                     }
                   }];
}

RCT_EXPORT_METHOD(useEmulator
                  : (FIRApp *)firebaseApp
                  : (nonnull NSString *)host
                  : (NSInteger)port) {
  if (!emulatorConfigs[firebaseApp.name]) {
    [[FIRAuth authWithApp:firebaseApp] useEmulatorWithHost:host port:port];
    emulatorConfigs[firebaseApp.name] = @YES;
  }
}

- (FIRAuthCredential *)getCredentialForProvider:(NSString *)provider
                                          token:(NSString *)authToken
                                         secret:(NSString *)authTokenSecret
                                    firebaseApp:(FIRApp *)firebaseApp {
  FIRAuthCredential *credential;

  // First check if we cached an authToken
  if (credentials[authToken] != nil && ![credentials[authToken] isEqual:[NSNull null]]) {
    credential = credentials[authToken];
  } else if ([provider compare:@"twitter.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIRTwitterAuthProvider credentialWithToken:authToken secret:authTokenSecret];
  } else if ([provider compare:@"facebook.com" options:NSCaseInsensitiveSearch] == NSOrderedSame &&
             ![authTokenSecret isEqualToString:@""]) {
    credential = [FIROAuthProvider credentialWithProviderID:provider
                                                    IDToken:authToken
                                                   rawNonce:authTokenSecret];
  } else if ([provider compare:@"facebook.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIRFacebookAuthProvider credentialWithAccessToken:authToken];
  } else if ([provider compare:@"google.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIRGoogleAuthProvider credentialWithIDToken:authToken
                                                  accessToken:authTokenSecret];
  } else if ([provider compare:@"apple.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIROAuthProvider credentialWithProviderID:provider
                                                    IDToken:authToken
                                                   rawNonce:authTokenSecret];
  } else if ([provider compare:@"password" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIREmailAuthProvider credentialWithEmail:authToken password:authTokenSecret];
  } else if ([provider compare:@"emailLink" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIREmailAuthProvider credentialWithEmail:authToken link:authTokenSecret];
  } else if ([provider compare:@"github.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIRGitHubAuthProvider credentialWithToken:authToken];
  } else if ([provider compare:@"phone" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
#if TARGET_OS_IOS
    DLog(@"using app credGen: %@", firebaseApp.name) credential =
        [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]]
            credentialWithVerificationID:authToken
                        verificationCode:authTokenSecret];
#endif
  } else if ([provider compare:@"oauth" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIROAuthProvider credentialWithProviderID:@"oauth"
                                                    IDToken:authToken
                                                accessToken:authTokenSecret];
  } else if ([provider hasPrefix:@"oidc."]) {
    credential = [FIROAuthProvider credentialWithProviderID:provider
                                                    IDToken:authToken
                                                   rawNonce:nil];
  } else {
    DLog(@"Provider not yet handled: %@", provider);
  }

  return credential;
}

// This is here to protect against bugs in the iOS SDK which don't
// correctly refresh the user object when performing certain operations
- (void)reloadAndReturnUser:(FIRUser *)user
                   resolver:(RCTPromiseResolveBlock)resolve
                   rejecter:(RCTPromiseRejectBlock)reject
                firebaseApp:(FIRApp *)firebaseApp {
  [user reloadWithCompletion:^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithUser:resolve rejecter:reject user:user];
    }
  }];
}

- (void)promiseNoUser:(RCTPromiseResolveBlock)resolve
             rejecter:(RCTPromiseRejectBlock)reject
              isError:(BOOL)isError {
  if (isError) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"no-current-user",
                                        @"message" : @"No user currently signed in.",
                                      }];
  } else {
    resolve([NSNull null]);
  }
}

#if TARGET_OS_IOS
- (NSDictionary *)multiFactorResolverToDict:(FIRMultiFactorResolver *)resolver {
  // Temporarily store the non-serializable session for later
  NSString *sessionHash = [NSString stringWithFormat:@"%@", @([resolver.session hash])];

  return @{
    @"hints" : [self convertMultiFactorData:resolver.hints],
    @"session" : sessionHash,
    @"auth" : resolver.auth
  };
}
#endif

- (void)promiseRejectAuthException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  NSDictionary *jsError = [self getJSError:error];

  [RNFBSharedUtils
      rejectPromiseWithUserInfo:reject
                       userInfo:(NSMutableDictionary *)@{
                         @"code" : [jsError valueForKey:@"code"],
                         @"message" : [jsError valueForKey:@"message"],
                         @"nativeErrorMessage" : [jsError valueForKey:@"nativeErrorMessage"],
                         @"authCredential" : [jsError valueForKey:@"authCredential"],
                         @"resolver" : [jsError valueForKey:@"resolver"]
                       }];
}

- (NSDictionary *)getJSError:(NSError *)error {
  NSString *code = AuthErrorCode_toJSErrorCode[error.code];
  NSString *message = [error localizedDescription];
  NSString *nativeErrorMessage = [error localizedDescription];

  if (code == nil) code = @"unknown";

  // TODO(Salakar): replace these with a AuthErrorCode_toJSErrorMessage map (like codes now does)
  switch (error.code) {
    case FIRAuthErrorCodeInvalidCustomToken:
      message = @"The custom token format is incorrect. Please check the documentation.";
      break;
    case FIRAuthErrorCodeCustomTokenMismatch:
      message = @"The custom token corresponds to a different audience.";
      break;
    case FIRAuthErrorCodeInvalidCredential:
      message = @"The supplied auth credential is malformed or has expired.";
      break;
    case FIRAuthErrorCodeInvalidEmail:
      message = @"The email address is badly formatted.";
      break;
    case FIRAuthErrorCodeWrongPassword:
      message = @"The password is invalid or the user does not have a password.";
      break;
    case FIRAuthErrorCodeUserMismatch:
      message = @"The supplied credentials do not correspond to the previously signed in user.";
      break;
    case FIRAuthErrorCodeRequiresRecentLogin:
      message = @"This operation is sensitive and requires recent authentication. Log in again "
                @"before retrying this request.";
      break;
    case FIRAuthErrorCodeSecondFactorRequired:
      message = @"Please complete a second factor challenge to finish signing into this account.";
      break;
    case FIRAuthErrorCodeAccountExistsWithDifferentCredential:
      message = @"An account already exists with the same email address but different sign-in "
                @"credentials. Sign in using a provider associated with this email address.";
      break;
    case FIRAuthErrorCodeEmailAlreadyInUse:
      message = @"The email address is already in use by another account.";
      break;
    case FIRAuthErrorCodeCredentialAlreadyInUse:
      message = @"This credential is already associated with a different user account.";
      break;
    case FIRAuthErrorCodeUserDisabled:
      message = @"The user account has been disabled by an administrator.";
      break;
    case FIRAuthErrorCodeUserTokenExpired:
      message = @"The user's credential is no longer valid. The user must sign in again.";
      break;
    case FIRAuthErrorCodeUserNotFound:
      message = @"There is no user record corresponding to this identifier. The user may have been "
                @"deleted.";
      break;
    case FIRAuthErrorCodeInvalidUserToken:
      message = @"The user's credential is no longer valid. The user must sign in again.";
      break;
    case FIRAuthErrorCodeWeakPassword:
      message = @"The given password is invalid.";
      break;
    case FIRAuthErrorCodeOperationNotAllowed:
      message = @"This operation is not allowed. You must enable this service in the console.";
      break;
    case FIRAuthErrorCodeNetworkError:
      message = @"A network error has occurred, please try again.";
      break;
    case FIRAuthErrorCodeInternalError:
      message = @"An internal error has occurred, please try again.";
      break;
    case FIRAuthErrorCodeInvalidPhoneNumber:
      message = @"The format of the phone number provided is incorrect. "
                @"Please enter the phone number in a format that can be parsed into E.164 format. "
                @"E.164 phone numbers are written in the format [+][country code][subscriber "
                @"number including area code].";
      break;
    default:
      break;
  }

  NSDictionary *authCredentialDict = nil;
  if ([error userInfo][FIRAuthErrorUserInfoUpdatedCredentialKey] != nil) {
    FIRAuthCredential *authCredential = [error userInfo][FIRAuthErrorUserInfoUpdatedCredentialKey];
    authCredentialDict = [self authCredentialToDict:authCredential];
  }

  NSDictionary *resolverDict = nil;
#if TARGET_OS_IOS
  if ([error userInfo][FIRAuthErrorUserInfoMultiFactorResolverKey] != nil) {
    FIRMultiFactorResolver *resolver = error.userInfo[FIRAuthErrorUserInfoMultiFactorResolverKey];
    resolverDict = [self multiFactorResolverToDict:resolver];

    NSString *sessionKey = [NSString stringWithFormat:@"%@", @([resolver.session hash])];
    cachedResolver[sessionKey] = resolver;
  }
#endif

  return @{
    @"code" : code,
    @"message" : message,
    @"nativeErrorMessage" : nativeErrorMessage,
    @"authCredential" : authCredentialDict != nil ? (id)authCredentialDict : [NSNull null],
    @"resolver" : resolverDict != nil ? (id)resolverDict : [NSNull null]
  };
}

- (void)promiseWithUser:(RCTPromiseResolveBlock)resolve
               rejecter:(RCTPromiseRejectBlock)reject
                   user:(FIRUser *)user {
  if (user) {
    NSDictionary *userDict = [self firebaseUserToDict:user];
    resolve(userDict);
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

- (void)promiseWithAuthResult:(RCTPromiseResolveBlock)resolve
                     rejecter:(RCTPromiseRejectBlock)reject
                   authResult:(FIRAuthDataResult *)authResult {
  if (authResult && authResult.user) {
    NSMutableDictionary *authResultDict = [NSMutableDictionary dictionary];

    if (authResult.additionalUserInfo) {
      NSMutableDictionary *additionalUserInfo = [NSMutableDictionary dictionary];

      [additionalUserInfo setValue:@(authResult.additionalUserInfo.isNewUser) forKey:keyNewUser];

      if (authResult.additionalUserInfo.profile) {
        [additionalUserInfo setValue:authResult.additionalUserInfo.profile forKey:keyProfile];
      } else {
        [additionalUserInfo setValue:[NSNull null] forKey:keyProfile];
      }

      if (authResult.additionalUserInfo.providerID) {
        [additionalUserInfo setValue:authResult.additionalUserInfo.providerID forKey:keyProviderId];
      } else {
        [additionalUserInfo setValue:[NSNull null] forKey:keyProviderId];
      }

      if (authResult.additionalUserInfo.username) {
        [additionalUserInfo setValue:authResult.additionalUserInfo.username forKey:keyUsername];
      } else {
        [additionalUserInfo setValue:[NSNull null] forKey:keyUsername];
      }

      [authResultDict setValue:additionalUserInfo forKey:keyAdditionalUserInfo];
    } else {
      [authResultDict setValue:[NSNull null] forKey:keyAdditionalUserInfo];
    }

    [authResultDict setValue:[self firebaseUserToDict:authResult.user] forKey:keyUser];
    resolve(authResultDict);
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

- (NSArray<NSObject *> *)convertProviderData:(NSArray<id<FIRUserInfo>> *)providerData {
  NSMutableArray *output = [NSMutableArray array];

  for (id<FIRUserInfo> userInfo in providerData) {
    NSMutableDictionary *pData = [NSMutableDictionary dictionary];

    if (userInfo.providerID != nil) {
      [pData setValue:userInfo.providerID forKey:keyProviderId];
    }

    if (userInfo.uid != nil) {
      [pData setValue:userInfo.uid forKey:keyUid];
    }

    if (userInfo.displayName != nil) {
      [pData setValue:userInfo.displayName forKey:keyDisplayName];
    }

    if (userInfo.photoURL != nil) {
      [pData setValue:[userInfo.photoURL absoluteString] forKey:keyPhotoUrl];
    }

    if (userInfo.email != nil) {
      [pData setValue:userInfo.email forKey:keyEmail];
    }

    if (userInfo.phoneNumber != nil) {
      [pData setValue:userInfo.phoneNumber forKey:keyPhoneNumber];
    }

    [output addObject:pData];
  }

  return output;
}

- (NSDictionary *)constantsToExport {
  NSDictionary *firebaseApps = [FIRApp allApps];
  NSMutableDictionary *constants = [NSMutableDictionary new];
  NSMutableDictionary *appLanguage = [NSMutableDictionary new];
  NSMutableDictionary *appUser = [NSMutableDictionary new];

  for (id key in firebaseApps) {
    FIRApp *firebaseApp = firebaseApps[key];
    NSString *appName = firebaseApp.name;
    FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

    if ([appName isEqualToString:@"__FIRAPP_DEFAULT"]) {
      appName = @"[DEFAULT]";
    }

    appLanguage[appName] = [FIRAuth authWithApp:firebaseApp].languageCode;

    if (user != nil) {
      appUser[appName] = [self firebaseUserToDict:user];
    }
  }

  constants[constAppLanguage] = appLanguage;
  constants[constAppUser] = appUser;
  return constants;
}

- (NSDictionary *)firebaseUserToDict:(FIRUser *)user {
  return @{
    keyDisplayName : user.displayName ? (id)user.displayName : [NSNull null],
    keyEmail : user.email ? (id)user.email : [NSNull null],
    @"emailVerified" : @(user.emailVerified),
    @"isAnonymous" : @(user.anonymous),
    @"metadata" : @{
      @"creationTime" : user.metadata.creationDate
          ? (id) @(round([user.metadata.creationDate timeIntervalSince1970] * 1000.0))
          : [NSNull null],
      @"lastSignInTime" : user.metadata.lastSignInDate
          ? (id) @(round([user.metadata.lastSignInDate timeIntervalSince1970] * 1000.0))
          : [NSNull null],
    },
    keyPhoneNumber : user.phoneNumber ? (id)user.phoneNumber : [NSNull null],
    keyPhotoUrl : user.photoURL ? (id)[user.photoURL absoluteString] : [NSNull null],
    @"providerData" : [self convertProviderData:user.providerData],
    keyProviderId : [user.providerID lowercaseString],
    @"refreshToken" : user.refreshToken,
    @"tenantId" : user.tenantID ? (id)user.tenantID : [NSNull null],
    keyUid : user.uid,
#if TARGET_OS_IOS
    @"multiFactor" :
        @{@"enrolledFactors" : [self convertMultiFactorData:user.multiFactor.enrolledFactors]}
#endif
  };
}

#if TARGET_OS_IOS
- (NSArray<NSMutableDictionary *> *)convertMultiFactorData:(NSArray<FIRMultiFactorInfo *> *)hints {
  NSMutableArray *enrolledFactors = [NSMutableArray array];

  for (FIRMultiFactorInfo *hint in hints) {
    NSString *enrollmentTime =
        [[[NSISO8601DateFormatter alloc] init] stringFromDate:hint.enrollmentDate];

    NSMutableDictionary *factorDict = [@{
      @"uid" : hint.UID,
      @"factorId" : hint.factorID,
      @"displayName" : hint.displayName == nil ? [NSNull null] : hint.displayName,
      @"enrollmentTime" : enrollmentTime,
      // @deprecated enrollmentDate kept for backwards compatibility, please use enrollmentTime
      @"enrollmentDate" : enrollmentTime,
    } mutableCopy];

    if ([hint isKindOfClass:[FIRPhoneMultiFactorInfo class]]) {
      FIRPhoneMultiFactorInfo *phoneHint = (FIRPhoneMultiFactorInfo *)hint;
      factorDict[@"phoneNumber"] = phoneHint.phoneNumber;
    }

    [enrolledFactors addObject:factorDict];
  }
  return enrolledFactors;
}
#endif

- (NSDictionary *)authCredentialToDict:(FIRAuthCredential *)authCredential {
  NSString *authCredentialHash = [NSString stringWithFormat:@"%@", @([authCredential hash])];

  // Temporarily store the non-serializable credential for later
  credentials[authCredentialHash] = authCredential;

  return @{
    keyProviderId : authCredential.provider,
    @"token" : authCredentialHash,
    @"secret" : [NSNull null],
  };
}

- (FIRActionCodeSettings *)buildActionCodeSettings:(NSDictionary *)actionCodeSettings {
  FIRActionCodeSettings *settings = [[FIRActionCodeSettings alloc] init];

  NSString *url = actionCodeSettings[keyUrl];
  [settings setURL:[NSURL URLWithString:url]];

  if (actionCodeSettings[keyLinkDomain]) {
    NSString *linkDomain = actionCodeSettings[keyLinkDomain];
    [settings setLinkDomain:linkDomain];
  }

  if (actionCodeSettings[keyHandleCodeInApp]) {
    BOOL handleCodeInApp = [actionCodeSettings[keyHandleCodeInApp] boolValue];
    [settings setHandleCodeInApp:handleCodeInApp];
  }

  if (actionCodeSettings[keyAndroid]) {
    NSDictionary *android = actionCodeSettings[keyAndroid];
    NSString *packageName = android[keyPackageName];
    NSString *minimumVersion = android[keyMinVersion];
    BOOL installApp = [android[keyInstallApp] boolValue];
    [settings setAndroidPackageName:packageName
              installIfNotAvailable:installApp
                     minimumVersion:minimumVersion];
  }

  if (actionCodeSettings[keyIOS]) {
    NSDictionary *ios = actionCodeSettings[keyIOS];
    [settings setIOSBundleID:ios[keyBundleId]];
  }

  return settings;
}

@end
