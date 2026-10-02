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

// Plain Objective-C helper (see docs/ios-spm.mdx and
// okf-bundle/ios-spm-native-imports.md) that owns every call touching
// `FIRAppCheck` / provider factory for RNFBAppCheckModule. This keeps
// RNFBAppCheckModule.mm free of Firebase App Check imports: under SPM the
// usable Objective-C surface for App Check is module-backed, and `@import`
// cannot be used from an Objective-C++ (.mm) TurboModule when C++ modules are
// disabled (required by React Native's JSI headers).
@interface RNFBAppCheckHelper : NSObject

/** Installs the shared provider factory once (AppDelegate early init path). */
+ (void)ensureProviderFactoryInstalled;

+ (void)activate:(NSString *)appName
              siteKeyProvider:(NSString *)siteKeyProvider
    isTokenAutoRefreshEnabled:(BOOL)isTokenAutoRefreshEnabled
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject;

+ (void)configureProvider:(NSString *)appName
             providerName:(NSString *)providerName
               debugToken:(NSString *)debugToken
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject;

+ (void)setTokenAutoRefreshEnabled:(NSString *)appName
         isTokenAutoRefreshEnabled:(BOOL)isTokenAutoRefreshEnabled;

+ (void)isTokenAutoRefreshEnabled:(NSString *)appName
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject;

+ (void)getToken:(NSString *)appName
    forceRefresh:(BOOL)forceRefresh
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject;

+ (void)getLimitedUseToken:(NSString *)appName
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject;

@end
