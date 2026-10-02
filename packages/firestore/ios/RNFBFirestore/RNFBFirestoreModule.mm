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

// This module intentionally has no Firebase imports -- see
// RNFBFirestoreModuleHelper.h / okf-bundle/ios-spm-native-imports.md. Every
// Firebase Firestore SDK call (including FIRPersistentCacheIndexManager) is
// routed through the plain Objective-C RNFBFirestoreModuleHelper.
#import <React/RCTInvalidating.h>

#import "RNFBFirestoreModule.h"
#import "RNFBFirestoreModuleHelper.h"
#import "RNFBFirestoreTurboModules.h"

@interface RNFBFirestoreModule () <NativeRNFBTurboFirestoreSpec, RCTBridgeModule, RCTInvalidating>
@end

@implementation RNFBFirestoreModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboFirestoreSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboFirestore);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  [RNFBFirestoreModuleHelper invalidate];
}

#pragma mark -
#pragma mark Firebase Firestore Methods

- (void)setLogLevel:(NSString *)logLevel {
  [RNFBFirestoreModuleHelper setLogLevel:logLevel];
}

- (void)disableNetwork:(NSString *)appName
            databaseId:(NSString *)databaseId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreModuleHelper disableNetwork:appName
                                 databaseId:databaseId
                                    resolve:resolve
                                     reject:reject];
}

- (void)enableNetwork:(NSString *)appName
           databaseId:(NSString *)databaseId
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreModuleHelper enableNetwork:appName
                                databaseId:databaseId
                                   resolve:resolve
                                    reject:reject];
}

- (void)settings:(NSString *)appName
      databaseId:(NSString *)databaseId
        settings:(NSDictionary *)settings
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreModuleHelper settings:appName
                           databaseId:databaseId
                             settings:settings
                              resolve:resolve
                               reject:reject];
}

- (void)loadBundle:(NSString *)appName
        databaseId:(NSString *)databaseId
            bundle:(NSString *)bundle
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreModuleHelper loadBundle:appName
                             databaseId:databaseId
                                 bundle:bundle
                                resolve:resolve
                                 reject:reject];
}

- (void)clearPersistence:(NSString *)appName
              databaseId:(NSString *)databaseId
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreModuleHelper clearPersistence:appName
                                   databaseId:databaseId
                                      resolve:resolve
                                       reject:reject];
}

- (void)useEmulator:(NSString *)appName
         databaseId:(NSString *)databaseId
               host:(NSString *)host
               port:(double)port {
  [RNFBFirestoreModuleHelper useEmulator:appName databaseId:databaseId host:host port:port];
}

- (void)waitForPendingWrites:(NSString *)appName
                  databaseId:(NSString *)databaseId
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreModuleHelper waitForPendingWrites:appName
                                       databaseId:databaseId
                                          resolve:resolve
                                           reject:reject];
}

- (void)terminate:(NSString *)appName
       databaseId:(NSString *)databaseId
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreModuleHelper terminate:appName databaseId:databaseId resolve:resolve reject:reject];
}

- (void)persistenceCacheIndexManager:(NSString *)appName
                          databaseId:(NSString *)databaseId
                         requestType:(double)requestType
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreModuleHelper persistenceCacheIndexManager:appName
                                               databaseId:databaseId
                                              requestType:requestType
                                                  resolve:resolve
                                                   reject:reject];
}

- (void)addSnapshotsInSync:(NSString *)appName
                databaseId:(NSString *)databaseId
                listenerId:(double)listenerId {
  [RNFBFirestoreModuleHelper addSnapshotsInSync:appName
                                     databaseId:databaseId
                                     listenerId:listenerId];
}

- (void)removeSnapshotsInSync:(NSString *)appName
                   databaseId:(NSString *)databaseId
                   listenerId:(double)listenerId {
  [RNFBFirestoreModuleHelper removeSnapshotsInSync:appName
                                        databaseId:databaseId
                                        listenerId:listenerId];
}

@end
