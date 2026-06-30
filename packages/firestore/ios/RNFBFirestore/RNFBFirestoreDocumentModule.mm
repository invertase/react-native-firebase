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

#import <RNFBApp/RNFBRCTEventEmitter.h>
#import "RNFBApp/RCTConvert+FIRApp.h"
#import <React/RCTUtils.h>

#import "RNFBFirestoreDocumentModule.h"
#import "RNFBFirestoreTurboModules.h"

static __strong NSMutableDictionary *documentSnapshotListeners;
static NSString *const RNFB_FIRESTORE_DOCUMENT_SYNC = @"firestore_document_sync_event";

@interface RNFBFirestoreDocumentModule () <NativeRNFBTurboFirestoreDocumentSpec, RCTBridgeModule>
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

- (id)init {
  self = [super init];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    documentSnapshotListeners = [[NSMutableDictionary alloc] init];
  });
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  for (NSString *key in [documentSnapshotListeners allKeys]) {
    id<FIRListenerRegistration> listener = documentSnapshotListeners[key];
    [listener remove];
    [documentSnapshotListeners removeObjectForKey:key];
  }
}

#pragma mark -
#pragma mark Firebase Firestore Methods

- (void)documentOnSnapshot:(NSString *)appName
                databaseId:(NSString *)databaseId
                      path:(NSString *)path
                listenerId:(double)listenerId
     snapshotListenOptions:
         (JS::NativeRNFBTurboFirestoreDocument::FirestoreSnapshotListenOptions &)snapshotListenOptions {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *listenerIdNumber = @(listenerId);

  if (documentSnapshotListeners[listenerIdNumber]) {
    return;
  }

  NSMutableDictionary *listenerOptions = [NSMutableDictionary new];
  auto includeMetadataChangesOpt = snapshotListenOptions.includeMetadataChanges();
  if (includeMetadataChangesOpt.has_value()) {
    listenerOptions[KEY_INCLUDE_METADATA_CHANGES] = @(*includeMetadataChangesOpt);
  }
  NSString *sourceString = snapshotListenOptions.source();
  if (sourceString) {
    listenerOptions[KEY_SOURCE] = sourceString;
  }

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRDocumentReference *documentReference = [RNFBFirestoreCommon getDocumentForFirestore:firestore
                                                                                    path:path];

  __weak RNFBFirestoreDocumentModule *weakSelf = self;
  id listenerBlock = ^(FIRDocumentSnapshot *snapshot, NSError *error) {
    if (error) {
      id<FIRListenerRegistration> listener = documentSnapshotListeners[listenerIdNumber];
      if (listener) {
        [listener remove];
        [documentSnapshotListeners removeObjectForKey:listenerIdNumber];
      }
      [weakSelf sendSnapshotError:firebaseApp
                       databaseId:databaseId
                       listenerId:listenerIdNumber
                            error:error];
    } else {
      [weakSelf sendSnapshotEvent:firebaseApp
                       databaseId:databaseId
                       listenerId:listenerIdNumber
                         snapshot:snapshot];
    }
  };

  BOOL includeMetadataChanges = NO;
  FIRListenSource source = FIRListenSourceDefault;
  if (listenerOptions[KEY_INCLUDE_METADATA_CHANGES] != nil) {
    includeMetadataChanges = [listenerOptions[KEY_INCLUDE_METADATA_CHANGES] boolValue];
  }
  if ([listenerOptions[KEY_SOURCE] isEqualToString:@"cache"]) {
    source = FIRListenSourceCache;
  }

  FIRSnapshotListenOptions *nativeSnapshotListenOptions = [[[[FIRSnapshotListenOptions alloc] init]
      optionsWithIncludeMetadataChanges:includeMetadataChanges] optionsWithSource:source];
  id<FIRListenerRegistration> listener =
      [documentReference addSnapshotListenerWithOptions:nativeSnapshotListenOptions
                                               listener:listenerBlock];
  documentSnapshotListeners[listenerIdNumber] = listener;
}

- (void)documentOffSnapshot:(NSString *)appName
                 databaseId:(NSString *)databaseId
                 listenerId:(double)listenerId {
  NSNumber *listenerIdNumber = @(listenerId);
  id<FIRListenerRegistration> listener = documentSnapshotListeners[listenerIdNumber];
  if (listener) {
    [listener remove];
    [documentSnapshotListeners removeObjectForKey:listenerIdNumber];
  }
}

- (void)documentGet:(NSString *)appName
         databaseId:(NSString *)databaseId
               path:(NSString *)path
         getOptions:(JS::NativeRNFBTurboFirestoreDocument::SpecDocumentGetGetOptions &)getOptions
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRDocumentReference *documentReference = [RNFBFirestoreCommon getDocumentForFirestore:firestore
                                                                                    path:path];

  FIRFirestoreSource source;
  NSString *sourceString = getOptions.source();

  if (sourceString) {
    if ([sourceString isEqualToString:@"server"]) {
      source = FIRFirestoreSourceServer;
    } else if ([sourceString isEqualToString:@"cache"]) {
      source = FIRFirestoreSourceCache;
    } else {
      source = FIRFirestoreSourceDefault;
    }
  } else {
    source = FIRFirestoreSourceDefault;
  }

  [documentReference
      getDocumentWithSource:source
                 completion:^(FIRDocumentSnapshot *snapshot, NSError *error) {
                   if (error) {
                     return [RNFBFirestoreCommon promiseRejectFirestoreException:reject
                                                                           error:error];
                   } else {
                     NSString *resolvedAppName =
                         [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name];
                     NSString *firestoreKey =
                         [RNFBFirestoreCommon createFirestoreKeyWithAppName:resolvedAppName
                                                                 databaseId:databaseId];
                     NSDictionary *serialized =
                         [RNFBFirestoreSerialize documentSnapshotToDictionary:snapshot
                                                                 firestoreKey:firestoreKey];
                     resolve(serialized);
                   }
                 }];
}

- (void)documentDelete:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRDocumentReference *documentReference = [RNFBFirestoreCommon getDocumentForFirestore:firestore
                                                                                    path:path];

  [documentReference deleteDocumentWithCompletion:^(NSError *error) {
    if (error) {
      return [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      resolve(nil);
    }
  }];
}

- (void)documentSet:(NSString *)appName
         databaseId:(NSString *)databaseId
               path:(NSString *)path
               data:(NSDictionary *)data
            options:(NSDictionary *)options
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRDocumentReference *documentReference = [RNFBFirestoreCommon getDocumentForFirestore:firestore
                                                                                    path:path];

  NSDictionary *parsedData = [RNFBFirestoreSerialize parseNSDictionary:firestore dictionary:data];

  // On set complete
  id completionBlock = ^(NSError *error) {
    if (error) {
      return [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      resolve(nil);
    }
  };

  if (options[@"merge"]) {
    [documentReference setData:parsedData merge:true completion:completionBlock];
  } else if (options[@"mergeFields"]) {
    NSArray *mergeFields = options[@"mergeFields"];
    [documentReference setData:parsedData mergeFields:mergeFields completion:completionBlock];
  } else {
    [documentReference setData:parsedData completion:completionBlock];
  }
}

- (void)documentUpdate:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
                  data:(NSDictionary *)data
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRDocumentReference *documentReference = [RNFBFirestoreCommon getDocumentForFirestore:firestore
                                                                                    path:path];

  NSDictionary *parsedData = [RNFBFirestoreSerialize parseNSDictionary:firestore dictionary:data];

  [documentReference updateData:parsedData
                     completion:^(NSError *error) {
                       if (error) {
                         return [RNFBFirestoreCommon promiseRejectFirestoreException:reject
                                                                               error:error];
                       } else {
                         resolve(nil);
                       }
                     }];
}

- (void)documentBatch:(NSString *)appName
           databaseId:(NSString *)databaseId
               writes:(NSArray *)writes
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRWriteBatch *batch = [firestore batch];

  for (NSDictionary *write in writes) {
    NSString *type = write[@"type"];
    NSString *path = write[@"path"];
    FIRDocumentReference *documentReference = [firestore documentWithPath:path];
    NSDictionary *data = write[@"data"];
    NSDictionary *parsedData = [RNFBFirestoreSerialize parseNSDictionary:firestore dictionary:data];

    if ([type isEqualToString:@"DELETE"]) {
      batch = [batch deleteDocument:documentReference];
    } else if ([type isEqualToString:@"SET"]) {
      NSDictionary *options = write[@"options"];

      if (options[@"merge"]) {
        batch = [batch setData:parsedData forDocument:documentReference merge:true];
      } else if (options[@"mergeFields"]) {
        NSArray *mergeFields = options[@"mergeFields"];
        batch = [batch setData:parsedData forDocument:documentReference mergeFields:mergeFields];
      } else {
        batch = [batch setData:parsedData forDocument:documentReference];
      }
    } else if ([type isEqualToString:@"UPDATE"]) {
      batch = [batch updateData:parsedData forDocument:documentReference];
    }
  }

  [batch commitWithCompletion:^(NSError *_Nullable error) {
    if (error) {
      return [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      resolve(nil);
    }
  }];
}

- (void)sendSnapshotEvent:(FIRApp *)firApp
               databaseId:(NSString *)databaseId
               listenerId:(nonnull NSNumber *)listenerId
                 snapshot:(FIRDocumentSnapshot *)snapshot {
  NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firApp.name];
  NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:appName
                                                                   databaseId:databaseId];
  NSDictionary *serialized = [RNFBFirestoreSerialize documentSnapshotToDictionary:snapshot
                                                                     firestoreKey:firestoreKey];
  [[RNFBRCTEventEmitter shared]
      sendEventWithName:RNFB_FIRESTORE_DOCUMENT_SYNC
                   body:@{
                     @"appName" : [RNFBSharedUtils getAppJavaScriptName:firApp.name],
                     @"databaseId" : databaseId,
                     @"listenerId" : listenerId,
                     @"body" : @{
                       @"snapshot" : serialized,
                     }
                   }];
}

- (void)sendSnapshotError:(FIRApp *)firApp
               databaseId:(NSString *)databaseId
               listenerId:(nonnull NSNumber *)listenerId
                    error:(NSError *)error {
  NSArray *codeAndMessage = [RNFBFirestoreCommon getCodeAndMessage:error];
  [[RNFBRCTEventEmitter shared]
      sendEventWithName:RNFB_FIRESTORE_DOCUMENT_SYNC
                   body:@{
                     @"appName" : [RNFBSharedUtils getAppJavaScriptName:firApp.name],
                     @"databaseId" : databaseId,
                     @"listenerId" : listenerId,
                     @"body" : @{
                       @"error" : @{
                         @"code" : codeAndMessage[0],
                         @"message" : codeAndMessage[1],
                       }
                     }
                   }];
}

@end
