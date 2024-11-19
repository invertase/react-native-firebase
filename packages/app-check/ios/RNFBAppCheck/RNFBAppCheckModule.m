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
#import <FirebaseAppCheck/FIRAppCheck.h>

#import <React/RCTUtils.h>

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBAppCheckModule.h"

@implementation RNFBAppCheckModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
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

#pragma mark -
#pragma mark Firebase AppCheck Methods

RCT_EXPORT_METHOD(activate
                  : (FIRApp *)firebaseApp
                  : (nonnull NSString *)siteKeyOrProvider
                  : (BOOL)isTokenAutoRefreshEnabled
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"deprecated API, provider will be deviceCheck / token refresh %d for app %@",
       isTokenAutoRefreshEnabled, firebaseApp.name);
  [[RNFBAppCheckModule sharedInstance].providerFactory configure:firebaseApp
                                                    providerName:@"deviceCheck"
                                                      debugToken:nil];

  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  appCheck.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled;
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(configureProvider
                  : (FIRApp *)firebaseApp
                  : (nonnull NSString *)providerName
                  : (nullable NSString *)debugToken
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  DLog(@"appName/providerName/debugToken: %@/%@/%@", firebaseApp.name, providerName,
       (debugToken == nil ? @"null" : @"(not shown)"));
  [[RNFBAppCheckModule sharedInstance].providerFactory configure:firebaseApp
                                                    providerName:providerName
                                                      debugToken:debugToken];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setTokenAutoRefreshEnabled
                  : (FIRApp *)firebaseApp
                  : (BOOL)isTokenAutoRefreshEnabled) {
  DLog(@"app/isTokenAutoRefreshEnabled: %@/%d", firebaseApp.name, isTokenAutoRefreshEnabled);
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  appCheck.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled;
}

// Not present in JS or Android - it is iOS-specific so we only call this in testing - it is not in
// index.d.ts
RCT_EXPORT_METHOD(isTokenAutoRefreshEnabled
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  BOOL isTokenAutoRefreshEnabled = appCheck.isTokenAutoRefreshEnabled;
  DLog(@"app/isTokenAutoRefreshEnabled: %@/%d", firebaseApp.name, isTokenAutoRefreshEnabled);
  resolve([NSNumber numberWithBool:isTokenAutoRefreshEnabled]);
}

RCT_EXPORT_METHOD(getToken
                  : (FIRApp *)firebaseApp
                  : (BOOL)forceRefresh
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  DLog(@"appName %@", firebaseApp.name);
  [appCheck
      tokenForcingRefresh:forceRefresh
               completion:^(FIRAppCheckToken *_Nullable token, NSError *_Nullable error) {
                 if (error != nil) {
                   // Handle any errors if the token was not retrieved.
                   DLog(@"RNFBAppCheck - getToken - Unable to retrieve App Check token: %@", error);
                   [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                                     userInfo:(NSMutableDictionary *)@{
                                                       @"code" : @"token-error",
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

RCT_EXPORT_METHOD(getLimitedUseToken
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  DLog(@"appName %@", firebaseApp.name);
  [appCheck limitedUseTokenWithCompletion:^(FIRAppCheckToken *_Nullable token,
                                            NSError *_Nullable error) {
    if (error != nil) {
      // Handle any errors if the token was not retrieved.
      DLog(@"RNFBAppCheck - getLimitedUseToken - Unable to retrieve App Check token: %@", error);
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"token-error",
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

@end
