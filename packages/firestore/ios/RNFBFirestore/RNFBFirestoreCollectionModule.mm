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

// This module intentionally has no Firebase / Swift.h imports -- see
// RNFBFirestoreCollectionModuleHelper.h / okf-bundle/ios-spm-native-imports.md.
#import <React/RCTInvalidating.h>

#import "RNFBFirestoreCollectionModule.h"
#import "RNFBFirestoreCollectionModuleHelper.h"
#import "RNFBFirestoreTurboModules.h"

@interface RNFBFirestoreCollectionModule () <NativeRNFBTurboFirestoreCollectionSpec,
                                             RCTBridgeModule,
                                             RCTInvalidating>
@end

@implementation RNFBFirestoreCollectionModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboFirestoreCollectionSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboFirestoreCollection);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  [RNFBFirestoreCollectionModuleHelper invalidate];
}

#pragma mark -
#pragma mark Firebase Firestore Methods

- (void)namedQueryOnSnapshot:(NSString *)appName
                  databaseId:(NSString *)databaseId
                   queryName:(NSString *)queryName
                        type:(NSString *)type
                     filters:(NSArray *)filters
                      orders:(NSArray *)orders
                     options:(NSDictionary *)options
                  listenerId:(double)listenerId
       snapshotListenOptions:(NSDictionary *)snapshotListenOptions {
  [RNFBFirestoreCollectionModuleHelper namedQueryOnSnapshot:appName
                                                 databaseId:databaseId
                                                  queryName:queryName
                                                       type:type
                                                    filters:filters
                                                     orders:orders
                                                    options:options
                                                 listenerId:listenerId
                                      snapshotListenOptions:snapshotListenOptions];
}

- (void)collectionOnSnapshot:(NSString *)appName
                  databaseId:(NSString *)databaseId
                        path:(NSString *)path
                        type:(NSString *)type
                     filters:(NSArray *)filters
                      orders:(NSArray *)orders
                     options:(NSDictionary *)options
                  listenerId:(double)listenerId
       snapshotListenOptions:(NSDictionary *)snapshotListenOptions {
  [RNFBFirestoreCollectionModuleHelper collectionOnSnapshot:appName
                                                 databaseId:databaseId
                                                       path:path
                                                       type:type
                                                    filters:filters
                                                     orders:orders
                                                    options:options
                                                 listenerId:listenerId
                                      snapshotListenOptions:snapshotListenOptions];
}

- (void)collectionOffSnapshot:(NSString *)appName
                   databaseId:(NSString *)databaseId
                   listenerId:(double)listenerId {
  [RNFBFirestoreCollectionModuleHelper collectionOffSnapshot:appName
                                                  databaseId:databaseId
                                                  listenerId:listenerId];
}

- (void)namedQueryGet:(NSString *)appName
           databaseId:(NSString *)databaseId
            queryName:(NSString *)queryName
                 type:(NSString *)type
              filters:(NSArray *)filters
               orders:(NSArray *)orders
              options:(NSDictionary *)options
           getOptions:(NSDictionary *)getOptions
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreCollectionModuleHelper namedQueryGet:appName
                                          databaseId:databaseId
                                           queryName:queryName
                                                type:type
                                             filters:filters
                                              orders:orders
                                             options:options
                                          getOptions:getOptions
                                             resolve:resolve
                                              reject:reject];
}

- (void)collectionCount:(NSString *)appName
             databaseId:(NSString *)databaseId
                   path:(NSString *)path
                   type:(NSString *)type
                filters:(NSArray *)filters
                 orders:(NSArray *)orders
                options:(NSDictionary *)options
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreCollectionModuleHelper collectionCount:appName
                                            databaseId:databaseId
                                                  path:path
                                                  type:type
                                               filters:filters
                                                orders:orders
                                               options:options
                                               resolve:resolve
                                                reject:reject];
}

- (void)aggregateQuery:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
                  type:(NSString *)type
               filters:(NSArray *)filters
                orders:(NSArray *)orders
               options:(NSDictionary *)options
      aggregateQueries:(NSArray *)aggregateQueries
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreCollectionModuleHelper aggregateQuery:appName
                                           databaseId:databaseId
                                                 path:path
                                                 type:type
                                              filters:filters
                                               orders:orders
                                              options:options
                                     aggregateQueries:aggregateQueries
                                              resolve:resolve
                                               reject:reject];
}

- (void)pipelineExecute:(NSString *)appName
             databaseId:(NSString *)databaseId
               pipeline:(NSDictionary *)pipeline
                options:(NSDictionary *)options
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreCollectionModuleHelper pipelineExecute:appName
                                            databaseId:databaseId
                                              pipeline:pipeline
                                               options:options
                                               resolve:resolve
                                                reject:reject];
}

- (void)collectionGet:(NSString *)appName
           databaseId:(NSString *)databaseId
                 path:(NSString *)path
                 type:(NSString *)type
              filters:(NSArray *)filters
               orders:(NSArray *)orders
              options:(NSDictionary *)options
           getOptions:(NSDictionary *)getOptions
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreCollectionModuleHelper collectionGet:appName
                                          databaseId:databaseId
                                                path:path
                                                type:type
                                             filters:filters
                                              orders:orders
                                             options:options
                                          getOptions:getOptions
                                             resolve:resolve
                                              reject:reject];
}

@end
