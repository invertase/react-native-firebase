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

#import "RNFBDatabaseOnDisconnectHelper.h"
#import "RNFBDatabaseOnDisconnectModule.h"
#import "RNFBDatabaseQueue.h"
#import "RNFBDatabaseTurboModules.h"

// NOTE: This module deliberately never imports Firebase Database headers.
// See RNFBDatabaseModule.mm for rationale. All Firebase Database calls are
// delegated to the plain Objective-C `RNFBDatabaseOnDisconnectHelper`.

@interface RNFBDatabaseOnDisconnectModule () <NativeRNFBTurboDatabaseOnDisconnectSpec,
                                              RCTBridgeModule>
@end

@implementation RNFBDatabaseOnDisconnectModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboDatabaseOnDisconnectSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboDatabaseOnDisconnect);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseQueue getDispatchQueue];
}

#pragma mark -
#pragma mark Firebase Database

- (void)onDisconnectCancel:(NSString *)app
                     dbURL:(NSString *)dbURL
                      path:(NSString *)path
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseOnDisconnectHelper onDisconnectCancel:app
                                               dbURL:dbURL
                                                path:path
                                             resolve:resolve
                                              reject:reject];
}

- (void)onDisconnectRemove:(NSString *)app
                     dbURL:(NSString *)dbURL
                      path:(NSString *)path
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseOnDisconnectHelper onDisconnectRemove:app
                                               dbURL:dbURL
                                                path:path
                                             resolve:resolve
                                              reject:reject];
}

- (void)onDisconnectSet:(NSString *)app
                  dbURL:(NSString *)dbURL
                   path:(NSString *)path
                  props:(NSDictionary *)props
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseOnDisconnectHelper onDisconnectSet:app
                                            dbURL:dbURL
                                             path:path
                                            props:props
                                          resolve:resolve
                                           reject:reject];
}

- (void)onDisconnectSetWithPriority:(NSString *)app
                              dbURL:(NSString *)dbURL
                               path:(NSString *)path
                              props:(NSDictionary *)props
                            resolve:(RCTPromiseResolveBlock)resolve
                             reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseOnDisconnectHelper onDisconnectSetWithPriority:app
                                                        dbURL:dbURL
                                                         path:path
                                                        props:props
                                                      resolve:resolve
                                                       reject:reject];
}

- (void)onDisconnectUpdate:(NSString *)app
                     dbURL:(NSString *)dbURL
                      path:(NSString *)path
                     props:(NSDictionary *)props
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseOnDisconnectHelper onDisconnectUpdate:app
                                               dbURL:dbURL
                                                path:path
                                               props:props
                                             resolve:resolve
                                              reject:reject];
}

@end
