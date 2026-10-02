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

// This module intentionally has no Firebase imports -- see RNFBAppCheckHelper.h /
// RNFBAppCheckModule.h for why. Every Firebase App Check SDK call is routed through
// the plain Objective-C RNFBAppCheckHelper class instead, which can safely
// `@import FirebaseAppCheck` (and import RNFBAppCheck-Swift.h for the reject-code
// mapper) because it compiles as ObjC, not ObjC++.
#import <React/RCTInvalidating.h>

#import "RNFBAppCheckHelper.h"
#import "RNFBAppCheckModule.h"
#import "RNFBAppCheckTurboModules.h"

@interface RNFBAppCheckModule () <NativeRNFBTurboAppCheckSpec, RCTInvalidating>
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
    [RNFBAppCheckHelper ensureProviderFactoryInstalled];
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
  [RNFBAppCheckHelper activate:appName
                siteKeyProvider:siteKeyProvider
      isTokenAutoRefreshEnabled:isTokenAutoRefreshEnabled
                        resolve:resolve
                         reject:reject];
}

- (void)configureProvider:(NSString *)appName
             providerName:(NSString *)providerName
               debugToken:(NSString *)debugToken
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  [RNFBAppCheckHelper configureProvider:appName
                           providerName:providerName
                             debugToken:debugToken
                                resolve:resolve
                                 reject:reject];
}

- (void)setTokenAutoRefreshEnabled:(NSString *)appName
         isTokenAutoRefreshEnabled:(BOOL)isTokenAutoRefreshEnabled {
  [RNFBAppCheckHelper setTokenAutoRefreshEnabled:appName
                       isTokenAutoRefreshEnabled:isTokenAutoRefreshEnabled];
}

- (void)isTokenAutoRefreshEnabled:(NSString *)appName
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
  [RNFBAppCheckHelper isTokenAutoRefreshEnabled:appName resolve:resolve reject:reject];
}

- (void)getToken:(NSString *)appName
    forceRefresh:(BOOL)forceRefresh
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [RNFBAppCheckHelper getToken:appName forceRefresh:forceRefresh resolve:resolve reject:reject];
}

- (void)getLimitedUseToken:(NSString *)appName
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [RNFBAppCheckHelper getLimitedUseToken:appName resolve:resolve reject:reject];
}

- (void)addAppCheckListener:(NSString *)appName {
}

- (void)removeAppCheckListener:(NSString *)appName {
}

@end
