#import "RNFirebaseAuth.h"
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"
#import "RCTDefines.h"


#if __has_include(<FirebaseAuth/FIRAuth.h>)

@implementation RNFirebaseAuth
RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        _authStateHandlers = [[NSMutableDictionary alloc] init];
        _idTokenHandlers = [[NSMutableDictionary alloc] init];
    }
    return self;
}

/**
 addAuthStateListener

 */
RCT_EXPORT_METHOD(addAuthStateListener:
    (NSString *) appDisplayName) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

    if (![_authStateHandlers valueForKey:firApp.name]) {
        FIRAuthStateDidChangeListenerHandle newListenerHandle = [[FIRAuth authWithApp:firApp] addAuthStateDidChangeListener:^(FIRAuth *_Nonnull auth, FIRUser *_Nullable user) {
            if (user != nil) {
                [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:AUTH_STATE_CHANGED_EVENT body:@{@"user": [self firebaseUserToDict:user]}];
            } else {
                [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:AUTH_STATE_CHANGED_EVENT body:@{}];
            }
        }];

        _authStateHandlers[firApp.name] = [NSValue valueWithNonretainedObject:newListenerHandle];
    }
}

/**
 removeAuthStateListener

 */
RCT_EXPORT_METHOD(removeAuthStateListener:
    (NSString *) appDisplayName) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

    if ([_authStateHandlers valueForKey:firApp.name]) {
        [[FIRAuth authWithApp:firApp] removeAuthStateDidChangeListener:[_authStateHandlers valueForKey:firApp.name]];
        [_authStateHandlers removeObjectForKey:firApp.name];
    }
}

/**
 addIdTokenListener

 */
RCT_EXPORT_METHOD(addIdTokenListener:
                  (NSString *) appDisplayName) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

    if (![_idTokenHandlers valueForKey:firApp.name]) {
        FIRIDTokenDidChangeListenerHandle newListenerHandle = [[FIRAuth authWithApp:firApp] addIDTokenDidChangeListener:^(FIRAuth * _Nonnull auth, FIRUser * _Nullable user) {
            if (user != nil) {
                [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:AUTH_ID_TOKEN_CHANGED_EVENT body:@{@"user": [self firebaseUserToDict:user]}];
            } else {
                [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:AUTH_ID_TOKEN_CHANGED_EVENT body:@{}];
            }
        }];

        _idTokenHandlers[firApp.name] = [NSValue valueWithNonretainedObject:newListenerHandle];
    }
}

/**
 removeAuthStateListener

 */
RCT_EXPORT_METHOD(removeIdTokenListener:
                  (NSString *) appDisplayName) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

    if ([_idTokenHandlers valueForKey:firApp.name]) {
        [[FIRAuth authWithApp:firApp] removeIDTokenDidChangeListener:[_idTokenHandlers valueForKey:firApp.name]];
        [_idTokenHandlers removeObjectForKey:firApp.name];
    }
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
RCT_EXPORT_METHOD(signInAnonymously:(NSString *) appDisplayName
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self signInAnonymously:appDisplayName withData:false resolver:resolve rejecter:reject];
}

/**
 signInAnonymouslyAndRetrieveData
 
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInAnonymouslyAndRetrieveData:(NSString *) appDisplayName
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self signInAnonymously:appDisplayName withData:true resolver:resolve rejecter:reject];
}

-(void)signInAnonymously:(NSString *)appDisplayName
                withData:(BOOL)withData
                resolver:(RCTPromiseResolveBlock) resolve
                rejecter:(RCTPromiseRejectBlock) reject {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    
    [[FIRAuth authWithApp:firApp] signInAnonymouslyWithCompletion:^(FIRAuthDataResult *authResult, NSError *error) {
        if (error) {
            [self promiseRejectAuthException:reject error:error];
        } else if (withData) {
            [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
        } else {
            [self promiseWithUser:resolve rejecter:reject user:authResult.user];
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
RCT_EXPORT_METHOD(signInWithEmailAndPassword:(NSString *) appDisplayName
                  email:(NSString *) email
                  pass:(NSString *) password
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self signInWithEmail:appDisplayName email:email password:password withData:false resolver:resolve rejecter:reject];
}

/**
 signInAndRetrieveDataWithEmailAndPassword
 
 @param NSString NSString email
 @param NSString NSString password
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(signInAndRetrieveDataWithEmailAndPassword:(NSString *) appDisplayName
                  email:(NSString *) email
                  password:(NSString *) password
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self signInWithEmail:appDisplayName email:email password:password withData:true resolver:resolve rejecter:reject];
}

-(void)signInWithEmail:(NSString *)appDisplayName
                 email:(NSString *)email
              password:(NSString *)password
              withData:(BOOL)withData
              resolver:(RCTPromiseResolveBlock) resolve
              rejecter:(RCTPromiseRejectBlock) reject {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    
    [[FIRAuth authWithApp:firApp] signInWithEmail:email password:password completion:^(FIRAuthDataResult *authResult, NSError *error) {
        if (error) {
            [self promiseRejectAuthException:reject error:error];
        } else if (withData) {
            [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
        } else {
            [self promiseWithUser:resolve rejecter:reject user:authResult.user];
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
RCT_EXPORT_METHOD(signInWithEmailLink:(NSString *) appDisplayName
                  email:(NSString *) email
                  emailLink:(NSString *) emailLink
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    
    [[FIRAuth authWithApp:firApp] signInWithEmail:email link:emailLink completion:^(FIRAuthDataResult *authResult, NSError *error) {
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
RCT_EXPORT_METHOD(createUserWithEmailAndPassword:(NSString *) appDisplayName
                  email:(NSString *) email
                  pass:(NSString *) password
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self createUserWithEmail:appDisplayName email:email password:password withData:false resolver:resolve rejecter:reject];
}

/**
 createUserAndRetrieveDataWithEmailAndPassword
 
 @param NSString NSString email
 @param NSString NSString password
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(createUserAndRetrieveDataWithEmailAndPassword:(NSString *) appDisplayName
                  email:(NSString *) email
                  password:(NSString *) password
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self createUserWithEmail:appDisplayName email:email password:password withData:true resolver:resolve rejecter:reject];
}

-(void)createUserWithEmail:(NSString *)appDisplayName
                     email:(NSString *)email
                  password:(NSString *)password
                  withData:(BOOL)withData
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    
    [[FIRAuth authWithApp:firApp] createUserWithEmail:email password:password completion:^(FIRAuthDataResult *authResult, NSError *error) {
        if (error) {
            [self promiseRejectAuthException:reject error:error];
        } else if (withData) {
            [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
        } else {
            [self promiseWithUser:resolve rejecter:reject user:authResult.user];
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
        [self reloadAndReturnUser:user resolver:resolve rejecter: reject];
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
RCT_EXPORT_METHOD(sendEmailVerification:(NSString *) appDisplayName
                     actionCodeSettings:(NSDictionary *) actionCodeSettings
                               resolver:(RCTPromiseResolveBlock) resolve
                               rejecter:(RCTPromiseRejectBlock) reject) {
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
                [self reloadAndReturnUser:user resolver:resolve rejecter: reject];
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
                if ([key isEqualToString:@"photoURL"]) {
                    NSURL *url = [NSURL URLWithString:[props valueForKey:key]];
                    [changeRequest setValue:url forKey:key];
                } else {
                    [changeRequest setValue:props[key] forKey:key];
                }
            } @catch (NSException *exception) {
                NSLog(@"Exception occurred while configuring: %@", exception);
            }
        }

        [changeRequest commitChangesWithCompletion:^(NSError *_Nullable error) {
            if (error) {
                [self promiseRejectAuthException:reject error:error];
            } else {
                [self reloadAndReturnUser:user resolver:resolve rejecter: reject];
            }
        }];
    } else {
        [self promiseNoUser:resolve rejecter:reject isError:YES];
    }
}

/**
 getToken

 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(getToken:
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
 signInWithCredential

 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInWithCredential:(NSString *) appDisplayName
                  provider:(NSString *) provider
                  token:(NSString *) authToken
                  secret:(NSString *) authSecret
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self signInWithCredential:appDisplayName provider:provider token:authToken secret:authSecret withData:false resolver:resolve rejecter:reject];
}

/**
 signInAndRetrieveDataWithCredential
 
 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInAndRetrieveDataWithCredential:(NSString *) appDisplayName
                  provider:(NSString *) provider
                  token:(NSString *) authToken
                  secret:(NSString *) authSecret
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self signInWithCredential:appDisplayName provider:provider token:authToken secret:authSecret withData:true resolver:resolve rejecter:reject];
}

-(void)signInWithCredential:(NSString *)appDisplayName
                   provider:(NSString *) provider
                      token:(NSString *) authToken
                     secret:(NSString *) authSecret
                   withData:(BOOL)withData
                   resolver:(RCTPromiseResolveBlock) resolve
                   rejecter:(RCTPromiseRejectBlock) reject {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    
    FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];
    
    if (credential == nil) {
        return reject(@"auth/invalid-credential", @"The supplied auth credential is malformed, has expired or is not currently supported.", nil);
    }
    
    [[FIRAuth authWithApp:firApp] signInAndRetrieveDataWithCredential:credential completion:^(FIRAuthDataResult *authResult, NSError *error) {
        if (error) {
            [self promiseRejectAuthException:reject error:error];
        } else if (withData) {
            [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
        } else {
            [self promiseWithUser:resolve rejecter:reject user:authResult.user];
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
            [self promiseNoUser:resolve rejecter:reject isError:NO];
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

    [[FIRAuth authWithApp:firApp] checkActionCode:code completion:^(FIRActionCodeInfo *_Nullable info, NSError *_Nullable error) {
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
            }

            NSDictionary *result = @{@"data": @{@"email": [info dataForKey:FIRActionCodeEmailKey], @"fromEmail": [info dataForKey:FIRActionCodeFromEmailKey],}, @"actionType": actionType,};

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
RCT_EXPORT_METHOD(sendPasswordResetEmail:(NSString *) appDisplayName
                                   email:(NSString *) email
                      actionCodeSettings:(NSDictionary *) actionCodeSettings
                                resolver:(RCTPromiseResolveBlock) resolve
                                rejecter:(RCTPromiseRejectBlock) reject) {
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
RCT_EXPORT_METHOD(sendSignInLinkToEmail:(NSString *) appDisplayName
                  email:(NSString *) email
                  actionCodeSettings:(NSDictionary *) actionCodeSettings
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
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
 signInAndRetrieveDataWithCustomToken

 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInAndRetrieveDataWithCustomToken:(NSString *) appDisplayName
                  customToken:(NSString *) customToken
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self signInWithCustomToken:appDisplayName customToken:customToken withData:true resolver:resolve rejecter:reject];
}

/**
 signInWithCustomToken
 
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signInWithCustomToken:(NSString *) appDisplayName
                  customToken:(NSString *) customToken
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    [self signInWithCustomToken:appDisplayName customToken:customToken withData:false resolver:resolve rejecter:reject];
}

-(void)signInWithCustomToken:(NSString *)appDisplayName
                 customToken:(NSString *) customToken
                    withData:(BOOL)withData
                    resolver:(RCTPromiseResolveBlock) resolve
                    rejecter:(RCTPromiseRejectBlock) reject {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    
    [[FIRAuth authWithApp:firApp] signInWithCustomToken:customToken completion:^(FIRAuthDataResult *authResult, NSError *error) {
        if (error) {
            [self promiseRejectAuthException:reject error:error];
        } else if (withData) {
            [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
        } else {
            [self promiseWithUser:resolve rejecter:reject user:authResult.user];
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
RCT_EXPORT_METHOD(signInWithPhoneNumber:(NSString *) appDisplayName
            phoneNumber:(NSString *) phoneNumber
            resolver:(RCTPromiseResolveBlock) resolve
            rejecter:(RCTPromiseRejectBlock) reject) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

    [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firApp]] verifyPhoneNumber:phoneNumber UIDelegate:nil completion:^(NSString * _Nullable verificationID, NSError * _Nullable error) {
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
RCT_EXPORT_METHOD(verifyPhoneNumber:(NSString *) appDisplayName
                  phoneNumber:(NSString *) phoneNumber
                  requestKey:(NSString *) requestKey) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

    [[FIRPhoneAuthProvider providerWithAuth:[FIRAuth authWithApp:firApp]] verifyPhoneNumber:phoneNumber UIDelegate:nil completion:^(NSString * _Nullable verificationID, NSError * _Nullable error) {
        if (error) {
            NSDictionary * jsError = [self getJSError:(error)];
            NSDictionary *body = @{
                                   @"type": @"onVerificationFailed",
                                   @"requestKey":requestKey,
                                   @"state": @{@"error": jsError},
                                  };
            [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:PHONE_AUTH_STATE_CHANGED_EVENT body:body];
        } else {
            NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
            [defaults setObject:verificationID forKey:@"authVerificationID"];
            NSDictionary *body = @{
                                   @"type": @"onCodeSent",
                                   @"requestKey":requestKey,
                                   @"state": @{@"verificationId": verificationID},
                                  };
            [RNFirebaseUtil sendJSEventWithAppName:self app:firApp name:PHONE_AUTH_STATE_CHANGED_EVENT body:body];
        }
    }];
}

RCT_EXPORT_METHOD(_confirmVerificationCode:(NSString *) appDisplayName
            verificationCode:(NSString *) verificationCode
            resolver:(RCTPromiseResolveBlock) resolve
            rejecter:(RCTPromiseRejectBlock) reject) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *verificationId = [defaults stringForKey:@"authVerificationID"];
    FIRAuthCredential *credential = [[FIRPhoneAuthProvider provider] credentialWithVerificationID:verificationId verificationCode:verificationCode];

    [[FIRAuth authWithApp:firApp] signInAndRetrieveDataWithCredential:credential completion:^(FIRAuthDataResult *authResult, NSError *error) {
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
RCT_EXPORT_METHOD(linkWithCredential:(NSString *) appDisplayName
                            provider:(NSString *) provider
                           authToken:(NSString *) authToken
                          authSecret:(NSString *) authSecret
                            resolver:(RCTPromiseResolveBlock) resolve
                            rejecter:(RCTPromiseRejectBlock) reject) {
    [self linkWithCredential:appDisplayName provider:provider authToken:authToken authSecret:authSecret withData:false resolver:resolve rejecter:reject];
}

/**
 linkAndRetrieveDataWithCredential

 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(linkAndRetrieveDataWithCredential:(NSString *) appDisplayName
                                           provider:(NSString *) provider
                                          authToken:(NSString *) authToken
                                         authSecret:(NSString *) authSecret
                                           resolver:(RCTPromiseResolveBlock) resolve
                                           rejecter:(RCTPromiseRejectBlock) reject) {
    [self linkWithCredential:appDisplayName provider:provider authToken:authToken authSecret:authSecret withData:true resolver:resolve rejecter:reject];
}

-(void)linkWithCredential:(NSString *)appDisplayName
                 provider:(NSString *)provider
                authToken:(NSString *)authToken
               authSecret:(NSString *)authSecret
                 withData:(BOOL)withData
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];
    
    if (credential == nil) {
        return reject(@"auth/invalid-credential", @"The supplied auth credential is malformed, has expired or is not currently supported.", nil);
    }
    
    FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;
    if (user) {
        [user linkAndRetrieveDataWithCredential:credential
                                     completion:^(FIRAuthDataResult * _Nullable authResult, NSError * _Nullable error) {
                                         if (error) {
                                             [self promiseRejectAuthException:reject error:error];
                                         } else if (withData) {
                                             [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
                                         } else {
                                             [self promiseWithUser:resolve rejecter:reject user:authResult.user];
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
                [self reloadAndReturnUser:user resolver:resolve rejecter: reject];
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
RCT_EXPORT_METHOD(reauthenticateWithCredential:(NSString *) appDisplayName
                                      provider:(NSString *) provider
                                     authToken:(NSString *) authToken
                                    authSecret:(NSString *) authSecret
                                      resolver:(RCTPromiseResolveBlock) resolve
                                      rejecter:(RCTPromiseRejectBlock) reject) {
    [self reauthenticateWithCredential:appDisplayName provider:provider authToken:authToken authSecret:authSecret withData:false resolver:resolve rejecter:reject];
}

/**
 reauthenticateAndRetrieveDataWithCredential
 
 @param NSString provider
 @param NSString authToken
 @param NSString authSecret
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(reauthenticateAndRetrieveDataWithCredential:(NSString *) appDisplayName
                                                     provider:(NSString *) provider
                                                    authToken:(NSString *) authToken
                                                   authSecret:(NSString *) authSecret
                                                     resolver:(RCTPromiseResolveBlock) resolve
                                                     rejecter:(RCTPromiseRejectBlock) reject) {
    [self reauthenticateWithCredential:appDisplayName provider:provider authToken:authToken authSecret:authSecret withData:true resolver:resolve rejecter:reject];
}

-(void)reauthenticateWithCredential:(NSString *) appDisplayName
                           provider:(NSString *) provider
                          authToken:(NSString *) authToken
                         authSecret:(NSString *) authSecret
                           withData:(BOOL) withData
                           resolver:(RCTPromiseResolveBlock) resolve
                           rejecter:(RCTPromiseRejectBlock) reject {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    
    FIRAuthCredential *credential = [self getCredentialForProvider:provider token:authToken secret:authSecret];
    
    if (credential == nil) {
        return reject(@"auth/invalid-credential", @"The supplied auth credential is malformed, has expired or is not currently supported.", nil);
    }
    
    FIRUser *user = [FIRAuth authWithApp:firApp].currentUser;
    
    if (user) {
        [user reauthenticateAndRetrieveDataWithCredential:credential completion:^(FIRAuthDataResult * _Nullable authResult, NSError * _Nullable error) {
            if (error) {
                [self promiseRejectAuthException:reject error:error];
            } else if (withData) {
                [self promiseWithAuthResult:resolve rejecter:reject authResult:authResult];
            } else {
                [self promiseWithUser:resolve rejecter:reject user:authResult.user];
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

    [[FIRAuth authWithApp:firApp] fetchSignInMethodsForEmail:email completion:^(NSArray<NSString *> *_Nullable providers, NSError *_Nullable error) {
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
        credential = [[FIRPhoneAuthProvider provider] credentialWithVerificationID:authToken verificationCode:authTokenSecret];
    } else if ([provider compare:@"oauth" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
        credential = [FIROAuthProvider credentialWithProviderID:@"oauth" IDToken:authToken accessToken:authTokenSecret];
    } else {
        NSLog(@"Provider not yet handled: %@", provider);
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
RCT_EXPORT_METHOD(useDeviceLanguage:(NSString *) appDisplayName) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];

    [[FIRAuth authWithApp:firApp] useAppLanguage];
}

RCT_EXPORT_METHOD(verifyPasswordResetCode:(NSString *) appDisplayName
                  code:(NSString *)code
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    FIRApp *firApp = [RNFirebaseUtil getApp:appDisplayName];
    [[FIRAuth authWithApp:firApp] verifyPasswordResetCode:code completion:^(NSString * _Nullable email, NSError * _Nullable error) {
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
    [user reloadWithCompletion:^(NSError * _Nullable error) {
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
    NSDictionary * jsError = [self getJSError:(error)];
    reject([jsError valueForKey:@"code"], [jsError valueForKey:@"message"], error);
}

/**
 Reject a promise with an auth exception

 @param error NSError
 */
- (NSDictionary *)getJSError:(NSError *)error {
    NSString *code = @"auth/unknown";
    NSString *message = [error localizedDescription];
    NSString *nativeErrorMessage = [error localizedDescription];

    switch (error.code) {
        case FIRAuthErrorCodeInvalidCustomToken:
            code = @"auth/invalid-custom-token";
            message = @"The custom token format is incorrect. Please check the documentation.";
            break;
        case FIRAuthErrorCodeCustomTokenMismatch:
            code = @"auth/custom-token-mismatch";
            message = @"The custom token corresponds to a different audience.";
            break;
        case FIRAuthErrorCodeInvalidCredential:
            code = @"auth/invalid-credential";
            message = @"The supplied auth credential is malformed or has expired.";
            break;
        case FIRAuthErrorCodeInvalidEmail:
            code = @"auth/invalid-email";
            message = @"The email address is badly formatted.";
            break;
        case FIRAuthErrorCodeWrongPassword:
            code = @"auth/wrong-password";
            message = @"The password is invalid or the user does not have a password.";
            break;
        case FIRAuthErrorCodeUserMismatch:
            code = @"auth/user-mismatch";
            message = @"The supplied credentials do not correspond to the previously signed in user.";
            break;
        case FIRAuthErrorCodeRequiresRecentLogin:
            code = @"auth/requires-recent-login";
            message = @"This operation is sensitive and requires recent authentication. Log in again before retrying this request.";
            break;
        case FIRAuthErrorCodeAccountExistsWithDifferentCredential:
            code = @"auth/account-exists-with-different-credential";
            message = @"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.";
            break;
        case FIRAuthErrorCodeEmailAlreadyInUse:
            code = @"auth/email-already-in-use";
            message = @"The email address is already in use by another account.";
            break;
        case FIRAuthErrorCodeCredentialAlreadyInUse:
            code = @"auth/credential-already-in-use";
            message = @"This credential is already associated with a different user account.";
            break;
        case FIRAuthErrorCodeUserDisabled:
            code = @"auth/user-disabled";
            message = @"The user account has been disabled by an administrator.";
            break;
        case FIRAuthErrorCodeUserTokenExpired:
            code = @"auth/user-token-expired";
            message = @"The user's credential is no longer valid. The user must sign in again.";
            break;
        case FIRAuthErrorCodeUserNotFound:
            code = @"auth/user-not-found";
            message = @"There is no user record corresponding to this identifier. The user may have been deleted.";
            break;
        case FIRAuthErrorCodeInvalidUserToken:
            code = @"auth/invalid-user-token";
            message = @"The user's credential is no longer valid. The user must sign in again.";
            break;
        case FIRAuthErrorCodeWeakPassword:
            code = @"auth/weak-password";
            message = @"The given password is invalid.";
            break;
        case FIRAuthErrorCodeOperationNotAllowed:
            code = @"auth/operation-not-allowed";
            message = @"This operation is not allowed. You must enable this service in the console.";
            break;
        case FIRAuthErrorCodeNetworkError:
            code = @"auth/network-error";
            message = @"A network error has occurred, please try again.";
            break;
        case FIRAuthErrorCodeInternalError:
            code = @"auth/internal-error";
            message = @"An internal error has occurred, please try again.";
            break;

            // unsure of the below codes so leaving them as the default error message
        case FIRAuthErrorCodeTooManyRequests:
            code = @"auth/too-many-requests";
            break;
        case FIRAuthErrorCodeProviderAlreadyLinked:
            code = @"auth/provider-already-linked";
            break;
        case FIRAuthErrorCodeNoSuchProvider:
            code = @"auth/no-such-provider";
            break;
        case FIRAuthErrorCodeInvalidAPIKey:
            code = @"auth/invalid-api-key";
            break;
        case FIRAuthErrorCodeAppNotAuthorized:
            code = @"auth/app-not-authorised";
            break;
        case FIRAuthErrorCodeExpiredActionCode:
            code = @"auth/expired-action-code";
            break;
        case FIRAuthErrorCodeInvalidMessagePayload:
            code = @"auth/invalid-message-payload";
            break;
        case FIRAuthErrorCodeInvalidSender:
            code = @"auth/invalid-sender";
            break;
        case FIRAuthErrorCodeInvalidRecipientEmail:
            code = @"auth/invalid-recipient-email";
            break;
        case FIRAuthErrorCodeKeychainError:
            code = @"auth/keychain-error";
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
 Resolve or reject a promise based on FIRUser value existance

 @param resolve RCTPromiseResolveBlock
 @param reject RCTPromiseRejectBlock
 @param user FIRUser
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
 Resolve or reject a promise based on FIRAuthResult value existance

 @param resolve RCTPromiseResolveBlock
 @param reject RCTPromiseRejectBlock
 @param authResult FIRAuthDataResult
 */
- (void)promiseWithAuthResult:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject authResult:(FIRAuthDataResult *)authResult {
    if (authResult && authResult.user) {
        NSDictionary *userDict = [self firebaseUserToDict:authResult.user];
        NSDictionary *authResultDict = @{
                                         @"additionalUserInfo": authResult.additionalUserInfo ? @{
                                                 @"isNewUser": @(authResult.additionalUserInfo.isNewUser),
                                                 @"profile": authResult.additionalUserInfo.profile ? authResult.additionalUserInfo.profile : [NSNull null],
                                                 @"providerId": authResult.additionalUserInfo.providerID ? authResult.additionalUserInfo.providerID : [NSNull null],
                                                 @"username": authResult.additionalUserInfo.username ? authResult.additionalUserInfo.username : [NSNull null]
                                         } : [NSNull null],
                                         @"user": userDict
                                       };
        resolve(authResultDict);
    } else {
        [self promiseNoUser:resolve rejecter:reject isError:YES];
    }

}

/**
 Converts an array of FIRUserInfo instances into the correct format to match the web sdk

 @param providerData FIRUser.providerData
 @return NSArray
 */
- (NSArray <NSObject *> *)convertProviderData:(NSArray <id <FIRUserInfo>> *)providerData {
    NSMutableArray *output = [NSMutableArray array];

    for (id <FIRUserInfo> userInfo in providerData) {
        NSMutableDictionary *pData = [NSMutableDictionary dictionary];

        if (userInfo.providerID != nil) {
            [pData setValue:userInfo.providerID forKey:@"providerId"];
        }

        if (userInfo.uid != nil) {
            [pData setValue:userInfo.uid forKey:@"uid"];
        }

        if (userInfo.displayName != nil) {
            [pData setValue:userInfo.displayName forKey:@"displayName"];
        }

        if (userInfo.photoURL != nil) {
            [pData setValue:[userInfo.photoURL absoluteString] forKey:@"photoURL"];
        }

        if (userInfo.email != nil) {
            [pData setValue:userInfo.email forKey:@"email"];
        }

        if (userInfo.phoneNumber != nil) {
            [pData setValue:userInfo.phoneNumber forKey:@"phoneNumber"];
        }

        [output addObject:pData];
    }

    return output;
}

/**
 * React native constant exports - exports native firebase apps mainly
 * @return NSDictionary
 */
- (NSDictionary *)constantsToExport {
    NSMutableDictionary *constants = [NSMutableDictionary new];
    NSDictionary *firApps = [FIRApp allApps];
    NSMutableDictionary *appLanguage = [NSMutableDictionary new];

    for (id key in firApps) {
        FIRApp *firApp = firApps[key];

        appLanguage[firApp.name] = [FIRAuth authWithApp:firApp].languageCode;
    }

    constants[@"APP_LANGUAGE"] = appLanguage;
    return constants;
}

/**
 Converts a FIRUser instance into a dictionary to send via RNBridge

 @param user FIRUser
 @return NSDictionary
 */
- (NSDictionary *)firebaseUserToDict:(FIRUser *)user {
    return @{
             @"displayName": user.displayName ? user.displayName : [NSNull null],
             @"email": user.email ? user.email : [NSNull null],
             @"emailVerified": @(user.emailVerified),
             @"isAnonymous": @(user.anonymous),
             @"metadata": @{
                     @"creationTime": user.metadata.creationDate ? @(round([user.metadata.creationDate timeIntervalSince1970] * 1000.0)): [NSNull null],
                     @"lastSignInTime": user.metadata.lastSignInDate ? @(round([user.metadata.lastSignInDate timeIntervalSince1970] * 1000.0)) : [NSNull null],
             },
             @"phoneNumber": user.phoneNumber ? user.phoneNumber : [NSNull null],
             @"photoURL": user.photoURL ? [user.photoURL absoluteString] : [NSNull null],
             @"providerData": [self convertProviderData:user.providerData],
             @"providerId": [user.providerID lowercaseString],
             @"refreshToken": user.refreshToken,
             @"uid": user.uid
            };
}

- (FIRActionCodeSettings *)buildActionCodeSettings:(NSDictionary *)actionCodeSettings {
    FIRActionCodeSettings *settings = [[FIRActionCodeSettings alloc] init];
    NSDictionary *android = actionCodeSettings[@"android"];
    BOOL handleCodeInApp = actionCodeSettings[@"handleCodeInApp"];
    NSDictionary *ios = actionCodeSettings[@"iOS"];
    NSString *url = actionCodeSettings[@"url"];
    if (android) {
        BOOL installApp = android[@"installApp"];
        NSString *minimumVersion = android[@"minimumVersion"];
        NSString *packageName = android[@"packageName"];
        [settings setAndroidPackageName:packageName installIfNotAvailable:installApp minimumVersion:minimumVersion];
    }
    if (handleCodeInApp) {
        [settings setHandleCodeInApp:handleCodeInApp];
    }
    if (ios && ios[@"bundleId"]) {
        [settings setIOSBundleID:ios[@"bundleId"]];
    }
    if (url) {
        [settings setURL:[NSURL URLWithString:url]];
    }
    return settings;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[AUTH_STATE_CHANGED_EVENT, AUTH_ID_TOKEN_CHANGED_EVENT, PHONE_AUTH_STATE_CHANGED_EVENT];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation RNFirebaseAuth
@end
#endif
