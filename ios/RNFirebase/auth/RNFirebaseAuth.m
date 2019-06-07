#import "RNFirebaseAuth.h"
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"

#if __has_include(<FirebaseAuth/FIRAuth.h>)

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
static NSString *const keyAdditionalUserInfo = @"additionalUserInfo";

static NSMutableDictionary *authStateHandlers;
static NSMutableDictionary *idTokenHandlers;

@implementation RNFirebaseAuth
RCT_EXPORT_MODULE();

- (id)init {
  self = [super init];
  
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    authStateHandlers = [[NSMutableDictionary alloc] init];
    idTokenHandlers = [[NSMutableDictionary alloc] init];
    DLog(@"RNFirebaseAuth:instance-created");
  });
  
  DLog(@"RNFirebaseAuth:instance-initialized");
  return self;
}

- (void)dealloc {
  DLog(@"RNFirebaseAuth:instance-destroyed");
  
  for(NSString* key in authStateHandlers) {
    FIRApp *firApp = [RNFirebaseUtil getApp:key];
    [[FIRAuth authWithApp:firApp] removeAuthStateDidChangeListener:[authStateHandlers valueForKey:key]];
    [authStateHandlers removeObjectForKey:key];
  }
  
  for(NSString* key in idTokenHandlers) {
    FIRApp *firApp = [RNFirebaseUtil getApp:key];
    [[FIRAuth authWithApp:firApp] removeIDTokenDidChangeListener:[idTokenHandlers valueForKey:key]];
    [idTokenHandlers removeObjectForKey:key];
  }
}

- (void)invalidate {
  // dealloc sometimes is not called when app is reloaded.

  for(NSString* key in authStateHandlers) {
      FIRApp *firApp = [RNFirebaseUtil getApp:key];
      [[FIRAuth authWithApp:firApp] removeAuthStateDidChangeListener:[authStateHandlers valueForKey:key]];
      [authStateHandlers removeObjectForKey:key];
  }
  
  for(NSString* key in idTokenHandlers) {
      FIRApp *firApp = [RNFirebaseUtil getApp:key];
      [[FIRAuth authWithApp:firApp] removeIDTokenDidChangeListener:[idTokenHandlers valueForKey:key]];
      [idTokenHandlers removeObjectForKey:key];
  }
}

/**
 * addAuthStateListener
 *
 */
RCT_EXPORT_METHOD(addAuthStateListener:
                    (NSString *) appDisplayName) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  if (![authStateHandlers valueForKey:firApp.name]) {
    FIRAuthStateDidChangeListenerHandle newListenerHandle =
        [[FIRAuth authWithApp:firApp] addAuthStateDidChangeListener:^(FIRAuth *_Nonnull auth, FIRUser *_Nullable user) {
          if (user != nil) {
            [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:AUTH_STATE_CHANGED_EVENT body:@{
                keyUser: [self firebaseUserToDict:user]}];
          } else {
            [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:AUTH_STATE_CHANGED_EVENT body:@{}];
          }
        }];

    authStateHandlers[firApp.name] = [NSValue valueWithNonretainedObject:newListenerHandle];
  }
}

/**
 * removeAuthStateListener
 *
 */
RCT_EXPORT_METHOD(removeAuthStateListener:
                    (NSString *) appDisplayName) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  if ([authStateHandlers valueForKey:firApp.name]) {
    [[FIRAuth authWithApp:firApp] removeAuthStateDidChangeListener:[authStateHandlers valueForKey:firApp.name]];
    [authStateHandlers removeObjectForKey:firApp.name];
  }
}

/**
 * addIdTokenListener
 *
 */
RCT_EXPORT_METHOD(addIdTokenListener:
                    (NSString *) appDisplayName) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  if (![idTokenHandlers valueForKey:firApp.name]) {
    FIRIDTokenDidChangeListenerHandle newListenerHandle =
        [[FIRAuth authWithApp:firApp] addIDTokenDidChangeListener:^(FIRAuth *_Nonnull auth, FIRUser *_Nullable user) {
          if (user != nil) {
            [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:AUTH_ID_TOKEN_CHANGED_EVENT body:@{
                keyUser: [self firebaseUserToDict:user]}];
          } else {
            [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:AUTH_ID_TOKEN_CHANGED_EVENT body:@{}];
          }
        }];

    idTokenHandlers[firApp.name] = [NSValue valueWithNonretainedObject:newListenerHandle];
  }
}

/**
 removeAuthStateListener

 */
RCT_EXPORT_METHOD(removeIdTokenListener:
                    (NSString *) appDisplayName) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  if ([idTokenHandlers valueForKey:firApp.name]) {
    [[FIRAuth authWithApp:firApp] removeIDTokenDidChangeListener:[idTokenHandlers valueForKey:firApp.name]];
    [idTokenHandlers removeObjectForKey:firApp.name];
  }
}

/**
 * Flag to determine whether app verification should be disabled for testing or not.
 *
 * @return
 */
RCT_EXPORT_METHOD(
      setAppVerificationDisabledForTesting:
      (NSString *) appDisplayName
      disabled:
      (BOOL) disabled
) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  [FIRAuth authWithApp:firApp].settings.appVerificationDisabledForTesting = disabled;
}


/**
 signOut

 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signOut:
                    (NSString *) appDisplayName
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

  if (user) {
    NSError *error;
    [[FIRAuth authWithApp:firApp] signOut:&error];
    if (!error) [self promiseNoUser:resolve rejecter:reject isError:NO];
    else [self promiseRejectAuthException:reject error:error];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}


/**
 signInAnonymously

 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInAnonymously:
                    (NSString *) appDisplayName
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] signInAnonymouslyWithCompletion:^(FIRAuthDataResult *authResult, NSError *error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

/**
 signInWithEmailAndPassword

 @param NSString NSString email
 @param NSString NSString password
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(signInWithEmailAndPassword:
                    (NSString *) appDisplayName
                        email:
                        (NSString *) email
                        password:
                        (NSString *) password
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] signInWithEmail:email password:password completion:^(FIRAuthDataResult *authResult,
                                                                                     NSError *error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

/**
 signInWithEmailLink
 
 @param NSString NSString email
 @param NSString NSString emailLink
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(signInWithEmailLink:
                    (NSString *) appDisplayName
                        email:
                        (NSString *) email
                        emailLink:
                        (NSString *) emailLink
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] signInWithEmail:email link:emailLink completion:^(FIRAuthDataResult *authResult,
                                                                                  NSError *error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

/**
 createUserWithEmailAndPassword

 @param NSString NSString email
 @param NSString NSString password
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */

RCT_EXPORT_METHOD(createUserWithEmailAndPassword:
                    (NSString *) appDisplayName
                        email:
                        (NSString *) email
                        password:
                        (NSString *) password
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] createUserWithEmail:email password:password completion:^(FIRAuthDataResult *authResult,
                                                                                         NSError *error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

/**
 deleteUser

 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(delete:
                    (NSString *) appDisplayName
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

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

/**
 reload

 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(reload:
                    (NSString *) appDisplayName
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

  if (user) {
    [self reloadAndReturnUser:user resolver:resolve rejecter:reject];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

/**
 sendEmailVerification

 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(sendEmailVerification:
                    (NSString *) appDisplayName
                        actionCodeSettings:
                        (NSDictionary *) actionCodeSettings
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;
  if (user) {
    id handler = ^(NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        FIRUser *userAfterUpdate = [FIRAuth authWithApp:firApp].currentUser;
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

/**
 updateEmail

 @param NSString email
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(updateEmail:
                    (NSString *) appDisplayName
                        email:
                        (NSString *) email
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

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

/**
 updatePassword

 @param NSString password
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(updatePassword:
                    (NSString *) appDisplayName
                        password:
                        (NSString *) password
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

  if (user) {
    [user updatePassword:password completion:^(NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        FIRUser *userAfterUpdate = [FIRAuth authWithApp:firApp].currentUser;
        [self promiseWithUser:resolve rejecter:reject user:userAfterUpdate];
      }
    }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}


/**
 updatePhoneNumber

 @param NSString password
 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(updatePhoneNumber:
                    (NSString *) appDisplayName
                        provider:
                        (NSString *) provider
                        token:
                        (NSString *) authToken
                        secret:
                        (NSString *) authSecret
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

  if (user) {
    FIRPhoneAuthCredential *credential =
        (FIRPhoneAuthCredential *) [self getCredentialForProvider:provider token:authToken secret:authSecret];

    if (credential == nil) {
      return reject(@"auth/invalid-credential",
                    @"The supplied auth credential is malformed, has expired or is not currently supported.",
                    nil);
    }

    [user updatePhoneNumberCredential:credential completion:^(NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        FIRUser *userAfterUpdate = [FIRAuth authWithApp:firApp].currentUser;
        [self promiseWithUser:resolve rejecter:reject user:userAfterUpdate];
      }
    }];
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }
}

/**
 updateProfile

 @param NSDictionary props
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(updateProfile:
                    (NSString *) appDisplayName
                        props:
                        (NSDictionary *) props
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

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

/**
 getIdToken

 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(getIdToken:
                    (NSString *) appDisplayName
                        forceRefresh:
                        (BOOL) forceRefresh
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

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

/**
 * getIdTokenResult
 *
 * @param RCTPromiseResolveBlock resolve
 * @param RCTPromiseRejectBlock reject
 * @return
 */
RCT_EXPORT_METHOD(getIdTokenResult:
                    (NSString *) appDisplayName
                        forceRefresh:
                        (BOOL) forceRefresh
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

  if (user) {
    [user getIDTokenResultForcingRefresh:(BOOL) forceRefresh completion:^(FIRAuthTokenResult *_Nullable tokenResult,
                                                                          NSError *_Nullable error) {
      if (error) {
        [self promiseRejectAuthException:reject error:error];
      } else {
        NSMutableDictionary *tokenResultDict = [NSMutableDictionary dictionary];
        [tokenResultDict setValue:[RNFirebaseUtil getISO8601String:tokenResult.authDate] forKey:@"authTime"];
        [tokenResultDict setValue:[RNFirebaseUtil getISO8601String:tokenResult.issuedAtDate] forKey:@"issuedAtTime"];
        [tokenResultDict setValue:[RNFirebaseUtil getISO8601String:tokenResult.expirationDate] forKey:@"expirationTime"];

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

/**
 signInWithCredential

 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInWithCredential:
                    (NSString *) appDisplayName
                        provider:
                        (NSString *) provider
                        token:
                        (NSString *) authToken
                        secret:
                        (NSString *) authSecret
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];

  if (credential == nil) {
    return reject(@"auth/invalid-credential",
                  @"The supplied auth credential is malformed, has expired or is not currently supported.",
                  nil);
  }

  [[FIRAuth authWithApp:firApp] signInAndRetrieveDataWithCredential:credential completion:^(FIRAuthDataResult *authResult,
                                                                                            NSError *error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

/**
 confirmPasswordReset

 @param NSString code
 @param NSString newPassword
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(confirmPasswordReset:
                    (NSString *) appDisplayName
                        code:
                        (NSString *) code
                        newPassword:
                        (NSString *) newPassword
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] confirmPasswordResetWithCode:code newPassword:newPassword completion:^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    }
  }];
}


/**
 * applyActionCode
 *
 * @param NSString code
 * @param RCTPromiseResolveBlock resolve
 * @param RCTPromiseRejectBlock reject
 * @return
 */
RCT_EXPORT_METHOD(applyActionCode:
                    (NSString *) appDisplayName
                        code:
                        (NSString *) code
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] applyActionCode:code completion:^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithUser:resolve rejecter:reject user:[FIRAuth authWithApp:firApp].currentUser];
    }
  }];
}

/**
 * checkActionCode
 *
 * @param NSString code
 * @param RCTPromiseResolveBlock resolve
 * @param RCTPromiseRejectBlock reject
 * @return
 */
RCT_EXPORT_METHOD(checkActionCode:
                    (NSString *) appDisplayName
                        code:
                        (NSString *) code
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] checkActionCode:code completion:^(FIRActionCodeInfo *_Nullable info,
                                                                  NSError *_Nullable error) {
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

/**
 sendPasswordResetEmail

 @param NSString email
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(sendPasswordResetEmail:
                    (NSString *) appDisplayName
                        email:
                        (NSString *) email
                        actionCodeSettings:
                        (NSDictionary *) actionCodeSettings
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  id handler = ^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    }
  };

  if (actionCodeSettings) {
    FIRActionCodeSettings *settings = [self buildActionCodeSettings:actionCodeSettings];
    [[FIRAuth authWithApp:firApp] sendPasswordResetWithEmail:email actionCodeSettings:settings completion:handler];
  } else {
    [[FIRAuth authWithApp:firApp] sendPasswordResetWithEmail:email completion:handler];
  }
}

/**
 sendSignInLinkToEmail
 
 @param NSString email
 @param NSDictionary actionCodeSettings
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(sendSignInLinkToEmail:
                    (NSString *) appDisplayName
                        email:
                        (NSString *) email
                        actionCodeSettings:
                        (NSDictionary *) actionCodeSettings
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  id handler = ^(NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseNoUser:resolve rejecter:reject isError:NO];
    }
  };

  FIRActionCodeSettings *settings = [self buildActionCodeSettings:actionCodeSettings];
  [[FIRAuth authWithApp:firApp] sendSignInLinkToEmail:email actionCodeSettings:settings completion:handler];
}


/**
 signInWithCustomToken
 
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInWithCustomToken:
                    (NSString *) appDisplayName
                        customToken:
                        (NSString *) customToken
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] signInWithCustomToken:customToken completion:^(FIRAuthDataResult *authResult,
                                                                               NSError *error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
    }
  }];
}

/**
 signInWithPhoneNumber

 @param string phoneNumber
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInWithPhoneNumber:
                    (NSString *) appDisplayName
                        phoneNumber:
                        (NSString *) phoneNumber
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firApp]] verifyPhoneNumber:phoneNumber UIDelegate:nil completion:^(
      NSString *_Nullable verificationID,
      NSError *_Nullable error) {
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

/**
 verifyPhoneNumber

 @param string phoneNumber
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(verifyPhoneNumber:
                    (NSString *) appDisplayName
                        phoneNumber:
                        (NSString *) phoneNumber
                        requestKey:
                        (NSString *) requestKey) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firApp]] verifyPhoneNumber:phoneNumber UIDelegate:nil completion:^(
      NSString *_Nullable verificationID,
      NSError *_Nullable error) {
    if (error) {
      NSDictionary *jsError = [self getJSError:(error)];
      NSDictionary *body = @{
          @"type": @"onVerificationFailed",
          @"requestKey": requestKey,
          @"state": @{@"error": jsError},
      };
      [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:PHONE_AUTH_STATE_CHANGED_EVENT body:body];
    } else {
      NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
      [defaults setObject:verificationID forKey:@"authVerificationID"];
      NSDictionary *body = @{
          @"type": @"onCodeSent",
          @"requestKey": requestKey,
          @"state": @{@"verificationId": verificationID},
      };
      [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:PHONE_AUTH_STATE_CHANGED_EVENT body:body];
    }
  }];
}

RCT_EXPORT_METHOD(_confirmVerificationCode:
                    (NSString *) appDisplayName
                        verificationCode:
                        (NSString *) verificationCode
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  NSString *verificationId = [defaults stringForKey:@"authVerificationID"];

  FIRAuthCredential *credential =
      [[FIRPhoneAuthProvider provider] credentialWithVerificationID:verificationId verificationCode:verificationCode];

  [[FIRAuth authWithApp:firApp] signInAndRetrieveDataWithCredential:credential completion:^(FIRAuthDataResult *authResult,
                                                                                            NSError *error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      [self promiseWithUser:resolve rejecter:reject user:authResult.user];
    }
  }];
}

/**
 linkWithCredential

 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(linkWithCredential:
                    (NSString *) appDisplayName
                        provider:
                        (NSString *) provider
                        authToken:
                        (NSString *) authToken
                        authSecret:
                        (NSString *) authSecret
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];

  if (credential == nil) {
    return reject(@"auth/invalid-credential",
                  @"The supplied auth credential is malformed, has expired or is not currently supported.",
                  nil);
  }

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;
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

/**
 unlink

 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(unlink:
                    (NSString *) appDisplayName
                        providerId:
                        (NSString *) providerId
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

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

/**
 reauthenticateWithCredential

 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(reauthenticateWithCredential:
                    (NSString *) appDisplayName
                        provider:
                        (NSString *) provider
                        authToken:
                        (NSString *) authToken
                        authSecret:
                        (NSString *) authSecret
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];

  if (credential == nil) {
    return reject(@"auth/invalid-credential",
                  @"The supplied auth credential is malformed, has expired or is not currently supported.",
                  nil);
  }

  FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;

  if (user) {
    [user reauthenticateAndRetrieveDataWithCredential:credential completion:^(FIRAuthDataResult *_Nullable authResult,
                                                                              NSError *_Nullable error) {
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

/**
 fetchSignInMethodsForEmail

 @param NSString email
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(fetchSignInMethodsForEmail:
                    (NSString *) appDisplayName
                        email:
                        (NSString *) email
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

  [[FIRAuth authWithApp:firApp] fetchSignInMethodsForEmail:email completion:^(NSArray<NSString *> *_Nullable providers,
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

/**
 getCredentialForProvider

 @param provider string
 @param authToken string
 @param authTokenSecret string
 @return FIRAuthCredential
 */
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

/**
 setLanguageCode

 @param NSString code
 @return
 */
RCT_EXPORT_METHOD(setLanguageCode:
                    (NSString *) appDisplayName
                        code:
                        (NSString *) code) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  [FIRAuth authWithApp:firApp].languageCode = code;
}

/**
 useDeviceLanguage

 @param NSString code
 @return
 */
RCT_EXPORT_METHOD(useDeviceLanguage:
                    (NSString *) appDisplayName) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  [[FIRAuth authWithApp:firApp] useAppLanguage];
}

RCT_EXPORT_METHOD(verifyPasswordResetCode:
                    (NSString *) appDisplayName
                        code:
                        (NSString *) code
                        resolver:
                        (RCTPromiseResolveBlock) resolve
                        rejecter:
                        (RCTPromiseRejectBlock) reject) {
  FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
  [[FIRAuth authWithApp:firApp] verifyPasswordResetCode:code completion:^(NSString *_Nullable email,
                                                                          NSError *_Nullable error) {
    if (error) {
      [self promiseRejectAuthException:reject error:error];
    } else {
      resolve(email);
    }
  }];
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

/**
 Resolve or reject a promise based on isError value

 @param resolve RCTPromiseResolveBlock
 @param reject RCTPromiseRejectBlock
 @param isError BOOL
 */
- (void)promiseNoUser:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject isError:(BOOL)isError {
  if (isError) {
    reject(@"auth/no-current-user", @"No user currently signed in.", nil);
  } else {
    resolve([NSNull null]);
  }
}

/**
 Reject a promise with an auth exception

 @param reject RCTPromiseRejectBlock
 @param error NSError
 */
- (void)promiseRejectAuthException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  NSDictionary *jsError = [self getJSError:(error)];
  reject([jsError valueForKey:@"code"], [jsError valueForKey:@"message"], error);
}

/**
 Reject a promise with an auth exception

 @param error NSError
 */
- (NSDictionary *)getJSError:(NSError *)error {
  NSString *code = AuthErrorCode_toJSErrorCode[error.code];
  NSString *message = [error localizedDescription];
  NSString *nativeErrorMessage = [error localizedDescription];
  
  if (code == nil) code =  @"auth/unknown";
  
  // TODO: Salakar: replace these with a AuthErrorCode_toJSErrorMessage map (like codes now does)
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
      message =
          @"This operation is sensitive and requires recent authentication. Log in again before retrying this request.";
      break;
    case FIRAuthErrorCodeAccountExistsWithDifferentCredential:
      message =
          @"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.";
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
      message = @"There is no user record corresponding to this identifier. The user may have been deleted.";
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
    default:
      break;
  }

  return @{
      @"code": code,
      @"message": message,
      @"nativeErrorMessage": nativeErrorMessage,
  };
}

/**
 * Resolve or reject a promise based on FIRUser value existence
 *
 * @param resolve RCTPromiseResolveBlock
 * @param reject RCTPromiseRejectBlock
 * @param user FIRUser
 */
- (void)promiseWithUser:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject user:(FIRUser *)user {
  if (user) {
    NSDictionary *userDict = [self firebaseUserToDict:user];
    resolve(userDict);
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }

}

/**
 * Resolve or reject a promise based on FIRAuthResult value existence
 *
 * @param resolve RCTPromiseResolveBlock
 * @param reject RCTPromiseRejectBlock
 * @param authResult FIRAuthDataResult
 */
- (void)promiseWithAuthResult:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject authResult:(FIRAuthDataResult *)authResult {
  if (authResult && authResult.user) {
    NSMutableDictionary *authResultDict = [NSMutableDictionary dictionary];

    // additionalUserInfo
    if (authResult.additionalUserInfo) {
      NSMutableDictionary *additionalUserInfo = [NSMutableDictionary dictionary];

      // isNewUser
      [additionalUserInfo setValue:@(authResult.additionalUserInfo.isNewUser) forKey:keyNewUser];

      // profile
      if (authResult.additionalUserInfo.profile) {
        [additionalUserInfo setValue:authResult.additionalUserInfo.profile forKey:keyProfile];
      } else {
        [additionalUserInfo setValue:[NSNull null] forKey:keyProfile];
      }

      // providerId
      if (authResult.additionalUserInfo.providerID) {
        [additionalUserInfo setValue:authResult.additionalUserInfo.providerID forKey:keyProviderId];
      } else {
        [additionalUserInfo setValue:[NSNull null] forKey:keyProviderId];
      }

      // username
      if (authResult.additionalUserInfo.username) {
        [additionalUserInfo setValue:authResult.additionalUserInfo.username forKey:keyUsername];
      } else {
        [additionalUserInfo setValue:[NSNull null] forKey:keyUsername];
      }

      [authResultDict setValue:additionalUserInfo forKey:keyAdditionalUserInfo];
    } else {
      [authResultDict setValue:[NSNull null] forKey:keyAdditionalUserInfo];
    }

    // user
    [authResultDict setValue:[self firebaseUserToDict:authResult.user] forKey:keyUser];
    resolve(authResultDict);
  } else {
    [self promiseNoUser:resolve rejecter:reject isError:YES];
  }

}

/**
 * Converts an array of FIRUserInfo instances into a web sdk compatible format
 *
 * @param providerData NSArray
 * @return NSArray
 */
- (NSArray <NSObject *> *)convertProviderData:(NSArray <id<FIRUserInfo>> *)providerData {
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

/**
 * React native constant exports - exports native firebase apps mainly
 *
 * @return NSDictionary
 */
- (NSDictionary *)constantsToExport {
  NSDictionary *firApps = [FIRApp allApps];
  NSMutableDictionary *constants = [NSMutableDictionary new];
  NSMutableDictionary *appLanguage = [NSMutableDictionary new];
  NSMutableDictionary *appUser = [NSMutableDictionary new];

  for (id key in firApps) {
    FIRApp *firApp = firApps[key];
    NSString *appName = firApp.name;
    FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;
    
    if ([appName isEqualToString:@"__FIRAPP_DEFAULT"]) {
      appName = @"[DEFAULT]";
    }
    
    appLanguage[appName] = [FIRAuth authWithApp:firApp].languageCode;
    
    if (user != nil) {
      appUser[appName] = [self firebaseUserToDict: user];
    }
  }

  constants[constAppLanguage] = appLanguage;
  constants[constAppUser] = appUser;
  return constants;
}

/**
 * Converts a FIRUser instance into a dictionary to send via RNBridge
 *
 * @param user FIRUser
 * @return NSDictionary
 */
- (NSDictionary *)firebaseUserToDict:(FIRUser *)user {
  return @{
      keyDisplayName: user.displayName ? user.displayName : [NSNull null],
      keyEmail: user.email ? user.email : [NSNull null],
      @"emailVerified": @(user.emailVerified),
      @"isAnonymous": @(user.anonymous),
      @"metadata": @{
          @"creationTime": user.metadata.creationDate ? @(round(
              [user.metadata.creationDate timeIntervalSince1970] * 1000.0)) : [NSNull null],
          @"lastSignInTime": user.metadata.lastSignInDate ? @(round(
              [user.metadata.lastSignInDate timeIntervalSince1970] * 1000.0)) : [NSNull null],
      },
      keyPhoneNumber: user.phoneNumber ? user.phoneNumber : [NSNull null],
      keyPhotoUrl: user.photoURL ? [user.photoURL absoluteString] : [NSNull null],
      @"providerData": [self convertProviderData:user.providerData],
      keyProviderId: [user.providerID lowercaseString],
      @"refreshToken": user.refreshToken,
      keyUid: user.uid
  };
}

/**
 * Create a FIRActionCodeSettings instance from JS args
 * 
 * @param actionCodeSettings NSDictionary
 * @return FIRActionCodeSettings
 */
- (FIRActionCodeSettings *)buildActionCodeSettings:(NSDictionary *)actionCodeSettings {
  NSString *url = actionCodeSettings[keyUrl];
  NSDictionary *ios = actionCodeSettings[keyIOS];
  NSDictionary *android = actionCodeSettings[keyAndroid];
  BOOL handleCodeInApp = [actionCodeSettings[keyHandleCodeInApp] boolValue];

  FIRActionCodeSettings *settings = [[FIRActionCodeSettings alloc] init];

  if (android) {
    NSString *packageName = android[keyPackageName];
    NSString *minimumVersion = android[keyMinVersion];
    BOOL installApp = [android[keyInstallApp] boolValue];

    [settings setAndroidPackageName:packageName installIfNotAvailable:installApp minimumVersion:minimumVersion];
  }

  if (handleCodeInApp) {
    [settings setHandleCodeInApp:handleCodeInApp];
  }

  if (ios && ios[keyBundleId]) {
    [settings setIOSBundleID:ios[keyBundleId]];
  }

  if (url) {
    [settings setURL:[NSURL URLWithString:url]];
  }

  return settings;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[AUTH_STATE_CHANGED_EVENT, AUTH_ID_TOKEN_CHANGED_EVENT, PHONE_AUTH_STATE_CHANGED_EVENT];
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

@end

#else
@implementation RNFirebaseAuth
@end
#endif
