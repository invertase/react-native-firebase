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
// RNFBFirestoreDocumentModuleHelper.h / okf-bundle/ios-spm-native-imports.md.
// JS:: TurboModule option structs are unpacked here into plain dictionaries
// before delegating to the ObjC helper.
#import <React/RCTInvalidating.h>

#import "RNFBFirestoreDocumentModule.h"
#import "RNFBFirestoreDocumentModuleHelper.h"
#import "RNFBFirestoreTurboModules.h"

@interface RNFBFirestoreDocumentModule () <NativeRNFBTurboFirestoreDocumentSpec,
                                           RCTBridgeModule,
                                           RCTInvalidating>
@end

@implementation RNFBFirestoreDocumentModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboFirestoreDocumentSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboFirestoreDocument);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  [RNFBFirestoreDocumentModuleHelper invalidate];
}

#pragma mark -
#pragma mark Firebase Firestore Methods

- (void)documentOnSnapshot:(NSString *)appName
                databaseId:(NSString *)databaseId
                      path:(NSString *)path
                listenerId:(double)listenerId
     snapshotListenOptions:(JS::NativeRNFBTurboFirestoreDocument::FirestoreSnapshotListenOptions &)
                               snapshotListenOptions {
  NSMutableDictionary *listenerOptions = [NSMutableDictionary new];
  auto includeMetadataChangesOpt = snapshotListenOptions.includeMetadataChanges();
  if (includeMetadataChangesOpt.has_value()) {
    listenerOptions[@"includeMetadataChanges"] = @(*includeMetadataChangesOpt);
  }
  NSString *sourceString = snapshotListenOptions.source();
  if (sourceString) {
    listenerOptions[@"source"] = sourceString;
  }

  [RNFBFirestoreDocumentModuleHelper documentOnSnapshot:appName
                                             databaseId:databaseId
                                                   path:path
                                             listenerId:listenerId
                                  snapshotListenOptions:listenerOptions];
}

- (void)documentOffSnapshot:(NSString *)appName
                 databaseId:(NSString *)databaseId
                 listenerId:(double)listenerId {
  [RNFBFirestoreDocumentModuleHelper documentOffSnapshot:appName
                                              databaseId:databaseId
                                              listenerId:listenerId];
}

- (void)documentGet:(NSString *)appName
         databaseId:(NSString *)databaseId
               path:(NSString *)path
         getOptions:(JS::NativeRNFBTurboFirestoreDocument::SpecDocumentGetGetOptions &)getOptions
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  NSMutableDictionary *options = [NSMutableDictionary new];
  NSString *sourceString = getOptions.source();
  if (sourceString) {
    options[@"source"] = sourceString;
  }

  [RNFBFirestoreDocumentModuleHelper documentGet:appName
                                      databaseId:databaseId
                                            path:path
                                      getOptions:options
                                         resolve:resolve
                                          reject:reject];
}

- (void)documentDelete:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreDocumentModuleHelper documentDelete:appName
                                         databaseId:databaseId
                                               path:path
                                            resolve:resolve
                                             reject:reject];
}

- (void)documentSet:(NSString *)appName
         databaseId:(NSString *)databaseId
               path:(NSString *)path
               data:(NSDictionary *)data
            options:(NSDictionary *)options
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreDocumentModuleHelper documentSet:appName
                                      databaseId:databaseId
                                            path:path
                                            data:data
                                         options:options
                                         resolve:resolve
                                          reject:reject];
}

- (void)documentUpdate:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
                  data:(NSDictionary *)data
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreDocumentModuleHelper documentUpdate:appName
                                         databaseId:databaseId
                                               path:path
                                               data:data
                                            resolve:resolve
                                             reject:reject];
}

- (void)documentBatch:(NSString *)appName
           databaseId:(NSString *)databaseId
               writes:(NSArray *)writes
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  [RNFBFirestoreDocumentModuleHelper documentBatch:appName
                                        databaseId:databaseId
                                            writes:writes
                                           resolve:resolve
                                            reject:reject];
}

@end
