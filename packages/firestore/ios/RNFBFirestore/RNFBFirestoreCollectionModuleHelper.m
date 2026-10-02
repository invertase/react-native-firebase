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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseFirestore/FirebaseFirestore.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseFirestore/FirebaseFirestore.h>
#else
@import FirebaseCore;
@import FirebaseFirestore;
#endif

#if __has_include(<RNFBFirestore/RNFBFirestore-Swift.h>)
#import <RNFBFirestore/RNFBFirestore-Swift.h>
#elif __has_include("RNFBFirestore-Swift.h")
#import "RNFBFirestore-Swift.h"
#elif __has_include("RNFBFirestore/RNFBFirestorePipelineCallHandlerHostStub.h")
#import "RNFBFirestore/RNFBFirestorePipelineCallHandlerHostStub.h"
#else
#error "RNFBFirestore Swift interface not found"
#endif

#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTUtils.h>
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBFirestoreCollectionModuleHelper.h"
#import "RNFBFirestoreCommon.h"
#import "RNFBFirestoreListenerRegistry.h"
#import "RNFBFirestoreQuery.h"
#import "RNFBFirestoreSerialize.h"

static RNFBFirestoreListenerRegistry *collectionSnapshotListeners;
static NSString *const RNFB_FIRESTORE_COLLECTION_SYNC = @"firestore_collection_sync_event";

@implementation RNFBFirestoreCollectionModuleHelper

+ (void)ensureListeners {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    collectionSnapshotListeners = [[RNFBFirestoreListenerRegistry alloc] init];
  });
}

+ (void)invalidate {
  [self ensureListeners];
  [collectionSnapshotListeners removeAll];
}

#pragma mark Firebase Firestore Methods

+ (void)namedQueryOnSnapshot:(NSString *)appName
                  databaseId:(NSString *)databaseId
                   queryName:(NSString *)queryName
                        type:(NSString *)type
                     filters:(NSArray *)filters
                      orders:(NSArray *)orders
                     options:(NSDictionary *)options
                  listenerId:(double)listenerId
       snapshotListenOptions:(NSDictionary *)snapshotListenOptions {
  [self ensureListeners];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *listenerIdNumber = @(listenerId);

  if ([collectionSnapshotListeners get:listenerIdNumber] != nil) {
    return;
  }

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  [firestore getQueryNamed:queryName
                completion:^(FIRQuery *query) {
                  if (query == nil) {
                    [RNFBFirestoreCollectionModuleHelper sendSnapshotError:firebaseApp
                                                                databaseId:databaseId
                                                                listenerId:listenerIdNumber
                                                                     error:nil];
                    return;
                  }

                  RNFBFirestoreQuery *firestoreQuery =
                      [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                              query:query
                                                            filters:filters
                                                             orders:orders
                                                            options:options];
                  [RNFBFirestoreCollectionModuleHelper handleQueryOnSnapshot:firebaseApp
                                                                  databaseId:databaseId
                                                              firestoreQuery:firestoreQuery
                                                                  listenerId:listenerIdNumber
                                                             listenerOptions:snapshotListenOptions];
                }];
}

+ (void)collectionOnSnapshot:(NSString *)appName
                  databaseId:(NSString *)databaseId
                        path:(NSString *)path
                        type:(NSString *)type
                     filters:(NSArray *)filters
                      orders:(NSArray *)orders
                     options:(NSDictionary *)options
                  listenerId:(double)listenerId
       snapshotListenOptions:(NSDictionary *)snapshotListenOptions {
  [self ensureListeners];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *listenerIdNumber = @(listenerId);

  if ([collectionSnapshotListeners get:listenerIdNumber] != nil) {
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
  [RNFBFirestoreCollectionModuleHelper handleQueryOnSnapshot:firebaseApp
                                                  databaseId:databaseId
                                              firestoreQuery:firestoreQuery
                                                  listenerId:listenerIdNumber
                                             listenerOptions:snapshotListenOptions];
}

+ (void)collectionOffSnapshot:(NSString *)appName
                   databaseId:(NSString *)databaseId
                   listenerId:(double)listenerId {
  [self ensureListeners];
  NSNumber *listenerIdNumber = @(listenerId);
  [collectionSnapshotListeners takeAndRemove:listenerIdNumber];
}

+ (void)namedQueryGet:(NSString *)appName
           databaseId:(NSString *)databaseId
            queryName:(NSString *)queryName
                 type:(NSString *)type
              filters:(NSArray *)filters
               orders:(NSArray *)orders
              options:(NSDictionary *)options
           getOptions:(NSDictionary *)getOptions
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  [firestore getQueryNamed:queryName
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
                  FIRFirestoreSource source =
                      [RNFBFirestoreCollectionModuleHelper getSource:getOptions];
                  [RNFBFirestoreCollectionModuleHelper handleQueryGet:firebaseApp
                                                           databaseId:databaseId
                                                       firestoreQuery:firestoreQuery
                                                               source:source
                                                              resolve:resolve
                                                               reject:reject];
                }];
}

+ (void)collectionCount:(NSString *)appName
             databaseId:(NSString *)databaseId
                   path:(NSString *)path
                   type:(NSString *)type
                filters:(NSArray *)filters
                 orders:(NSArray *)orders
                options:(NSDictionary *)options
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

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

+ (void)aggregateQuery:(NSString *)appName
            databaseId:(NSString *)databaseId
                  path:(NSString *)path
                  type:(NSString *)type
               filters:(NSArray *)filters
                orders:(NSArray *)orders
               options:(NSDictionary *)options
      aggregateQueries:(NSArray *)aggregateQueries
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSArray *aggregateQueriesArray = aggregateQueries;

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

  for (NSDictionary *aggregateQueryItem in aggregateQueriesArray) {
    NSString *aggregateType = aggregateQueryItem[@"aggregateType"];
    NSString *fieldPath = aggregateQueryItem[@"field"];

    if ([aggregateType isEqualToString:@"count"]) {
      [aggregateFields addObject:[FIRAggregateField aggregateFieldForCount]];
    } else if ([aggregateType isEqualToString:@"sum"]) {
      [aggregateFields addObject:[FIRAggregateField aggregateFieldForSumOfField:fieldPath]];
    } else if ([aggregateType isEqualToString:@"avg"]) {
      [aggregateFields addObject:[FIRAggregateField aggregateFieldForAverageOfField:fieldPath]];
    } else {
      NSString *reason = [@"Invalid Aggregate Type: " stringByAppendingString:aggregateType];
      [RNFBFirestoreCommon
          promiseRejectFirestoreException:reject
                                    error:[NSError errorWithDomain:@"RNFB Firestore"
                                                              code:0
                                                          userInfo:@{
                                                            NSLocalizedDescriptionKey : reason
                                                          }]];
      return;
    }
  }

  FIRAggregateQuery *aggregateQueryInstance = [query aggregate:aggregateFields];

  [aggregateQueryInstance
      aggregationWithSource:FIRAggregateSourceServer
                 completion:^(FIRAggregateQuerySnapshot *_Nullable snapshot,
                              NSError *_Nullable error) {
                   if (error) {
                     [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
                   } else {
                     NSMutableDictionary *snapshotMap = [NSMutableDictionary dictionary];

                     for (NSDictionary *aggregateQueryItem in aggregateQueriesArray) {
                       NSString *aggregateType = aggregateQueryItem[@"aggregateType"];
                       NSString *fieldPath = aggregateQueryItem[@"field"];
                       NSString *key = aggregateQueryItem[@"key"];

                       if ([aggregateType isEqualToString:@"count"]) {
                         snapshotMap[key] = snapshot.count;
                       } else if ([aggregateType isEqualToString:@"sum"]) {
                         NSNumber *sum = [snapshot
                             valueForAggregateField:[FIRAggregateField
                                                        aggregateFieldForSumOfField:fieldPath]];
                         snapshotMap[key] = sum;
                       } else if ([aggregateType isEqualToString:@"avg"]) {
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

+ (void)pipelineExecute:(NSString *)appName
             databaseId:(NSString *)databaseId
               pipeline:(NSDictionary *)pipeline
                options:(NSDictionary *)options
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  RNFBFirestorePipelineCallHandler *handler = [[RNFBFirestorePipelineCallHandler alloc] init];
  [handler executeWithFirestore:firestore
                       pipeline:pipeline
                        options:options
                     completion:^(NSDictionary *_Nullable result, NSDictionary *_Nullable error) {
                       if (error != nil) {
                         NSError *nativeError = error[@"nativeError"];
                         if (nativeError != nil) {
                           [RNFBFirestoreCommon promiseRejectFirestoreException:reject
                                                                          error:nativeError];
                           return;
                         }

                         NSString *code = error[@"code"];
                         NSString *message = error[@"message"];
                         reject(code ?: @"firestore/unknown",
                                message ?: @"Failed to execute pipeline.", nil);
                         return;
                       }
                       if (result == nil) {
                         reject(@"firestore/unknown",
                                @"Failed to execute pipeline: empty pipeline response.", nil);
                         return;
                       }

                       resolve(result);
                     }];
}

+ (void)collectionGet:(NSString *)appName
           databaseId:(NSString *)databaseId
                 path:(NSString *)path
                 type:(NSString *)type
              filters:(NSArray *)filters
               orders:(NSArray *)orders
              options:(NSDictionary *)options
           getOptions:(NSDictionary *)getOptions
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  FIRQuery *query = [RNFBFirestoreCommon getQueryForFirestore:firestore path:path type:type];

  RNFBFirestoreQuery *firestoreQuery = [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                                               query:query
                                                                             filters:filters
                                                                              orders:orders
                                                                             options:options];
  FIRFirestoreSource source = [RNFBFirestoreCollectionModuleHelper getSource:getOptions];
  [RNFBFirestoreCollectionModuleHelper handleQueryGet:firebaseApp
                                           databaseId:databaseId
                                       firestoreQuery:firestoreQuery
                                               source:source
                                              resolve:resolve
                                               reject:reject];
}

+ (void)handleQueryOnSnapshot:(FIRApp *)firebaseApp
                   databaseId:(NSString *)databaseId
               firestoreQuery:(RNFBFirestoreQuery *)firestoreQuery
                   listenerId:(nonnull NSNumber *)listenerId
              listenerOptions:(NSDictionary *)listenerOptions {
  BOOL includeMetadataChanges = NO;
  FIRListenSource source = FIRListenSourceDefault;
  if (listenerOptions[KEY_INCLUDE_METADATA_CHANGES] != nil) {
    includeMetadataChanges = [listenerOptions[KEY_INCLUDE_METADATA_CHANGES] boolValue];
  }
  if ([listenerOptions[KEY_SOURCE] isEqualToString:@"cache"]) {
    source = FIRListenSourceCache;
  }

  id listenerBlock = ^(FIRQuerySnapshot *snapshot, NSError *error) {
    if (error) {
      [collectionSnapshotListeners takeAndRemove:listenerId];
      [RNFBFirestoreCollectionModuleHelper sendSnapshotError:firebaseApp
                                                  databaseId:databaseId
                                                  listenerId:listenerId
                                                       error:error];
    } else {
      [RNFBFirestoreCollectionModuleHelper sendSnapshotEvent:firebaseApp
                                                  databaseId:databaseId
                                                  listenerId:listenerId
                                                    snapshot:snapshot
                                      includeMetadataChanges:includeMetadataChanges];
    }
  };

  FIRSnapshotListenOptions *snapshotListenOptions = [[[[FIRSnapshotListenOptions alloc] init]
      optionsWithIncludeMetadataChanges:includeMetadataChanges] optionsWithSource:source];
  id<FIRListenerRegistration> listener =
      [[firestoreQuery instance] addSnapshotListenerWithOptions:snapshotListenOptions
                                                       listener:listenerBlock];
  [collectionSnapshotListeners putOrDiscard:listenerId value:listener];
}

+ (void)handleQueryGet:(FIRApp *)firebaseApp
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

+ (void)sendSnapshotEvent:(FIRApp *)firApp
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

+ (void)sendSnapshotError:(FIRApp *)firApp
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

+ (FIRFirestoreSource)getSource:(NSDictionary *)getOptions {
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
