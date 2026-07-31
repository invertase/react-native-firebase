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

NS_ASSUME_NONNULL_BEGIN

/// Thin Objective-C wrapper around FirebaseRemoteConfig.
///
/// FirebaseRemoteConfig is a pure-Swift SPM module: its generated ObjC
/// interface header (FirebaseRemoteConfig-Swift.h) is not reliably
/// importable from a cross-project CocoaPods target, and `@import
/// FirebaseRemoteConfig;` (the pattern the Firebase SDK itself documents for
/// ObjC clients, see SPMSwiftHeaderWorkaround.swift) requires C++ modules to
/// be enabled when used from an Objective-C++ (.mm) file, which breaks React
/// Native's own jsi/React modules. Isolating all FirebaseRemoteConfig usage
/// in this plain Objective-C (.m) file avoids that requirement entirely,
/// since `@import` only needs `-fmodules` (already enabled) for plain ObjC.
/// See okf-bundle/ios-spm-native-imports.md.
@interface RNFBConfigHelper : NSObject

+ (void)ensureInitialized:(NSString *)appName
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject;

+ (void)fetch:(NSString *)appName
    expirationDurationSeconds:(double)expirationDurationSeconds
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject;

+ (void)fetchAndActivate:(NSString *)appName
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

+ (void)activate:(NSString *)appName
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject;

+ (void)setConfigSettings:(NSString *)appName
     minimumFetchInterval:(double)minimumFetchInterval
             fetchTimeout:(double)fetchTimeout
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject;

+ (void)setDefaults:(NSString *)appName
           defaults:(NSDictionary *)defaults
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject;

+ (void)setDefaultsFromResource:(NSString *)appName
                   resourceName:(NSString *)resourceName
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject;

+ (void)reset:(NSString *)appName
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject;

+ (void)onConfigUpdated:(NSString *)appName;

+ (void)removeConfigUpdateRegistration:(NSString *)appName;

+ (void)removeAllConfigUpdateRegistrations;

+ (void)setCustomSignals:(NSString *)appName
           customSignals:(NSDictionary *)customSignals
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

+ (NSDictionary *)getConstantsForAppName:(NSString *)appName;

@end

NS_ASSUME_NONNULL_END
