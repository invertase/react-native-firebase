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

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseModule.h"
#import "RNFBDatabaseTurboModules.h"
#import "RNFBPreferences.h"

static __strong NSMutableDictionary *emulatorSettings;

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
  return [RNFBDatabaseCommon getDispatchQueue];
}

#pragma mark -
#pragma mark Firebase Database

- (void)goOnline:(NSString *)app
           dbURL:(NSString *)dbURL
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  [[RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL] goOnline];
  resolve([NSNull null]);
}

- (void)goOffline:(NSString *)app
            dbURL:(NSString *)dbURL
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  [[RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL] goOffline];
  resolve([NSNull null]);
}

- (void)useEmulator:(NSString *)app
              dbURL:(NSString *)dbURL
               host:(NSString *)host
               port:(double)port {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  if (emulatorSettings == nil) {
    emulatorSettings = [NSMutableDictionary dictionary];
  }

  NSMutableString *configKey = [firebaseApp.name mutableCopy];
  if (dbURL != nil && dbURL.length > 0) {
    [configKey appendString:dbURL];
  }

  if (!emulatorSettings[configKey]) {
    [[RNFBDatabaseCommon getDatabaseForApp:firebaseApp
                                     dbURL:dbURL] useEmulatorWithHost:host port:(NSInteger)port];
    emulatorSettings[configKey] = @YES;
  }
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
