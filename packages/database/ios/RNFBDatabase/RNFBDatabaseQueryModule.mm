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

#import "RNFBDatabaseQueryHelper.h"
#import "RNFBDatabaseQueryModule.h"
#import "RNFBDatabaseQueue.h"
#import "RNFBDatabaseTurboModules.h"

// NOTE: This module deliberately never imports Firebase Database headers.
// See RNFBDatabaseModule.mm for rationale. All Firebase Database calls and
// query/listener bookkeeping live in the plain Objective-C
// `RNFBDatabaseQueryHelper`.

@interface RNFBDatabaseQueryModule () <NativeRNFBTurboDatabaseQuerySpec, RCTBridgeModule>
@end

@implementation RNFBDatabaseQueryModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboDatabaseQuerySpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboDatabaseQuery);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseQueue getDispatchQueue];
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  [RNFBDatabaseQueryHelper invalidate];
}

#pragma mark -
#pragma mark Firebase Database

- (void)once:(NSString *)app
        dbURL:(NSString *)dbURL
         path:(NSString *)path
    modifiers:(NSArray *)modifiers
    eventType:(NSString *)eventType
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseQueryHelper once:app
                          dbURL:dbURL
                           path:path
                      modifiers:modifiers
                      eventType:eventType
                        resolve:resolve
                         reject:reject];
}

- (void)on:(NSString *)app dbURL:(NSString *)dbURL props:(NSDictionary *)props {
  [RNFBDatabaseQueryHelper on:app dbURL:dbURL props:props];
}

- (void)off:(NSString *)queryKey eventRegistrationKey:(NSString *)eventRegistrationKey {
  [RNFBDatabaseQueryHelper off:queryKey eventRegistrationKey:eventRegistrationKey];
}

- (void)keepSynced:(NSString *)app
             dbURL:(NSString *)dbURL
               key:(NSString *)key
              path:(NSString *)path
         modifiers:(NSArray *)modifiers
           enabled:(BOOL)value
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseQueryHelper keepSynced:app
                                dbURL:dbURL
                                  key:key
                                 path:path
                            modifiers:modifiers
                              enabled:value
                              resolve:resolve
                               reject:reject];
}

@end
