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

#import <React/RCTUtils.h>
#import <Firebase/Firebase.h>

#import "RNFBAuthModule.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBApp/RCTConvert+FIRApp.h"

static NSString *const keyIOS = @"iOS";
static NSString *const keyUrl = @"url";
static NSString *const keyUid = @"uid";
static NSString *const keyUser = @"user";
static NSString *const keyEmail = @"email";
static NSString *const keyAndroid = @"android";
static NSString *const keyProfile = @"profile";
static NSString *const keyNewUser = @"isNewUser";
static NSString *const keyUsername = @"username";
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
static NSString *const keyDynamicLinkDomain = @"dynamicLinkDomain";
static NSString *const keyAdditionalUserInfo = @"additionalUserInfo";
static NSString *const AUTH_STATE_CHANGED_EVENT = @"auth_state_changed";
static NSString *const AUTH_ID_TOKEN_CHANGED_EVENT = @"auth_id_token_changed";
static NSString *const PHONE_AUTH_STATE_CHANGED_EVENT = @"phone_auth_state_changed";

static __strong NSMutableDictionary *authStateHandlers;
static __strong NSMutableDictionary *idTokenHandlers;

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
  });
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  for (NSString *key in authStateHandlers) {
    FIRApp *firebaseApp = [RCTConvert firAppFromString:key];

    [[FIRAuth authWithApp:firebaseApp] removeAuthStateDidChangeListener:[authStateHandlers valueForKey:key]];
    [authStateHandlers removeObjectForKey:key];
  }

  for (NSString *key in idTokenHandlers) {
    FIRApp *firebaseApp = [RCTConvert firAppFromString:key];
    [[FIRAuth authWithApp:firebaseApp] removeIDTokenDidChangeListener:[idTokenHandlers valueForKey:key]];
    [idTokenHandlers removeObjectForKey:key];
  }
}

#pragma mark -
#pragma mark Firebase Auth Methods

RCT_EXPORT_METHOD(addAuthStateListener:
  (FIRApp *) firebaseApp
) {
  if (![authStateHandlers valueForKey:firebaseApp.name]) {
    FIRAuthStateDidChangeListenerHandle newListenerHandle =
        [[FIRAuth authWithApp:firebaseApp] addAuthStateDidChangeListener:^(
            FIRAuth *_Nonnull auth,
            FIRUser *_Nullable user
        ) {
          if (user != nil) {
            [RNFBSharedUtils sendJSEventForApp:firebaseApp name:AUTH_STATE_CHANGED_EVENT body:@{
                keyUser: [self firebaseUserToDict:user]
            }];
          } else {
            [RNFBSharedUtils sendJSEventForApp:firebaseApp name:AUTH_STATE_CHANGED_EVENT body:@{}];
          }
        }];
    authStateHandlers[firebaseApp.name] = [NSValue valueWithNonretainedObject:newListenerHandle];
  }
}

RCT_EXPORT_METHOD(removeAuthStateListener:
  (FIRApp *) firebaseApp
) {
  if ([authStateHandlers valueForKey:firebaseApp.name]) {
    [[FIRAuth authWithApp:firebaseApp] removeAuthStateDidChangeListener:[authStateHandlers valueForKey:firebaseApp.name]];
    [authStateHandlers removeObjectForKey:firebaseApp.name];
  }
}

RCT_EXPORT_METHOD(addIdTokenListener:
  (FIRApp *) firebaseApp
) {
  if (![idTokenHandlers valueForKey:firebaseApp.name]) {
    FIRIDTokenDidChangeListenerHandle newListenerHandle =
        [[FIRAuth authWithApp:firebaseApp] addIDTokenDidChangeListener:^(
            FIRAuth *_Nonnull auth,
            FIRUser *_Nullable user
        ) {
          if (user != nil) {
            [RNFBSharedUtils sendJSEventForApp:firebaseApp name:AUTH_ID_TOKEN_CHANGED_EVENT body:@{
                keyUser: [self firebaseUserToDict:user]}];
          } else {
            [RNFBSharedUtils sendJSEventForApp:firebaseApp name:AUTH_ID_TOKEN_CHANGED_EVENT body:@{}];
          }
        }];

    idTokenHandlers[firebaseApp.name] = [NSValue valueWithNonretainedObject:newListenerHandle];
  }
}

RCT_EXPORT_METHOD(removeIdTokenListener:
  (FIRApp *) firebaseApp
) {
  if ([idTokenHandlers valueForKey:firebaseApp.name]) {
    [[FIRAuth authWithApp:firebaseApp] removeIDTokenDidChangeListener:[idTokenHandlers valueForKey:firebaseApp.name]];
    [idTokenHandlers removeObjectForKey:firebaseApp.name];
  }
}

RCT_EXPORT_METHOD(setAppVerificationDisabledForTesting:
  (FIRApp *) firebaseApp
    :(BOOL) disabled
) {
  [FIRAuth authWithApp:firebaseApp].settings.appVerificationDisabledForTesting = disabled;
}

RCT_EXPORT_METHOD(signOut:
  (FIRApp *) firebaseApp
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
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

RCT_EXPORT_METHOD(signInAnonymously:
  (FIRApp *) firebaseApp
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] signInAnonymouslyWithCompletion:^(FIRAuthDataResult *authResult, NSError *error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

RCT_EXPORT_METHOD(signInWithEmailAndPassword:
  (FIRApp *) firebaseApp
    :(NSString *) email
    :(NSString *) password
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] signInWithEmail:email password:password completion:^(
      FIRAuthDataResult *authResult,
      NSError *error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

RCT_EXPORT_METHOD(signInWithEmailLink:
  (FIRApp *) firebaseApp
    :(NSString *) email
    :(NSString *) emailLink
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] signInWithEmail:email link:emailLink completion:^(
      FIRAuthDataResult *authResult,
      NSError *error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

RCT_EXPORT_METHOD(createUserWithEmailAndPassword:
  (FIRApp *) firebaseApp
    :(NSString *) email
    :(NSString *) password
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] createUserWithEmail:email password:password completion:^(
      FIRAuthDataResult *authResult,
      NSError *error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

RCT_EXPORT_METHOD(delete:
  (FIRApp *) firebaseApp
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
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

RCT_EXPORT_METHOD(reload:
  (FIRApp *) firebaseApp
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [self reloadAndReturnUser:user resolver:resolve rejecter:reject];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(sendEmailVerification:
  (FIRApp *) firebaseApp
    :(NSDictionary *) actionCodeSettings
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
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

RCT_EXPORT_METHOD(updateEmail:
  (FIRApp *) firebaseApp
    :(NSString *) email
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user updateEmail:email completion:^(NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        [self reloadAndReturnUser:user resolver:resolve rejecter:reject];
      }
    }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(updatePassword:
  (FIRApp *) firebaseApp
    :(NSString *) password
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user updatePassword:password completion:^(NSError *_Nullable error) {
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

RCT_EXPORT_METHOD(updatePhoneNumber:
  (FIRApp *) firebaseApp
    :(NSString *) provider
    :(NSString *) authToken
    :(NSString *) authSecret
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    FIRPhoneAuthCredential *credential =
        (FIRPhoneAuthCredential *) [self getCredentialForProvider:provider token:authToken secret:authSecret];

    if (credential == nil) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
          @"code": @"invalid-credential",
          @"message": @"The supplied auth credential is malformed, has expired or is not currently supported.",
      }];
    }

    [user updatePhoneNumberCredential:credential completion:^(NSError *_Nullable error) {
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

RCT_EXPORT_METHOD(updateProfile:
  (FIRApp *) firebaseApp
    :(NSDictionary *) props
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
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
        [self reloadAndReturnUser:user resolver:resolve rejecter:reject];
      }
    }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(getIdToken:
  (FIRApp *) firebaseApp
    :(BOOL) forceRefresh
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user getIDTokenForcingRefresh:(BOOL) forceRefresh completion:^(NSString *token, NSError *_Nullable error) {
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

RCT_EXPORT_METHOD(getIdTokenResult:
  (FIRApp *) firebaseApp
    :(BOOL) forceRefresh
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user getIDTokenResultForcingRefresh:(BOOL) forceRefresh completion:^(
        FIRAuthTokenResult *_Nullable tokenResult,
        NSError *_Nullable error
    ) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        NSMutableDictionary *tokenResultDict = [NSMutableDictionary dictionary];
        [tokenResultDict setValue:[RNFBSharedUtils getISO8601String:tokenResult.authDate] forKey:@"authTime"];
        [tokenResultDict setValue:[RNFBSharedUtils getISO8601String:tokenResult.issuedAtDate] forKey:@"issuedAtTime"];
        [tokenResultDict setValue:[RNFBSharedUtils getISO8601String:tokenResult.expirationDate] forKey:@"expirationTime"];

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

RCT_EXPORT_METHOD(signInWithCredential:
  (FIRApp *) firebaseApp
    :(NSString *) provider
    :(NSString *) authToken
    :(NSString *) authSecret
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];

  if (credential == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
        @"code": @"invalid-credential",
        @"message": @"The supplied auth credential is malformed, has expired or is not currently supported.",
    }];
  }

  [[FIRAuth authWithApp:firebaseApp] signInAndRetrieveDataWithCredential:credential completion:^(
      FIRAuthDataResult *authResult,
      NSError *error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

RCT_EXPORT_METHOD(confirmPasswordReset:
  (FIRApp *) firebaseApp
    :(NSString *) code
    :(NSString *) newPassword
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] confirmPasswordResetWithCode:code newPassword:newPassword completion:^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    }
  }];
}

RCT_EXPORT_METHOD(applyActionCode:
  (FIRApp *) firebaseApp
    :(NSString *) code
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] applyActionCode:code completion:^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithUser:resolve rejecter:reject user:[FIRAuth authWithApp:firebaseApp].currentUser];
    }
  }];
}

RCT_EXPORT_METHOD(checkActionCode:
  (FIRApp *) firebaseApp
    :(NSString *) code
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] checkActionCode:code completion:^(
      FIRActionCodeInfo *_Nullable info,
      NSError *_Nullable error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      NSString *actionType = @"ERROR";
      switch (info.operation) {
      case FIRActionCodeOperationPasswordReset:actionType = @"PASSWORD_RESET";
        break;
      case FIRActionCodeOperationVerifyEmail:actionType = @"VERIFY_EMAIL";
        break;
      case FIRActionCodeOperationUnknown:actionType = @"UNKNOWN";
        break;
      case FIRActionCodeOperationRecoverEmail:actionType = @"RECOVER_EMAIL";
        break;
      case FIRActionCodeOperationEmailLink:actionType = @"EMAIL_SIGNIN";
        break;
      }

      NSMutableDictionary *data = [NSMutableDictionary dictionary];

      if ([info dataForKey:FIRActionCodeEmailKey] != nil) {
        [data setValue:[info dataForKey:FIRActionCodeEmailKey] forKey:keyEmail];
      } else {
        [data setValue:[NSNull null] forKey:keyEmail];
      }

      if ([info dataForKey:FIRActionCodeFromEmailKey] != nil) {
        [data setValue:[info dataForKey:FIRActionCodeFromEmailKey] forKey:@"fromEmail"];
      } else {
        [data setValue:[NSNull null] forKey:@"fromEmail"];
      }

      NSDictionary *result = @{@"data": data, @"operation": actionType};

      resolve(result);
    }
  }];
}

RCT_EXPORT_METHOD(sendPasswordResetEmail:
  (FIRApp *) firebaseApp
    :(NSString *) email
    :(NSDictionary *) actionCodeSettings
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  id handler = ^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    }
  };

  if (actionCodeSettings) {
    FIRActionCodeSettings *settings = [self buildActionCodeSettings:actionCodeSettings];
    [[FIRAuth authWithApp:firebaseApp] sendPasswordResetWithEmail:email actionCodeSettings:settings completion:handler];
  } else {
    [[FIRAuth authWithApp:firebaseApp] sendPasswordResetWithEmail:email completion:handler];
  }
}

RCT_EXPORT_METHOD(sendSignInLinkToEmail:
  (FIRApp *) firebaseApp
    :(NSString *) email
    :(NSDictionary *) actionCodeSettings
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  id handler = ^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    }
  };

  FIRActionCodeSettings *settings = [self buildActionCodeSettings:actionCodeSettings];
  [[FIRAuth authWithApp:firebaseApp] sendSignInLinkToEmail:email actionCodeSettings:settings completion:handler];
}

RCT_EXPORT_METHOD(signInWithCustomToken:
  (FIRApp *) firebaseApp
    :(NSString *) customToken
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] signInWithCustomToken:customToken completion:^(
      FIRAuthDataResult *authResult,
      NSError *error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

RCT_EXPORT_METHOD(signInWithPhoneNumber:
  (FIRApp *) firebaseApp
    :(NSString *) phoneNumber
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]] verifyPhoneNumber:phoneNumber UIDelegate:nil completion:^(
      NSString *_Nullable verificationID,
      NSError *_Nullable error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
      [defaults setObject:verificationID forKey:@"authVerificationID"];
      resolve(@{
          @"verificationId": verificationID
      });
    }
  }];
}

RCT_EXPORT_METHOD(verifyPhoneNumber:
  (FIRApp *) firebaseApp
    :(NSString *) phoneNumber
    :(NSString *) requestKey
) {
  [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firebaseApp]] verifyPhoneNumber:phoneNumber UIDelegate:nil completion:^(
      NSString *_Nullable verificationID,
      NSError *_Nullable error
  ) {
    if (error) {
      NSDictionary *jsError = [self getJSError:(error)];
      NSDictionary *body = @{
          @"type": @"onVerificationFailed",
          @"requestKey": requestKey,
          @"state": @{@"error": jsError},
      };
      [RNFBSharedUtils sendJSEventForApp:firebaseApp name:PHONE_AUTH_STATE_CHANGED_EVENT body:body];
    } else {
      NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
      [defaults setObject:verificationID forKey:@"authVerificationID"];
      NSDictionary *body = @{
          @"type": @"onCodeSent",
          @"requestKey": requestKey,
          @"state": @{@"verificationId": verificationID},
      };
      [RNFBSharedUtils sendJSEventForApp:firebaseApp name:PHONE_AUTH_STATE_CHANGED_EVENT body:body];
    }
  }];
}

RCT_EXPORT_METHOD(confirmationResultConfirm:
  (FIRApp *) firebaseApp
    :(NSString *) verificationCode
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  NSString *verificationId = [defaults stringForKey:@"authVerificationID"];

  FIRAuthCredential *credential =
      [[FIRPhoneAuthProvider provider] credentialWithVerificationID:verificationId verificationCode:verificationCode];

  [[FIRAuth authWithApp:firebaseApp] signInAndRetrieveDataWithCredential:credential completion:^(
      FIRAuthDataResult *authResult,
      NSError *error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithUser:resolve rejecter:reject user:authResult.user];
    }
  }];
}

RCT_EXPORT_METHOD(linkWithCredential:
  (FIRApp *) firebaseApp
    :(NSString *) provider
    :(NSString *) authToken
    :(NSString *) authSecret
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];

  if (credential == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
        @"code": @"invalid-credential",
        @"message": @"The supplied auth credential is malformed, has expired or is not currently supported.",
    }];
  }

  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;
  if (user) {
    [user linkAndRetrieveDataWithCredential:credential
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

RCT_EXPORT_METHOD(unlink:
  (FIRApp *) firebaseApp
    :(NSString *) providerId
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user unlinkFromProvider:providerId completion:^(FIRUser *_Nullable _user, NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        [self reloadAndReturnUser:user resolver:resolve rejecter:reject];
      }
    }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

RCT_EXPORT_METHOD(reauthenticateWithCredential:
  (FIRApp *) firebaseApp
    :(NSString *) provider
    :(NSString *) authToken
    :(NSString *) authSecret
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];

  if (credential == nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
        @"code": @"invalid-credential",
        @"message": @"The supplied auth credential is malformed, has expired or is not currently supported.",
    }];
  }

  FIRUser *user = [FIRAuth authWithApp:firebaseApp].currentUser;

  if (user) {
    [user reauthenticateAndRetrieveDataWithCredential:credential completion:^(
        FIRAuthDataResult *_Nullable authResult,
        NSError *_Nullable error
    ) {
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

RCT_EXPORT_METHOD(fetchSignInMethodsForEmail:
  (FIRApp *) firebaseApp
    :(NSString *) email
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] fetchSignInMethodsForEmail:email completion:^(
      NSArray<NSString *> *_Nullable providers,
      NSError *_Nullable error
  ) {
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

RCT_EXPORT_METHOD(setLanguageCode:
  (FIRApp *) firebaseApp
    :(NSString *) code
) {
  [FIRAuth authWithApp:firebaseApp].languageCode = code;
}

RCT_EXPORT_METHOD(useDeviceLanguage:
  (FIRApp *) firebaseApp
) {
  [[FIRAuth authWithApp:firebaseApp] useAppLanguage];
}

RCT_EXPORT_METHOD(verifyPasswordResetCode:
  (FIRApp *) firebaseApp
    :(NSString *) code
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRAuth authWithApp:firebaseApp] verifyPasswordResetCode:code completion:^(
      NSString *_Nullable email,
      NSError *_Nullable error
  ) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      resolve(email);
    }
  }];
}

- (FIRAuthCredential *)getCredentialForProvider:(NSString *)provider token:(NSString *)authToken secret:(NSString *)authTokenSecret {
  FIRAuthCredential *credential;

  if ([provider compare:@"twitter.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIRTwitterAuthProvider credentialWithToken:authToken secret:authTokenSecret];
  } else if ([provider compare:@"facebook.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIRFacebookAuthProvider credentialWithAccessToken:authToken];
  } else if ([provider compare:@"google.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIRGoogleAuthProvider credentialWithIDToken:authToken accessToken:authTokenSecret];
  } else if ([provider compare:@"password" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIREmailAuthProvider credentialWithEmail:authToken password:authTokenSecret];
  } else if ([provider compare:@"emailLink" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIREmailAuthProvider credentialWithEmail:authToken link:authTokenSecret];
  } else if ([provider compare:@"github.com" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIRGitHubAuthProvider credentialWithToken:authToken];
  } else if ([provider compare:@"phone" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential =
        [[FIRPhoneAuthProvider provider] credentialWithVerificationID:authToken verificationCode:authTokenSecret];
  } else if ([provider compare:@"oauth" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
    credential = [FIROAuthProvider credentialWithProviderID:@"oauth" IDToken:authToken accessToken:authTokenSecret];
  } else {
    DLog(@"Provider not yet handled: %@", provider);
  }

  return credential;
}

// This is here to protect against bugs in the iOS SDK which don't
// correctly refresh the user object when performing certain operations
- (void)reloadAndReturnUser:(FIRUser *)user
                   resolver:(RCTPromiseResolveBlock)resolve
                   rejecter:(RCTPromiseRejectBlock)reject {
  [user reloadWithCompletion:^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithUser:resolve rejecter:reject user:user];
    }
  }];
}

- (void)promiseNoUser:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject isError:(BOOL)isError {
  if (isError) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
        @"code": @"no-current-user",
        @"message": @"No user currently signed in.",
    }];
  } else {
    resolve([NSNull null]);
  }
}

- (void)promiseRejectAuthException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  NSDictionary *jsError = [self getJSError:(error)];
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
      @"code": [jsError valueForKey:@"code"],
      @"message": [jsError valueForKey:@"message"],
      @"nativeErrorMessage": [jsError valueForKey:@"nativeErrorMessage"],
  }];
}

- (NSDictionary *)getJSError:(NSError *)error {
  NSString *code = AuthErrorCode_toJSErrorCode[error.code];
  NSString *message = [error localizedDescription];
  NSString *nativeErrorMessage = [error localizedDescription];

  if (code == nil)
    code = @"unknown";

  // TODO(Salakar): replace these with a AuthErrorCode_toJSErrorMessage map (like codes now does)
  switch (error.code) {
  case FIRAuthErrorCodeInvalidCustomToken:
    message = @"The custom token format is incorrect. Please check the documentation.";
    break;
  case FIRAuthErrorCodeCustomTokenMismatch:message = @"The custom token corresponds to a different audience.";
    break;
  case FIRAuthErrorCodeInvalidCredential:message = @"The supplied auth credential is malformed or has expired.";
    break;
  case FIRAuthErrorCodeInvalidEmail:message = @"The email address is badly formatted.";
    break;
  case FIRAuthErrorCodeWrongPassword:message = @"The password is invalid or the user does not have a password.";
    break;
  case FIRAuthErrorCodeUserMismatch:
    message = @"The supplied credentials do not correspond to the previously signed in user.";
    break;
  case FIRAuthErrorCodeRequiresRecentLogin:
    message =
        @"This operation is sensitive and requires recent authentication. Log in again before retrying this request.";
    break;
  case FIRAuthErrorCodeAccountExistsWithDifferentCredential:
    message =
        @"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.";
    break;
  case FIRAuthErrorCodeEmailAlreadyInUse:message = @"The email address is already in use by another account.";
    break;
  case FIRAuthErrorCodeCredentialAlreadyInUse:
    message = @"This credential is already associated with a different user account.";
    break;
  case FIRAuthErrorCodeUserDisabled:message = @"The user account has been disabled by an administrator.";
    break;
  case FIRAuthErrorCodeUserTokenExpired:
    message = @"The user's credential is no longer valid. The user must sign in again.";
    break;
  case FIRAuthErrorCodeUserNotFound:
    message = @"There is no user record corresponding to this identifier. The user may have been deleted.";
    break;
  case FIRAuthErrorCodeInvalidUserToken:
    message = @"The user's credential is no longer valid. The user must sign in again.";
    break;
  case FIRAuthErrorCodeWeakPassword:message = @"The given password is invalid.";
    break;
  case FIRAuthErrorCodeOperationNotAllowed:
    message = @"This operation is not allowed. You must enable this service in the console.";
    break;
  case FIRAuthErrorCodeNetworkError:message = @"A network error has occurred, please try again.";
    break;
  case FIRAuthErrorCodeInternalError:message = @"An internal error has occurred, please try again.";
    break;
  default:break;
  }

  return @{
      @"code": code,
      @"message": message,
      @"nativeErrorMessage": nativeErrorMessage,
  };
}

- (void)promiseWithUser:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject user:(FIRUser *)user {
  if (user) {
    NSDictionary *userDict = [self firebaseUserToDict:user];
    resolve(userDict);
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }

}

- (void)promiseWithAuthResult:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject authResult:(FIRAuthDataResult *)authResult {
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

- (NSArray <NSObject *> *)convertProviderData:(NSArray <id <FIRUserInfo>> *)providerData {
  NSMutableArray *output = [NSMutableArray array];

  for (id <FIRUserInfo> userInfo in providerData) {
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
      keyDisplayName: user.displayName ? (id) user.displayName : [NSNull null],
      keyEmail: user.email ? (id) user.email : [NSNull null],
      @"emailVerified": @(user.emailVerified),
      @"isAnonymous": @(user.anonymous),
      @"metadata": @{
          @"creationTime": user.metadata.creationDate ? (id) @(round(
              [user.metadata.creationDate timeIntervalSince1970] * 1000.0)) : [NSNull null],
          @"lastSignInTime": user.metadata.lastSignInDate ? (id) @(round(
              [user.metadata.lastSignInDate timeIntervalSince1970] * 1000.0)) : [NSNull null],
      },
      keyPhoneNumber: user.phoneNumber ? (id) user.phoneNumber : [NSNull null],
      keyPhotoUrl: user.photoURL ? (id) [user.photoURL absoluteString] : [NSNull null],
      @"providerData": [self convertProviderData:user.providerData],
      keyProviderId: [user.providerID lowercaseString],
      @"refreshToken": user.refreshToken,
      keyUid: user.uid
  };
}

- (FIRActionCodeSettings *)buildActionCodeSettings:(NSDictionary *)actionCodeSettings {
  FIRActionCodeSettings *settings = [[FIRActionCodeSettings alloc] init];

  NSString *url = actionCodeSettings[keyUrl];
  [settings setURL:[NSURL URLWithString:url]];

  if (actionCodeSettings[keyHandleCodeInApp]) {
    BOOL handleCodeInApp = [actionCodeSettings[keyHandleCodeInApp] boolValue];
    [settings setHandleCodeInApp:handleCodeInApp];
  }

  if (actionCodeSettings[keyDynamicLinkDomain]) {
    NSString *dynamicLinkDomain = [actionCodeSettings[keyDynamicLinkDomain] stringValue];
    [settings setDynamicLinkDomain:dynamicLinkDomain];
  }

  if (actionCodeSettings[keyAndroid]) {
    NSDictionary *android = actionCodeSettings[keyAndroid];
    NSString *packageName = android[keyPackageName];
    NSString *minimumVersion = android[keyMinVersion];
    BOOL installApp = [android[keyInstallApp] boolValue];
    [settings setAndroidPackageName:packageName installIfNotAvailable:installApp minimumVersion:minimumVersion];
  }

  if (actionCodeSettings[keyIOS]) {
    NSDictionary *ios = actionCodeSettings[keyIOS];
    [settings setIOSBundleID:ios[keyBundleId]];
  }

  return settings;
}

@end
