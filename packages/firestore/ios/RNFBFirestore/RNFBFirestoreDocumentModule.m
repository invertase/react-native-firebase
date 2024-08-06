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
#import <React/RCTUtils.h>

#import "RNFBFirestoreDocumentModule.h"

static __strong NSMutableDictionary *documentSnapshotListeners;
static NSString *const RNFB_FIRESTORE_DOCUMENT_SYNC = @"firestore_document_sync_event";

@implementation RNFBFirestoreDocumentModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return [RNFBFirestoreCommon getFirestoreQueue];
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
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

RCT_EXPORT_METHOD(documentOnSnapshot
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (nonnull NSNumber *)listenerId
                  : (NSDictionary *)listenerOptions) {
  if (documentSnapshotListeners[listenerId]) {
    return;
  }

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRDocumentReference *documentReference = [RNFBFirestoreCommon getDocumentForFirestore:firestore
                                                                                    path:path];

  __weak RNFBFirestoreDocumentModule *weakSelf = self;
  id listenerBlock = ^(FIRDocumentSnapshot *snapshot, NSError *error) {
    if (error) {
      id<FIRListenerRegistration> listener = documentSnapshotListeners[listenerId];
      if (listener) {
        [listener remove];
        [documentSnapshotListeners removeObjectForKey:listenerId];
      }
      [weakSelf sendSnapshotError:firebaseApp
                       databaseId:databaseId
                       listenerId:listenerId
                            error:error];
    } else {
      [weakSelf sendSnapshotEvent:firebaseApp
                       databaseId:databaseId
                       listenerId:listenerId
                         snapshot:snapshot];
    }
  };

  BOOL includeMetadataChanges = NO;
  if (listenerOptions[@"includeMetadataChanges"] != nil) {
    includeMetadataChanges = [listenerOptions[@"includeMetadataChanges"] boolValue];
  }

  id<FIRListenerRegistration> listener =
      [documentReference addSnapshotListenerWithIncludeMetadataChanges:includeMetadataChanges
                                                              listener:listenerBlock];
  documentSnapshotListeners[listenerId] = listener;
}

RCT_EXPORT_METHOD(documentOffSnapshot
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSNumber *)listenerId) {
  id<FIRListenerRegistration> listener = documentSnapshotListeners[listenerId];
  if (listener) {
    [listener remove];
    [documentSnapshotListeners removeObjectForKey:listenerId];
  }
}

RCT_EXPORT_METHOD(documentGet
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (NSDictionary *)getOptions
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRDocumentReference *documentReference = [RNFBFirestoreCommon getDocumentForFirestore:firestore
                                                                                    path:path];

  FIRFirestoreSource source;

  if (getOptions[@"source"]) {
    if ([getOptions[@"source"] isEqualToString:@"server"]) {
      source = FIRFirestoreSourceServer;
    } else if ([getOptions[@"source"] isEqualToString:@"cache"]) {
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
                     NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name];
                     NSString *firestoreKey =
                         [RNFBFirestoreCommon createFirestoreKeyWithAppName:appName
                                                                 databaseId:databaseId];
                     NSDictionary *serialized =
                         [RNFBFirestoreSerialize documentSnapshotToDictionary:snapshot
                                                                 firestoreKey:firestoreKey];
                     resolve(serialized);
                   }
                 }];
}

RCT_EXPORT_METHOD(documentDelete
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
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

RCT_EXPORT_METHOD(documentSet
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (NSDictionary *)data
                  : (NSDictionary *)options
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
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

RCT_EXPORT_METHOD(documentUpdate
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (NSDictionary *)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
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

RCT_EXPORT_METHOD(documentBatch
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSArray *)writes
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
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
