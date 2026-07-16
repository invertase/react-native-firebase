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
#else
@import FirebaseCore;
@import FirebaseDatabaseInternal;
#endif

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseQuery.h"
#import "RNFBDatabaseQueryHelper.h"
#import "RNFBRCTEventEmitter.h"

static __strong NSMutableDictionary *queryDictionary;
static NSString *const RNFB_DATABASE_SYNC = @"database_sync_event";

@implementation RNFBDatabaseQueryHelper

+ (NSMutableDictionary *)queryDictionary {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    queryDictionary = [[NSMutableDictionary alloc] init];
  });
  return queryDictionary;
}

+ (void)invalidate {
  NSMutableDictionary *queries = [self queryDictionary];
  NSArray *queryKeys = [queries allKeys];
  for (NSString *key in queryKeys) {
    RNFBDatabaseQuery *query = queries[key];
    [query removeAllEventListeners];
    [queries removeObjectForKey:key];
  }
}

+ (RNFBDatabaseQuery *)getDatabaseQueryInstance:(FIRDatabaseReference *)reference
                                       modifiers:(NSArray *)modifiers {
  return [[RNFBDatabaseQuery alloc] initWithReferenceAndModifiers:reference modifiers:modifiers];
}

+ (RNFBDatabaseQuery *)getDatabaseQueryInstance:(NSString *)key
                                       reference:(FIRDatabaseReference *)reference
                                       modifiers:(NSArray *)modifiers {
  NSMutableDictionary *queries = [self queryDictionary];
  RNFBDatabaseQuery *cachedQuery = queries[key];

  if (cachedQuery != nil) {
    return cachedQuery;
  }

  RNFBDatabaseQuery *query = [[RNFBDatabaseQuery alloc] initWithReferenceAndModifiers:reference
                                                                            modifiers:modifiers];

  queries[key] = query;
  return query;
}

+ (void)addOnceEventListener:(RNFBDatabaseQuery *)databaseQuery
                   eventType:(NSString *)eventType
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  FIRDataEventType firDataEventType =
      (FIRDataEventType)[RNFBDatabaseCommon getEventTypeFromName:eventType];

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

  id errorBlock = ^(NSError *_Nonnull error) {
    [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
  };

  [databaseQuery.query observeSingleEventOfType:firDataEventType
                 andPreviousSiblingKeyWithBlock:andPreviousSiblingKeyWithBlock
                                withCancelBlock:errorBlock];
}

+ (void)handleDatabaseEvent:(NSString *)key
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

+ (void)handleDatabaseEventError:(NSString *)key
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

+ (void)addEventListener:(RNFBDatabaseQuery *)databaseQuery
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

+ (void)once:(NSString *)app
        dbURL:(NSString *)dbURL
         path:(NSString *)path
    modifiers:(NSArray *)modifiers
    eventType:(NSString *)eventType
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:firDatabaseReference
                                                          modifiers:modifiers];

  [self addOnceEventListener:databaseQuery eventType:eventType resolve:resolve reject:reject];
}

+ (void)on:(NSString *)app dbURL:(NSString *)dbURL props:(NSDictionary *)props {
  NSString *key = [props valueForKey:@"key"];
  NSString *path = [props valueForKey:@"path"];
  NSString *eventType = [props valueForKey:@"eventType"];
  NSArray *modifiers = [props valueForKey:@"modifiers"];
  NSDictionary *registration = [props valueForKey:@"registration"];

  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:key firebaseDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:key
                                                          reference:firDatabaseReference
                                                          modifiers:modifiers];
  [self addEventListener:databaseQuery eventType:eventType registration:registration];
}

+ (void)off:(NSString *)queryKey eventRegistrationKey:(NSString *)eventRegistrationKey {
  NSMutableDictionary *queries = [self queryDictionary];
  RNFBDatabaseQuery *databaseQuery = queries[queryKey];

  if (databaseQuery != nil) {
    [databaseQuery removeEventListener:eventRegistrationKey];

    if (![databaseQuery hasListeners]) {
      [queries removeObjectForKey:queryKey];
      [RNFBDatabaseCommon removeReferenceByKey:queryKey];
    }
  }
}

+ (void)keepSynced:(NSString *)app
             dbURL:(NSString *)dbURL
               key:(NSString *)key
              path:(NSString *)path
         modifiers:(NSArray *)modifiers
           enabled:(BOOL)value
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:firDatabaseReference
                                                          modifiers:modifiers];
  [databaseQuery.query keepSynced:value];
  resolve([NSNull null]);
}

@end
