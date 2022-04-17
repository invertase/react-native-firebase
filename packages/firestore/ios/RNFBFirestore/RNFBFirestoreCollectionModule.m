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

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];
  [[FIRFirestore firestore] getQueryNamed:name
                               completion:^(FIRQuery *query) {
                                 if (query == nil) {
                                   [self sendSnapshotError:firebaseApp
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
                                              firestoreQuery:firestoreQuery
                                                  listenerId:listenerId
                                             listenerOptions:listenerOptions];
                               }];
}

RCT_EXPORT_METHOD(collectionOnSnapshot
                  : (FIRApp *)firebaseApp
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

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];
  FIRQuery *query = [RNFBFirestoreCommon getQueryForFirestore:firestore path:path type:type];

  RNFBFirestoreQuery *firestoreQuery = [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                                               query:query
                                                                             filters:filters
                                                                              orders:orders
                                                                             options:options];
  [self handleQueryOnSnapshot:firebaseApp
               firestoreQuery:firestoreQuery
                   listenerId:listenerId
              listenerOptions:listenerOptions];
}

RCT_EXPORT_METHOD(collectionOffSnapshot : (FIRApp *)firebaseApp : (nonnull NSNumber *)listenerId) {
  id<FIRListenerRegistration> listener = collectionSnapshotListeners[listenerId];
  if (listener) {
    [listener remove];
    [collectionSnapshotListeners removeObjectForKey:listenerId];
  }
}

RCT_EXPORT_METHOD(namedQueryGet
                  : (FIRApp *)firebaseApp
                  : (NSString *)name
                  : (NSString *)type
                  : (NSArray *)filters
                  : (NSArray *)orders
                  : (NSDictionary *)options
                  : (NSDictionary *)getOptions
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];
  [[FIRFirestore firestore]
      getQueryNamed:name
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
                 firestoreQuery:firestoreQuery
                         source:source
                        resolve:resolve
                         reject:reject];
         }];
}

RCT_EXPORT_METHOD(collectionGet
                  : (FIRApp *)firebaseApp
                  : (NSString *)path
                  : (NSString *)type
                  : (NSArray *)filters
                  : (NSArray *)orders
                  : (NSDictionary *)options
                  : (NSDictionary *)getOptions
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];
  FIRQuery *query = [RNFBFirestoreCommon getQueryForFirestore:firestore path:path type:type];

  RNFBFirestoreQuery *firestoreQuery = [[RNFBFirestoreQuery alloc] initWithModifiers:firestore
                                                                               query:query
                                                                             filters:filters
                                                                              orders:orders
                                                                             options:options];
  FIRFirestoreSource source = [self getSource:getOptions];
  [self handleQueryGet:firebaseApp
        firestoreQuery:firestoreQuery
                source:source
               resolve:resolve
                reject:reject];
}

- (void)handleQueryOnSnapshot:(FIRApp *)firebaseApp
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
      [weakSelf sendSnapshotError:firebaseApp listenerId:listenerId error:error];
    } else {
      [weakSelf sendSnapshotEvent:firebaseApp
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
                                                                    appName:appName];
                      resolve(serialized);
                    }
                  }];
}

- (void)sendSnapshotEvent:(FIRApp *)firApp
                listenerId:(nonnull NSNumber *)listenerId
                  snapshot:(FIRQuerySnapshot *)snapshot
    includeMetadataChanges:(BOOL)includeMetadataChanges {
  NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firApp.name];
  NSDictionary *serialized =
      [RNFBFirestoreSerialize querySnapshotToDictionary:@"onSnapshot"
                                               snapshot:snapshot
                                 includeMetadataChanges:includeMetadataChanges
                                                appName:appName];
  [[RNFBRCTEventEmitter shared]
      sendEventWithName:RNFB_FIRESTORE_COLLECTION_SYNC
                   body:@{
                     @"appName" : [RNFBSharedUtils getAppJavaScriptName:firApp.name],
                     @"listenerId" : listenerId,
                     @"body" : @{
                       @"snapshot" : serialized,
                     }
                   }];
}

- (void)sendSnapshotError:(FIRApp *)firApp
               listenerId:(nonnull NSNumber *)listenerId
                    error:(NSError *)error {
  NSArray *codeAndMessage = [RNFBFirestoreCommon getCodeAndMessage:error];
  [[RNFBRCTEventEmitter shared]
      sendEventWithName:RNFB_FIRESTORE_COLLECTION_SYNC
                   body:@{
                     @"appName" : [RNFBSharedUtils getAppJavaScriptName:firApp.name],
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
