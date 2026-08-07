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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseAppCheck/FirebaseAppCheck.h>)
#import <FirebaseAppCheck/FirebaseAppCheck.h>
#import <FirebaseCore/FirebaseCore.h>
#else
@import FirebaseCore;
@import FirebaseAppCheck;
#endif

#import <React/RCTInvalidating.h>
#import <React/RCTUtils.h>

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBAppCheckModule.h"
#import "RNFBAppCheckProviderFactory.h"
#import "RNFBAppCheckTurboModules.h"

@interface RNFBAppCheckModule () <NativeRNFBTurboAppCheckSpec, RCTInvalidating>

@property RNFBAppCheckProviderFactory *_Nullable providerFactory;

@end

@implementation RNFBAppCheckModule

RCT_EXPORT_MODULE(NativeRNFBTurboAppCheck)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboAppCheckSpecJSI>(params);
}

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  __strong static RNFBAppCheckModule *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBAppCheckModule alloc] init];
    sharedInstance.providerFactory = [[RNFBAppCheckProviderFactory alloc] init];
    [FIRAppCheck setAppCheckProviderFactory:sharedInstance.providerFactory];
  });
  return sharedInstance;
}

- (void)invalidate {
}

- (void)activate:(NSString *)appName
              siteKeyProvider:(NSString *)siteKeyProvider
    isTokenAutoRefreshEnabled:(BOOL)isTokenAutoRefreshEnabled
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  DLog(@"deprecated API, provider will be deviceCheck / token refresh %d for app %@",
       isTokenAutoRefreshEnabled, firebaseApp.name);
  [[RNFBAppCheckModule sharedInstance].providerFactory configure:firebaseApp
                                                    providerName:@"deviceCheck"
                                                      debugToken:nil];

  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  appCheck.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled;
  resolve([NSNull null]);
}

- (void)configureProvider:(NSString *)appName
             providerName:(NSString *)providerName
               debugToken:(NSString *)debugToken
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  DLog(@"appName/providerName/debugToken: %@/%@/%@", firebaseApp.name, providerName,
       (debugToken == nil ? @"null" : @"(not shown)"));
  @try {
    [[RNFBAppCheckModule sharedInstance].providerFactory configure:firebaseApp
                                                      providerName:providerName
                                                        debugToken:debugToken];
    resolve([NSNull null]);
  } @catch (NSException *exception) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"unknown",
                                        @"message" : exception.reason ?: @"internal-error",
                                      }];
  }
}

- (void)setTokenAutoRefreshEnabled:(NSString *)appName
         isTokenAutoRefreshEnabled:(BOOL)isTokenAutoRefreshEnabled {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  DLog(@"app/isTokenAutoRefreshEnabled: %@/%d", firebaseApp.name, isTokenAutoRefreshEnabled);
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  appCheck.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled;
}

- (void)isTokenAutoRefreshEnabled:(NSString *)appName
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  BOOL isTokenAutoRefreshEnabled = appCheck.isTokenAutoRefreshEnabled;
  DLog(@"app/isTokenAutoRefreshEnabled: %@/%d", firebaseApp.name, isTokenAutoRefreshEnabled);
  resolve([NSNumber numberWithBool:isTokenAutoRefreshEnabled]);
}

// AppCheck-AD-8: map pending fail-closed to provider-not-ready (not token-error).
// Walk NSUnderlyingErrorKey because FIRAppCheck wraps non-SDK errors via
// publicDomainErrorWithError: and drops top-level userInfo[@"code"].
// Locked message: kRNFBAppCheckProviderNotReadyMessage (RNFBAppCheckProvider.h).
static NSString *RNFBAppCheckRejectCodeForError(NSError *error) {
  NSError *current = error;
  while (current != nil) {
    id code = current.userInfo[@"code"];
    if ([code isKindOfClass:[NSString class]] && [code isEqualToString:@"provider-not-ready"]) {
      return @"provider-not-ready";
    }
    current = current.userInfo[NSUnderlyingErrorKey];
    if (![current isKindOfClass:[NSError class]]) {
      break;
    }
  }
  return @"token-error";
}

// AppCheck-AD-8 durable path: reject before FIRAppCheck token APIs when the
// factory-held facade still has a nil delegateProvider (pending / not configured).
static BOOL RNFBAppCheckRejectIfProviderNotReady(FIRApp *firebaseApp,
                                                 RCTPromiseRejectBlock reject) {
  RNFBAppCheckProviderFactory *factory = [RNFBAppCheckModule sharedInstance].providerFactory;
  RNFBAppCheckProvider *provider = [factory providerForApp:firebaseApp];
  if (provider != nil && provider.delegateProvider != nil) {
    return NO;
  }
  DLog(@"RNFBAppCheck - provider not ready for app %@ (delegateProvider nil)", firebaseApp.name);
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                    userInfo:(NSMutableDictionary *)@{
                                      @"code" : @"provider-not-ready",
                                      @"message" : kRNFBAppCheckProviderNotReadyMessage,
                                    }];
  return YES;
}

- (void)getToken:(NSString *)appName
    forceRefresh:(BOOL)forceRefresh
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  DLog(@"appName %@", firebaseApp.name);
  if (RNFBAppCheckRejectIfProviderNotReady(firebaseApp, reject)) {
    return;
  }
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  [appCheck
      tokenForcingRefresh:forceRefresh
               completion:^(FIRAppCheckToken *_Nullable token, NSError *_Nullable error) {
                 if (error != nil) {
                   DLog(@"RNFBAppCheck - getToken - Unable to retrieve App Check token: %@", error);
                   NSString *code = RNFBAppCheckRejectCodeForError(error);
                   [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                                     userInfo:(NSMutableDictionary *)@{
                                                       @"code" : code,
                                                       @"message" : [error localizedDescription],
                                                     }];
                   return;
                 }
                 if (token == nil) {
                   DLog(@"RNFBAppCheck - getToken - Unable to retrieve App Check token.");
                   [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                                     userInfo:(NSMutableDictionary *)@{
                                                       @"code" : @"token-null",
                                                       @"message" : @"no token fetched",
                                                     }];
                   return;
                 }

                 NSMutableDictionary *tokenResultDictionary = [NSMutableDictionary new];
                 tokenResultDictionary[@"token"] = token.token;
                 resolve(tokenResultDictionary);
               }];
}

- (void)getLimitedUseToken:(NSString *)appName
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  DLog(@"appName %@", firebaseApp.name);
  if (RNFBAppCheckRejectIfProviderNotReady(firebaseApp, reject)) {
    return;
  }
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  [appCheck limitedUseTokenWithCompletion:^(FIRAppCheckToken *_Nullable token,
                                            NSError *_Nullable error) {
    if (error != nil) {
      DLog(@"RNFBAppCheck - getLimitedUseToken - Unable to retrieve App Check token: %@", error);
      NSString *code = RNFBAppCheckRejectCodeForError(error);
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : code,
                                          @"message" : [error localizedDescription],
                                        }];
      return;
    }
    if (token == nil) {
      DLog(@"RNFBAppCheck - getLimitedUseToken - Unable to retrieve App Check token.");
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"token-null",
                                          @"message" : @"no token fetched",
                                        }];
      return;
    }

    NSMutableDictionary *tokenResultDictionary = [NSMutableDictionary new];
    tokenResultDictionary[@"token"] = token.token;
    resolve(tokenResultDictionary);
  }];
}

- (void)addAppCheckListener:(NSString *)appName {
}

- (void)removeAppCheckListener:(NSString *)appName {
}

@end
