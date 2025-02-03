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

#import "RNFBFirestoreCollectionModule.h"

static __strong NSMutableDictionary *collectionSnapshotListeners;
static NSString *const RNFB_FIRESTORE_COLLECTION_SYNC = @"firestore_collection_sync_event";

@implementation RNFBFirestoreCollectionModule
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
    collectionSnapshotListeners = [[NSMutableDictionary alloc] init];
  });
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  for (NSString *key in [collectionSnapshotListeners allKeys]) {
    id<FIRListenerRegistration> listener = collectionSnapshotListeners[key];
    [listener remove];
    [collectionSnapshotListeners removeObjectForKey:key];
  }
}

#pragma mark -
#pragma mark Firebase Firestore Methods

RCT_EXPORT_METHOD(namedQueryOnSnapshot
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)name
                  : (NSString *)type
                  : (NSArray *)filters
                  : (NSArray *)orders
                  : (NSDictionary *)options
                  : (nonnull NSNumber *)listenerId
                  : (NSDictionary *)listenerOptions) {
  if (collectionSnapshotListeners[listenerId]) {
    return;
  }

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  [firestore getQueryNamed:name
                completion:^(FIRQuery *query) {
                  if (query == nil) {
                    [self sendSnapshotError:firebaseApp
                                 databaseId:databaseId
                                 listenerId:listenerId
                                      error:nil];
                    return;
                  }

                  RNFBFirestoreQuery *firestoreQuery =
                      [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                              query:query
                                                            filters:filters
                                                             orders:orders
                                                            options:options];
                  [self handleQueryOnSnapshot:firebaseApp
                                   databaseId:databaseId
                               firestoreQuery:firestoreQuery
                                   listenerId:listenerId
                              listenerOptions:listenerOptions];
                }];
}

RCT_EXPORT_METHOD(collectionOnSnapshot
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (NSString *)type
                  : (NSArray *)filters
                  : (NSArray *)orders
                  : (NSDictionary *)options
                  : (nonnull NSNumber *)listenerId
                  : (NSDictionary *)listenerOptions) {
  if (collectionSnapshotListeners[listenerId]) {
    return;
  }

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRQuery *query = [RNFBFirestoreCommon getQueryForFirestore:firestore path:path type:type];

  RNFBFirestoreQuery *firestoreQuery = [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                                               query:query
                                                                             filters:filters
                                                                              orders:orders
                                                                             options:options];
  [self handleQueryOnSnapshot:firebaseApp
                   databaseId:databaseId
               firestoreQuery:firestoreQuery
                   listenerId:listenerId
              listenerOptions:listenerOptions];
}

RCT_EXPORT_METHOD(collectionOffSnapshot
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSNumber *)listenerId) {
  id<FIRListenerRegistration> listener = collectionSnapshotListeners[listenerId];
  if (listener) {
    [listener remove];
    [collectionSnapshotListeners removeObjectForKey:listenerId];
  }
}

RCT_EXPORT_METHOD(namedQueryGet
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)name
                  : (NSString *)type
                  : (NSArray *)filters
                  : (NSArray *)orders
                  : (NSDictionary *)options
                  : (NSDictionary *)getOptions
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  [firestore getQueryNamed:name
                completion:^(FIRQuery *query) {
                  if (query == nil) {
                    return [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:nil];
                  }

                  RNFBFirestoreQuery *firestoreQuery =
                      [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                              query:query
                                                            filters:filters
                                                             orders:orders
                                                            options:options];
                  FIRFirestoreSource source = [self getSource:getOptions];
                  [self handleQueryGet:firebaseApp
                            databaseId:databaseId
                        firestoreQuery:firestoreQuery
                                source:source
                               resolve:resolve
                                reject:reject];
                }];
}

RCT_EXPORT_METHOD(collectionCount
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (NSString *)type
                  : (NSArray *)filters
                  : (NSArray *)orders
                  : (NSDictionary *)options
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRQuery *query = [RNFBFirestoreCommon getQueryForFirestore:firestore path:path type:type];
  RNFBFirestoreQuery *firestoreQuery = [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                                               query:query
                                                                             filters:filters
                                                                              orders:orders
                                                                             options:options];

  // NOTE: There is only "server" as the source at the moment. So this
  // is unused for the time being. Using "FIRAggregateSourceServer".
  // NSString *source = arguments[@"source"];

  FIRAggregateQuery *aggregateQuery = [firestoreQuery.query count];

  [aggregateQuery
      aggregationWithSource:FIRAggregateSourceServer
                 completion:^(FIRAggregateQuerySnapshot *_Nullable snapshot,
                              NSError *_Nullable error) {
                   if (error) {
                     [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
                   } else {
                     NSMutableDictionary *snapshotMap = [NSMutableDictionary dictionary];
                     snapshotMap[@"count"] = snapshot.count;
                     resolve(snapshotMap);
                   }
                 }];
}

RCT_EXPORT_METHOD(aggregateQuery
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (NSString *)type
                  : (NSArray *)filters
                  : (NSArray *)orders
                  : (NSDictionary *)options
                  : (NSArray *)aggregateQueries
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];

  FIRQuery *firestoreBaseQuery = [RNFBFirestoreCommon getQueryForFirestore:firestore
                                                                      path:path
                                                                      type:type];
  RNFBFirestoreQuery *firestoreQuery =
      [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                              query:firestoreBaseQuery
                                            filters:filters
                                             orders:orders
                                            options:options];

  FIRQuery *query = [firestoreQuery instance];

  NSMutableArray<FIRAggregateField *> *aggregateFields =
      [[NSMutableArray<FIRAggregateField *> alloc] init];

  for (NSDictionary *aggregateQuery in aggregateQueries) {
    NSString *aggregateType = aggregateQuery[@"aggregateType"];
    NSString *fieldPath = aggregateQuery[@"field"];

    if ([aggregateType isEqualToString:@"count"]) {
      [aggregateFields addObject:[FIRAggregateField aggregateFieldForCount]];
    } else if ([aggregateType isEqualToString:@"sum"]) {
      [aggregateFields addObject:[FIRAggregateField aggregateFieldForSumOfField:fieldPath]];
    } else if ([aggregateType isEqualToString:@"average"]) {
      [aggregateFields addObject:[FIRAggregateField aggregateFieldForAverageOfField:fieldPath]];
    } else {
      NSString *reason = [@"Invalid Aggregate Type: " stringByAppendingString:aggregateType];
      [RNFBFirestoreCommon
          promiseRejectFirestoreException:reject
                                    error:[NSException exceptionWithName:
                                                           @"RNFB Firestore: Invalid Aggregate Type"
                                                                  reason:reason
                                                                userInfo:nil]];
      return;
    }
  }

  FIRAggregateQuery *aggregateQuery = [query aggregate:aggregateFields];

  [aggregateQuery
      aggregationWithSource:FIRAggregateSourceServer
                 completion:^(FIRAggregateQuerySnapshot *_Nullable snapshot,
                              NSError *_Nullable error) {
                   if (error) {
                     [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
                   } else {
                     NSMutableDictionary *snapshotMap = [NSMutableDictionary dictionary];

                     for (NSDictionary *aggregateQuery in aggregateQueries) {
                       NSString *aggregateType = aggregateQuery[@"aggregateType"];
                       NSString *fieldPath = aggregateQuery[@"field"];
                       NSString *key = aggregateQuery[@"key"];

                       if ([aggregateType isEqualToString:@"count"]) {
                         snapshotMap[key] = snapshot.count;
                       } else if ([aggregateType isEqualToString:@"sum"]) {
                         NSNumber *sum = [snapshot
                             valueForAggregateField:[FIRAggregateField
                                                        aggregateFieldForSumOfField:fieldPath]];
                         snapshotMap[key] = sum;
                       } else if ([aggregateType isEqualToString:@"average"]) {
                         NSNumber *average = [snapshot
                             valueForAggregateField:[FIRAggregateField
                                                        aggregateFieldForAverageOfField:fieldPath]];
                         snapshotMap[key] = (average == nil ? [NSNull null] : average);
                       }
                     }
                     resolve(snapshotMap);
                   }
                 }];
}

RCT_EXPORT_METHOD(collectionGet
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (NSString *)path
                  : (NSString *)type
                  : (NSArray *)filters
                  : (NSArray *)orders
                  : (NSDictionary *)options
                  : (NSDictionary *)getOptions
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRQuery *query = [RNFBFirestoreCommon getQueryForFirestore:firestore path:path type:type];

  RNFBFirestoreQuery *firestoreQuery = [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                                               query:query
                                                                             filters:filters
                                                                              orders:orders
                                                                             options:options];
  FIRFirestoreSource source = [self getSource:getOptions];
  [self handleQueryGet:firebaseApp
            databaseId:databaseId
        firestoreQuery:firestoreQuery
                source:source
               resolve:resolve
                reject:reject];
}

- (void)handleQueryOnSnapshot:(FIRApp *)firebaseApp
                   databaseId:(NSString *)databaseId
               firestoreQuery:(RNFBFirestoreQuery *)firestoreQuery
                   listenerId:(nonnull NSNumber *)listenerId
              listenerOptions:(NSDictionary *)listenerOptions {
  BOOL includeMetadataChanges = NO;
  if (listenerOptions[KEY_INCLUDE_METADATA_CHANGES] != nil) {
    includeMetadataChanges = [listenerOptions[KEY_INCLUDE_METADATA_CHANGES] boolValue];
  }

  __weak RNFBFirestoreCollectionModule *weakSelf = self;
  id listenerBlock = ^(FIRQuerySnapshot *snapshot, NSError *error) {
    if (error) {
      id<FIRListenerRegistration> listener = collectionSnapshotListeners[listenerId];
      if (listener) {
        [listener remove];
        [collectionSnapshotListeners removeObjectForKey:listenerId];
      }
      [weakSelf sendSnapshotError:firebaseApp
                       databaseId:databaseId
                       listenerId:listenerId
                            error:error];
    } else {
      [weakSelf sendSnapshotEvent:firebaseApp
                       databaseId:databaseId
                       listenerId:listenerId
                         snapshot:snapshot
           includeMetadataChanges:includeMetadataChanges];
    }
  };

  id<FIRListenerRegistration> listener = [[firestoreQuery instance]
      addSnapshotListenerWithIncludeMetadataChanges:includeMetadataChanges
                                           listener:listenerBlock];
  collectionSnapshotListeners[listenerId] = listener;
}

- (void)handleQueryGet:(FIRApp *)firebaseApp
            databaseId:(NSString *)databaseId
        firestoreQuery:(RNFBFirestoreQuery *)firestoreQuery
                source:(FIRFirestoreSource)source
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  [[firestoreQuery instance]
      getDocumentsWithSource:source
                  completion:^(FIRQuerySnapshot *snapshot, NSError *error) {
                    if (error) {
                      return [RNFBFirestoreCommon promiseRejectFirestoreException:reject
                                                                            error:error];
                    } else {
                      NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name];
                      NSDictionary *serialized =
                          [RNFBFirestoreSerialize querySnapshotToDictionary:@"get"
                                                                   snapshot:snapshot
                                                     includeMetadataChanges:false
                                                                    appName:appName
                                                                 databaseId:databaseId];
                      resolve(serialized);
                    }
                  }];
}

- (void)sendSnapshotEvent:(FIRApp *)firApp
                databaseId:(NSString *)databaseId
                listenerId:(nonnull NSNumber *)listenerId
                  snapshot:(FIRQuerySnapshot *)snapshot
    includeMetadataChanges:(BOOL)includeMetadataChanges {
  NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firApp.name];
  NSDictionary *serialized =
      [RNFBFirestoreSerialize querySnapshotToDictionary:@"onSnapshot"
                                               snapshot:snapshot
                                 includeMetadataChanges:includeMetadataChanges
                                                appName:appName
                                             databaseId:databaseId];
  [[RNFBRCTEventEmitter shared]
      sendEventWithName:RNFB_FIRESTORE_COLLECTION_SYNC
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
      sendEventWithName:RNFB_FIRESTORE_COLLECTION_SYNC
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

- (FIRFirestoreSource)getSource:(NSDictionary *)getOptions {
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

  return source;
}

@end
