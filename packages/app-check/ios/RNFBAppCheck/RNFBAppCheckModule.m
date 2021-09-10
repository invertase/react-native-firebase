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

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBAppCheckModule.h"

#import "FirebaseAppCheck/FIRAppCheck.h"

@implementation RNFBAppCheckModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#pragma mark -
#pragma mark Firebase AppCheck Methods

RCT_EXPORT_METHOD(activate
                  : (FIRApp *)firebaseApp
                  : (nonnull NSString *)siteKeyOrProvider
                  : (BOOL)isTokenAutoRefreshEnabled) {
  // From SDK docs:
  // NOTE: Make sure to call this method before FirebaseApp.configure().
  // If this method is called after configuring Firebase, the changes will not take effect.

  // So in react-native-firebase we will only use this to set the isTokenAutoRefreshEnabled
  // parameter, but if AppCheck is included on iOS it wlil be active with DeviceCheckProviderFactory

  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  appCheck.isTokenAutoRefreshEnabled = isTokenAutoRefreshEnabled;
}

RCT_EXPORT_METHOD(setTokenAutoRefreshEnabled
                  : (FIRApp *)firebaseApp
                  : (BOOL)isTokenAutoRefreshEnabled) {
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
  resolve([NSNumber numberWithBool:isTokenAutoRefreshEnabled]);
}

RCT_EXPORT_METHOD(getToken
                  : (FIRApp *)firebaseApp
                  : (BOOL)forceRefresh
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:firebaseApp];
  [appCheck tokenForcingRefresh:forceRefresh
                     completion:^(FIRAppCheckToken *_Nullable token, NSError *_Nullable error) {
                       if (error != nil) {
                         // Handle any errors if the token was not retrieved.
                         DLog(@"Unable to retrieve App Check token: %@", error);
                         [RNFBSharedUtils
                             rejectPromiseWithUserInfo:reject
                                              userInfo:(NSMutableDictionary *)@{
                                                @"code" : @"token-error",
                                                @"message" : [error localizedDescription],
                                              }];
                         return;
                       }
                       if (token == nil) {
                         DLog(@"Unable to retrieve App Check token.");
                         [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                                           userInfo:(NSMutableDictionary *)@{
                                                             @"code" : @"token-null",
                                                             @"message" : @"no token fetched",
                                                           }];
                         return;
                       }

                       resolve(token.token);
                     }];
}

// TODO
// - set up DeviceCheckProvider and Debug provider
// FIRAppCheckDebugProviderFactory *providerFactory =
//       [[FIRAppCheckDebugProviderFactory alloc] init];
// [FIRAppCheck setAppCheckProviderFactory:providerFactory];

// Write a custom provider factory, and allow the AppAttest provider

@end
