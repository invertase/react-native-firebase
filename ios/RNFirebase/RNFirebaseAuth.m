#import "RNFirebaseAuth.h"
#import "RNFirebaseErrors.h"
#import "RNFirebaseEvents.h"

@implementation RNFirebaseAuth

typedef void (^UserWithTokenResponse)(NSDictionary *, NSError *);

RCT_EXPORT_MODULE(RNFirebaseAuth);

/**
 signOut
 
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return
 */
RCT_EXPORT_METHOD(signOut:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject) {
    FIRUser *user = [FIRAuth auth].currentUser;
    
    if (user) {
        NSError *error;
        [[FIRAuth auth] signOut:&error];
        if (!error) [self promiseNoUser:resolve rejecter:reject isError:NO];
        // TODO authExceptionToDict
        else reject(@"auth/unknown", @"An unknown error has occurred.", error);
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
RCT_EXPORT_METHOD(signInAnonymously:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject) {
    [[FIRAuth auth] signInAnonymouslyWithCompletion:^(FIRUser *user, NSError *error) {
        if (error) {
            // TODO authExceptionToDict
            reject(@"auth/todo", [error localizedDescription], error);
        } else {
            [self promiseWithUser:resolve rejecter:reject user:user];
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
RCT_EXPORT_METHOD(signInWithEmailAndPassword:(NSString *)email pass:(NSString *)password resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject) {
    [[FIRAuth auth] signInWithEmail:email password:password completion:^(FIRUser *user, NSError *error) {
        if (error) {
            // TODO authExceptionToDict
            reject(@"auth/todo", [error localizedDescription], error);
        } else {
            [self promiseWithUser:resolve rejecter:reject user:user];
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
RCT_EXPORT_METHOD(createUserWithEmailAndPassword:(NSString *)email pass:(NSString *)password resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject) {
    [[FIRAuth auth] createUserWithEmail:email password:password completion:^(FIRUser *user, NSError *error) {
        if (error) {
            // TODO authExceptionToDict
            reject(@"auth/todo", [error localizedDescription], error);
        } else {
            [self promiseWithUser:resolve rejecter:reject user:user];
        }
    }];
}

/**
 deleteUser
 
 @param RCTPromiseResolveBlock resolve
 @param RCTPromiseRejectBlock reject
 @return return
 */
RCT_EXPORT_METHOD(delete:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject) {
    FIRUser *user = [FIRAuth auth].currentUser;
    
    if (user) {
        [user deleteWithCompletion:^(NSError *_Nullable error) {
            if (error) {
                // TODO authExceptionToDict
                reject(@"auth/unknown", @"An unknown error has occurred.", error);
            } else {
                [self promiseNoUser:resolve rejecter:reject isError:NO];
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
RCT_EXPORT_METHOD(getToken:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject) {
    FIRUser *user = [FIRAuth auth].currentUser;
    
    if (user) {
        [user getTokenWithCompletion:^(NSString *token, NSError *_Nullable error) {
            if (error) {
                // TODO authExceptionToDict
                reject(@"auth/unknown", @"An unknown error has occurred.", error);
            } else {
                resolve(token);
            }
        }];
    } else {
        [self promiseNoUser:resolve rejecter:reject isError:YES];
    }
}


// TODO ------------------------------------------------------- CLEAN UP --------------------------
// TODO ------------------------------------------------------- CLEAN UP --------------------------
// TODO ------------------------------------------------------- CLEAN UP --------------------------
// TODO ------------------------------------------------------- CLEAN UP --------------------------

RCT_EXPORT_METHOD(signInWithCustomToken:
                  (NSString *)customToken
                  callback:(RCTResponseSenderBlock) callback)
{
    [[FIRAuth auth]
     signInWithCustomToken:customToken
     completion:^(FIRUser *user, NSError *error) {
         
         if (user != nil) {
             [self userCallback:callback user:user];
         } else {
             [self userErrorCallback:callback error:error user:user msg:AUTH_ERROR_EVENT];
         }
     }];
}

RCT_EXPORT_METHOD(signInWithProvider:
                  (NSString *)provider
                  token:(NSString *)authToken
                  secret:(NSString *)authTokenSecret
                  callback:(RCTResponseSenderBlock)callback)
{
    FIRAuthCredential *credential = [self getCredentialForProvider:provider
                                                             token:authToken
                                                            secret:authTokenSecret];
    if (credential == nil) {
        NSDictionary *err = @{
                              @"error": @"Unhandled provider"
                              };
        return callback(@[err]);
    }
    
    @try {
        [[FIRAuth auth] signInWithCredential:credential
                                  completion:^(FIRUser *user, NSError *error) {
                                      if (user != nil) {
                                          // User is signed in.
                                          [self userCallback:callback user:user];
                                      } else {
                                          NSLog(@"An error occurred: %@", [error localizedDescription]);
                                          // No user is signed in.
                                          NSDictionary *err = @{
                                                                @"error": @"No user signed in",
                                                                @"description": [error localizedDescription]
                                                                };
                                          callback(@[err]);
                                      }
                                  }];
    } @catch (NSException *exception) {
        [RNFirebaseErrors handleException:exception
                             withCallback:callback];
    }
}

RCT_EXPORT_METHOD(addAuthStateListener)
{
    self->listening = true;
    self->authListenerHandle =
    [[FIRAuth auth] addAuthStateDidChangeListener:^(FIRAuth *_Nonnull auth, FIRUser *_Nullable user) {
        
        if (user != nil) {
            // User is signed in.
            [self userPropsFromFIRUserWithToken:user
                                    andCallback:^(NSDictionary *userProps, NSError * error) {
                                        if (error != nil) {
                                            [self
                                             sendJSEvent:AUTH_CHANGED_EVENT
                                             props: @{
                                                      @"eventName": @"userTokenError",
                                                      @"msg": [error localizedDescription]
                                                      }];
                                        } else {
                                            [self
                                             sendJSEvent:AUTH_CHANGED_EVENT
                                             props: @{
                                                      @"eventName": @"user",
                                                      @"authenticated": @(true),
                                                      @"user": userProps
                                                      }];
                                        }
                                    }];
        } else {
            // TODO: Update this with different error states
            NSDictionary *err = @{
                                  @"error": @"No user logged in"
                                  };
            [self sendJSEvent:AUTH_CHANGED_EVENT
                        props:@{
                                @"eventName": @"no_user",
                                @"authenticated": @(false),
                                @"error": err
                                }];
        }
    }];
}

RCT_EXPORT_METHOD(removeAuthStateListener:(RCTResponseSenderBlock)callback)
{
    if (self->authListenerHandle != nil) {
        [[FIRAuth auth] removeAuthStateDidChangeListener:self->authListenerHandle];
        self->listening = false;
        callback(@[[NSNull null]]);
    }
}

RCT_EXPORT_METHOD(getCurrentUser:(RCTResponseSenderBlock)callback)
{
    FIRUser *user = [FIRAuth auth].currentUser;
    
    if (user != nil) {
        [self userCallback:callback user:user];
    } else {
        // No user is signed in.
        NSDictionary *err = @{
                              @"user": @"No user logged in"
                              };
        callback(@[err]);
    }
}

RCT_EXPORT_METHOD(updateUserEmail:(NSString *)email
                  callback:(RCTResponseSenderBlock) callback)
{
    FIRUser *user = [FIRAuth auth].currentUser;
    
    if (user) {
        [user updateEmail:email completion:^(NSError *_Nullable error) {
            if (error) {
                // An error happened.
                [self userErrorCallback:callback error:error user:user msg:@"updateEmailError"];
            } else {
                // Email updated.
                [self userCallback:callback user:user];
            }
        }];
    } else {
        [self noUserCallback:callback isError:true];
    }
}

RCT_EXPORT_METHOD(updateUserPassword:(NSString *)newPassword
                  callback:(RCTResponseSenderBlock) callback)
{
    
    FIRUser *user = [FIRAuth auth].currentUser;
    
    if (user) {
        [user updatePassword:newPassword completion:^(NSError *_Nullable error) {
            if (error) {
                // An error happened.
                [self userErrorCallback:callback error:error user:user msg:@"updateUserPasswordError"];
            } else {
                // Email updated.
                [self userCallback:callback user:user];
            }
        }];
    } else {
        [self noUserCallback:callback isError:true];
    }
}

RCT_EXPORT_METHOD(sendPasswordResetWithEmail:(NSString *)email
                  callback:(RCTResponseSenderBlock) callback)
{
    
    [[FIRAuth auth] sendPasswordResetWithEmail:email
                                    completion:^(NSError *_Nullable error) {
                                        if (error) {
                                            // An error happened.
                                            NSDictionary *err = @{
                                                                  @"error": @"sendPasswordResetWithEmailError",
                                                                  @"description": error.localizedDescription
                                                                  };
                                            callback(@[err]);
                                        } else {
                                            // Email updated.
                                            callback(@[[NSNull null], @{
                                                           @"result": @(true)
                                                           }]);
                                        }
                                    }];
}

RCT_EXPORT_METHOD(getTokenWithCompletion:(RCTResponseSenderBlock) callback)
{
    FIRUser *user = [FIRAuth auth].currentUser;
    
    if (user) {
        [user getTokenWithCompletion:^(NSString *token , NSError *_Nullable error) {
            if (error) {
                [self userErrorCallback:callback error:error user:user msg:@"getTokenWithCompletion"];
            } else {
                callback(@[[NSNull null], token]);
            }
        }];
    } else {
        [self noUserCallback:callback isError:true];
    }
}

RCT_EXPORT_METHOD(reauthenticateWithCredentialForProvider:
                  (NSString *)provider
                  token:(NSString *)authToken
                  secret:(NSString *)authTokenSecret
                  callback:(RCTResponseSenderBlock)callback)
{
    FIRAuthCredential *credential = [self getCredentialForProvider:provider
                                                             token:authToken
                                                            secret:authTokenSecret];
    if (credential == nil) {
        NSDictionary *err = @{
                              @"error": @"Unhandled provider"
                              };
        return callback(@[err]);
    }
    
    FIRUser *user = [FIRAuth auth].currentUser;
    
    [user reauthenticateWithCredential:credential completion:^(NSError *_Nullable error) {
        if (error) {
            [self userErrorCallback:callback error:error user:user msg:@"reauthenticateWithCredentialForProviderError"];
        } else {
            callback(@[[NSNull null], @{@"result": @(true)}]);
        }
    }];
}


RCT_EXPORT_METHOD(updateUserProfile:(NSDictionary *)userProps
                  callback:(RCTResponseSenderBlock) callback)
{
    FIRUser *user = [FIRAuth auth].currentUser;
    
    if (user) {
        FIRUserProfileChangeRequest *changeRequest = [user profileChangeRequest];
        
        NSMutableArray *allKeys = [[userProps allKeys] mutableCopy];
        for (NSString *key in allKeys) {
            // i.e. changeRequest.displayName = userProps[displayName];
            @try {
                if ([key isEqualToString:@"photoURL"]) {
                    NSURL *url = [NSURL URLWithString:[userProps valueForKey:key]];
                    [changeRequest setValue:url forKey:key];
                } else {
                    [changeRequest setValue:[userProps objectForKey:key] forKey:key];
                }
            }
            @catch (NSException *exception) {
                NSLog(@"Exception occurred while configuring: %@", exception);
            }
            @finally {
                [changeRequest commitChangesWithCompletion:^(NSError *_Nullable error) {
                    if (error) {
                        // An error happened.
                        [self userErrorCallback:callback error:error user:user msg:@"updateEmailError"];
                    } else {
                        // Profile updated.
                        [self userCallback:callback user:user];
                    }
                }];
            }
        }
    } else {
        [self noUserCallback:callback isError:true];
    }
}

- (void) userPropsFromFIRUserWithToken:(FIRUser *) user
                           andCallback:(UserWithTokenResponse) callback
{
    NSMutableDictionary *userProps = [[self firebaseUserToDict:user] mutableCopy];
    [user getTokenWithCompletion:^(NSString * _Nullable token, NSError * _Nullable error) {
        if (error != nil) {
            return callback(nil, error);
        }
        
        [userProps setValue:token forKey:@"idToken"];
        callback(userProps, nil);
    }];
}

- (FIRAuthCredential *)getCredentialForProvider:(NSString *)provider token:(NSString *)authToken secret:(NSString *)authTokenSecret {
    FIRAuthCredential *credential;
    if ([provider compare:@"twitter" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
        credential = [FIRTwitterAuthProvider credentialWithToken:authToken
                                                          secret:authTokenSecret];
    } else if ([provider compare:@"facebook" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
        credential = [FIRFacebookAuthProvider credentialWithAccessToken:authToken];
    } else if ([provider compare:@"google" options:NSCaseInsensitiveSearch] == NSOrderedSame) {
        credential = [FIRGoogleAuthProvider credentialWithIDToken:authToken
                                                      accessToken:authTokenSecret];
    } else {
        NSLog(@"Provider not yet handled: %@", provider);
    }
    return credential;
}

// Not sure how to get away from this... yet
- (NSArray<NSString *> *)supportedEvents {
    return @[AUTH_CHANGED_EVENT, AUTH_ANONYMOUS_ERROR_EVENT, AUTH_ERROR_EVENT];
}

- (void) sendJSEvent:(NSString *)title
               props:(NSDictionary *)props
{
    @try {
        if (self->listening) {
            [self sendEventWithName:title
                               body:props];
        }
    }
    @catch (NSException *err) {
        NSLog(@"An error occurred in sendJSEvent: %@", [err debugDescription]);
    }
}


- (void) noUserCallback:(RCTResponseSenderBlock) callback
                isError:(Boolean) isError {
    if (isError) {
        NSDictionary *err = @{
                              @"error": @"Unhandled provider"
                              };
        return callback(@[err]);
        
    }
    return callback(@[[NSNull null], [NSNull null]]);
}

- (void) userErrorCallback:(RCTResponseSenderBlock) callback
                     error:(NSError *)error
                      user:(FIRUser *) user
                       msg:(NSString *) msg {
    // An error happened.
    NSDictionary *err = [RNFirebaseErrors handleFirebaseError:msg
                                                        error:error
                                                     withUser:user];
    callback(@[err]);
}

- (void) userCallback:(RCTResponseSenderBlock) callback user:(FIRUser *) user {
    NSDictionary *userProps = [self firebaseUserToDict:user];
    callback(@[[NSNull null], userProps]);
}

// END ------------------------------------------------------- CLEAN UP -^ -----------------------
// END ------------------------------------------------------- CLEAN UP --------------------------
// END ------------------------------------------------------- CLEAN UP --------------------------
// END ------------------------------------------------------- CLEAN UP --------------------------


- (NSDictionary *) authExceptionToDict:(NSError *) error {
    // TODO
    //    NSDictionary *evt = @{ @"eventName": AUTH_ANONYMOUS_ERROR_EVENT,
    //                           @"msg": [error localizedDescription] };
}




/**
 Resolve or reject a promise based on isError value
 
 @param resolve RCTPromiseResolveBlock
 @param reject RCTPromiseRejectBlock
 @param isError BOOL
 */
- (void) promiseNoUser:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject isError:(BOOL) isError {
    if (isError) {
        reject(@"auth/no_current_user", @"No user currently signed in.", nil);
    } else {
        resolve([NSNull null]);
    }
}

/**
 Resolve or reject a promise based on FIRUser value existance
 
 @param resolve RCTPromiseResolveBlock
 @param reject RCTPromiseRejectBlock
 @param user FIRUser
 */
- (void) promiseWithUser:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject user:(FIRUser *) user {
    if (user) {
        NSDictionary *userDict = [self firebaseUserToDict:user];
        resolve(userDict);
    } else {
        [self promiseNoUser:resolve rejecter:reject isError:YES];
    }
    
}

/**
 Converts a FIRUser instance into a dictionary to send via RNBridge
 
 @param user FIRUser
 @return NSDictionary
 */
- (NSDictionary *) firebaseUserToDict:(FIRUser *) user {
    NSMutableDictionary *userDict = [
                                     @{ @"uid": user.uid,
                                        @"email": user.email ? user.email : [NSNull null],
                                        @"emailVerified": @(user.emailVerified),
                                        @"isAnonymous": @(user.anonymous),
                                        @"displayName": user.displayName ? user.displayName : [NSNull null],
                                        @"refreshToken": user.refreshToken,
                                        @"providerId": [user.providerID lowercaseString]
                                        }
                                     mutableCopy
                                     ];
    
    if ([user valueForKey:@"photoURL"] != nil) {
        [userDict setValue: [NSString stringWithFormat:@"%@", user.photoURL] forKey:@"photoURL"];
    }
    
    return userDict;
}

@end
