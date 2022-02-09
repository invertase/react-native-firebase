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

#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseQuery.h"
#import "RNFBDatabaseQueryModule.h"
#import "RNFBRCTEventEmitter.h"

static __strong NSMutableDictionary *queryDictionary;
static NSString *const RNFB_DATABASE_SYNC = @"database_sync_event";

@implementation RNFBDatabaseQueryModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseCommon getDispatchQueue];
}

- (id)init {
  self = [super init];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    queryDictionary = [[NSMutableDictionary alloc] init];
  });
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  NSArray *queryKeys = [queryDictionary allKeys];
  for (NSString *key in queryKeys) {
    RNFBDatabaseQuery *query = queryDictionary[key];
    [query removeAllEventListeners];
    [queryDictionary removeObjectForKey:key];
  }
}

- (RNFBDatabaseQuery *)getDatabaseQueryInstance:(FIRDatabaseReference *)reference
                                      modifiers:(NSArray *)modifiers {
  return [[RNFBDatabaseQuery alloc] initWithReferenceAndModifiers:reference modifiers:modifiers];
}

- (RNFBDatabaseQuery *)getDatabaseQueryInstance:(NSString *)key
                                      reference:(FIRDatabaseReference *)reference
                                      modifiers:(NSArray *)modifiers {
  RNFBDatabaseQuery *cachedQuery = queryDictionary[key];

  if (cachedQuery != nil) {
    return cachedQuery;
  }

  RNFBDatabaseQuery *query = [[RNFBDatabaseQuery alloc] initWithReferenceAndModifiers:reference
                                                                            modifiers:modifiers];

  queryDictionary[key] = query;
  return query;
}

- (void)addOnceEventListener:(RNFBDatabaseQuery *)databaseQuery
                   eventType:(NSString *)eventType
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  FIRDataEventType firDataEventType =
      (FIRDataEventType)[RNFBDatabaseCommon getEventTypeFromName:eventType];

  // On success
  id andPreviousSiblingKeyWithBlock =
      ^(FIRDataSnapshot *_Nonnull dataSnapshot, NSString *_Nullable previousChildName) {
        NSDictionary *data;
        if ([eventType isEqualToString:@"value"]) {
          data = [RNFBDatabaseCommon snapshotToDictionary:dataSnapshot];
        } else {
          data = [RNFBDatabaseCommon snapshotWithPreviousChildToDictionary:dataSnapshot
                                                         previousChildName:previousChildName];
        }
        resolve(data);
      };

  // On error
  id errorBlock = ^(NSError *_Nonnull error) {
    [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
  };

  [databaseQuery.query observeSingleEventOfType:firDataEventType
                 andPreviousSiblingKeyWithBlock:andPreviousSiblingKeyWithBlock
                                withCancelBlock:errorBlock];
}

- (void)addEventListener:(RNFBDatabaseQuery *)databaseQuery
               eventType:(NSString *)eventType
            registration:(NSDictionary *)registration {
  NSString *eventRegistrationKey = registration[@"eventRegistrationKey"];

  if (![databaseQuery hasEventListener:eventRegistrationKey]) {
    id andPreviousSiblingKeyWithBlock =
        ^(FIRDataSnapshot *_Nonnull dataSnapshot, NSString *_Nullable previousChildName) {
          [self handleDatabaseEvent:eventRegistrationKey
                          eventType:eventType
                       registration:registration
                           snapshot:dataSnapshot
                  previousChildName:previousChildName];
        };

    id errorBlock = ^(NSError *_Nonnull error) {
      [databaseQuery removeEventListener:eventRegistrationKey];
      [self handleDatabaseEventError:eventRegistrationKey registration:registration error:error];
    };

    FIRDataEventType firDataEventType =
        (FIRDataEventType)[RNFBDatabaseCommon getEventTypeFromName:eventType];
    FIRDatabaseHandle handle = [databaseQuery.query observeEventType:firDataEventType
                                      andPreviousSiblingKeyWithBlock:andPreviousSiblingKeyWithBlock
                                                     withCancelBlock:errorBlock];
    [databaseQuery addEventListener:eventRegistrationKey handle:handle];
  }
}

- (void)handleDatabaseEvent:(NSString *)key
                  eventType:(NSString *)eventType
               registration:(NSDictionary *)registration
                   snapshot:(FIRDataSnapshot *)dataSnapshot
          previousChildName:(NSString *)previousChildName {
  NSDictionary *data;
  if ([eventType isEqualToString:@"value"]) {
    data = [RNFBDatabaseCommon snapshotToDictionary:dataSnapshot];
  } else {
    data = [RNFBDatabaseCommon snapshotWithPreviousChildToDictionary:dataSnapshot
                                                   previousChildName:previousChildName];
  }

  [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_DATABASE_SYNC
                                             body:@{
                                               @"body" : @{
                                                 @"data" : data,
                                                 @"key" : key,
                                                 @"eventType" : eventType,
                                                 @"registration" : registration,
                                               }
                                             }];
}

- (void)handleDatabaseEventError:(NSString *)key
                    registration:(NSDictionary *)registration
                           error:(NSError *)error {
  NSArray *codeAndMessage = [RNFBDatabaseCommon getCodeAndMessage:error];
  [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_DATABASE_SYNC
                                             body:@{
                                               @"body" : @{
                                                 @"key" : key,
                                                 @"error" : @{
                                                   @"code" : codeAndMessage[0],
                                                   @"message" : codeAndMessage[1],
                                                 },
                                                 @"registration" : registration,
                                               }
                                             }];
}

#pragma mark -
#pragma mark Firebase Database

RCT_EXPORT_METHOD(once
                  : (FIRApp *)firebaseApp
                  : (NSString *)dbURL
                  : (NSString *)path
                  : (NSArray *)modifiers
                  : (NSString *)eventType
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:firDatabaseReference
                                                          modifiers:modifiers];

  [self addOnceEventListener:databaseQuery eventType:eventType resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(on : (FIRApp *)firebaseApp : (NSString *)dbURL : (NSDictionary *)props) {
  NSString *key = [props valueForKey:@"key"];
  NSString *path = [props valueForKey:@"path"];
  NSString *eventType = [props valueForKey:@"eventType"];
  NSArray *modifiers = [props valueForKey:@"modifiers"];
  NSDictionary *registration = [props valueForKey:@"registration"];

  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:key firebaseDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:key
                                                          reference:firDatabaseReference
                                                          modifiers:modifiers];
  [self addEventListener:databaseQuery eventType:eventType registration:registration];
}

RCT_EXPORT_METHOD(off
                  : (NSString *)queryKey eventRegistrationKey
                  : (NSString *)eventRegistrationKey) {
  RNFBDatabaseQuery *databaseQuery = queryDictionary[queryKey];

  if (databaseQuery != nil) {
    [databaseQuery removeEventListener:eventRegistrationKey];

    if (![databaseQuery hasListeners]) {
      [queryDictionary removeObjectForKey:queryKey];
      [RNFBDatabaseCommon removeReferenceByKey:queryKey];
    }
  }
}

RCT_EXPORT_METHOD(keepSynced
                  : (FIRApp *)firebaseApp
                  : (NSString *)dbURL
                  : (NSString *)key
                  : (NSString *)path
                  : (NSArray *)modifiers
                  : (BOOL)value
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:firDatabaseReference
                                                          modifiers:modifiers];
  [databaseQuery.query keepSynced:value];
  resolve([NSNull null]);
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

@end
