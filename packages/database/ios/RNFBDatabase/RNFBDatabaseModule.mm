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

#import "RNFBDatabaseConstants.h"
#import "RNFBDatabaseModule.h"
#import "RNFBDatabaseModuleHelper.h"
#import "RNFBDatabaseQueue.h"
#import "RNFBDatabaseTurboModules.h"
#import "RNFBPreferences.h"

// NOTE: This module deliberately never imports Firebase Database headers -
// `FirebaseDatabase` is a Swift-only SPM product, and `@import` for
// Swift-only products cannot be used from Objective-C++ (.mm) files when
// C++ modules are disabled (required for compatibility with React Native's
// JSI headers). All Firebase Database calls are delegated to the plain
// Objective-C `RNFBDatabaseModuleHelper`. See docs/ios-spm.mdx and
// okf-bundle/ios-spm-native-imports.md for details.

@interface RNFBDatabaseModule () <NativeRNFBTurboDatabaseSpec, RCTBridgeModule>
@end

@implementation RNFBDatabaseModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboDatabaseSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboDatabase);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseQueue getDispatchQueue];
}

#pragma mark -
#pragma mark Firebase Database

- (void)goOnline:(NSString *)app dbURL:(NSString *)dbURL {
  [RNFBDatabaseModuleHelper goOnline:app dbURL:dbURL];
}

- (void)goOffline:(NSString *)app dbURL:(NSString *)dbURL {
  [RNFBDatabaseModuleHelper goOffline:app dbURL:dbURL];
}

- (void)useEmulator:(NSString *)app
              dbURL:(NSString *)dbURL
               host:(NSString *)host
               port:(double)port {
  [RNFBDatabaseModuleHelper useEmulator:app dbURL:dbURL host:host port:(NSInteger)port];
}

- (void)setPersistenceEnabled:(NSString *)app dbURL:(NSString *)dbURL enabled:(BOOL)enabled {
  [[RNFBPreferences shared] setBooleanValue:DATABASE_PERSISTENCE_ENABLED boolValue:enabled];
}

- (void)setLoggingEnabled:(NSString *)app dbURL:(NSString *)dbURL enabled:(BOOL)enabled {
  [[RNFBPreferences shared] setBooleanValue:DATABASE_LOGGING_ENABLED boolValue:enabled];
}

- (void)setPersistenceCacheSizeBytes:(NSString *)app
                               dbURL:(NSString *)dbURL
                      cacheSizeBytes:(double)cacheSizeBytes {
  [[RNFBPreferences shared] setIntegerValue:DATABASE_PERSISTENCE_CACHE_SIZE
                               integerValue:(NSInteger)cacheSizeBytes];
}

@end
