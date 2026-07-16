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

#import "RNFBDatabaseQueue.h"
#import "RNFBDatabaseReferenceHelper.h"
#import "RNFBDatabaseReferenceModule.h"
#import "RNFBDatabaseTurboModules.h"

// NOTE: This module deliberately never imports Firebase Database headers.
// See RNFBDatabaseModule.mm for rationale. All Firebase Database calls are
// delegated to the plain Objective-C `RNFBDatabaseReferenceHelper`.

@interface RNFBDatabaseReferenceModule () <NativeRNFBTurboDatabaseReferenceSpec, RCTBridgeModule>
@end

@implementation RNFBDatabaseReferenceModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboDatabaseReferenceSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboDatabaseReference);

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
}

#pragma mark -
#pragma mark Firebase Database

- (void)set:(NSString *)app
      dbURL:(NSString *)dbURL
       path:(NSString *)path
      props:(NSDictionary *)props
    resolve:(RCTPromiseResolveBlock)resolve
     reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseReferenceHelper set:app
                             dbURL:dbURL
                              path:path
                             props:props
                           resolve:resolve
                            reject:reject];
}

- (void)update:(NSString *)app
         dbURL:(NSString *)dbURL
          path:(NSString *)path
         props:(NSDictionary *)props
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseReferenceHelper update:app
                                dbURL:dbURL
                                 path:path
                                props:props
                              resolve:resolve
                               reject:reject];
}

- (void)setWithPriority:(NSString *)app
                  dbURL:(NSString *)dbURL
                   path:(NSString *)path
                  props:(NSDictionary *)props
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseReferenceHelper setWithPriority:app
                                         dbURL:dbURL
                                          path:path
                                         props:props
                                       resolve:resolve
                                        reject:reject];
}

- (void)remove:(NSString *)app
         dbURL:(NSString *)dbURL
          path:(NSString *)path
       resolve:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseReferenceHelper remove:app dbURL:dbURL path:path resolve:resolve reject:reject];
}

- (void)setPriority:(NSString *)app
              dbURL:(NSString *)dbURL
               path:(NSString *)path
              props:(NSDictionary *)props
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [RNFBDatabaseReferenceHelper setPriority:app
                                     dbURL:dbURL
                                      path:path
                                     props:props
                                   resolve:resolve
                                    reject:reject];
}

@end
