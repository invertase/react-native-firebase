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
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseGetErrors.h"
#import "RNFBDatabaseQuery.h"
#import "RNFBDatabaseQueryHelper.h"
#import "RNFBDatabaseQueryRegistry.h"
#import "RNFBRCTEventEmitter.h"

static RNFBDatabaseQueryRegistry *queryRegistry;
static NSString *const RNFB_DATABASE_SYNC = @"database_sync_event";

@implementation RNFBDatabaseQueryHelper

+ (RNFBDatabaseQueryRegistry *)queryRegistry {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    queryRegistry = [[RNFBDatabaseQueryRegistry alloc] init];
  });
  return queryRegistry;
}

+ (void)invalidate {
  [[self queryRegistry] removeAll];
}

+ (RNFBDatabaseQuery *)getDatabaseQueryInstance:(FIRDatabaseReference *)reference
                                      modifiers:(NSArray *)modifiers {
  return [[RNFBDatabaseQuery alloc] initWithReferenceAndModifiers:reference modifiers:modifiers];
}

+ (RNFBDatabaseQuery *)getDatabaseQueryInstance:(NSString *)key
                                      reference:(FIRDatabaseReference *)reference
                                      modifiers:(NSArray *)modifiers {
  RNFBDatabaseQueryRegistry *queries = [self queryRegistry];
  id cachedQuery = [queries get:key];

  if ([cachedQuery isKindOfClass:[RNFBDatabaseQuery class]]) {
    return cachedQuery;
  }

  RNFBDatabaseQuery *query = [[RNFBDatabaseQuery alloc] initWithReferenceAndModifiers:reference
                                                                            modifiers:modifiers];

  NSError *error = nil;
  if (![queries put:key value:query error:&error]) {
    id winner = [queries get:key];
    if ([winner isKindOfClass:[RNFBDatabaseQuery class]]) {
      return winner;
    }
  }
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
    if (![databaseQuery addEventListener:eventRegistrationKey handle:handle]) {
      [databaseQuery.query removeObserverWithHandle:handle];
    }
  }
}

+ (RNFBDatabaseQuery *)databaseQueryForApp:(NSString *)app
                                     dbURL:(NSString *)dbURL
                                      path:(NSString *)path
                                 modifiers:(NSArray *)modifiers {
  FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference =
      [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];
  return [self getDatabaseQueryInstance:firDatabaseReference modifiers:modifiers];
}

+ (void)once:(NSString *)app
        dbURL:(NSString *)dbURL
         path:(NSString *)path
    modifiers:(NSArray *)modifiers
    eventType:(NSString *)eventType
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject {
  RNFBDatabaseQuery *databaseQuery = [self databaseQueryForApp:app
                                                         dbURL:dbURL
                                                          path:path
                                                     modifiers:modifiers];
  [self addOnceEventListener:databaseQuery eventType:eventType resolve:resolve reject:reject];
}

// Before FirebaseDatabase 13.2.0, getData returns a covering ancestor's whole node for a child path
// (firebase/firebase-ios-sdk#12168), never completes a get in flight when the socket drops
// (firebase/firebase-ios-sdk#16717) and fails a rejected read without the server's reason, which
// RNFBDatabaseGetErrors needs to tell a denial apart. An app can still pin an older SDK with
// $FirebaseSDKVersion.
+ (BOOL)isGetDataReliable {
  static BOOL reliable;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    reliable = [FIRFirebaseVersion() compare:@"13.2.0"
                                     options:NSNumericSearch] != NSOrderedAscending;
  });
  return reliable;
}

+ (void)get:(NSString *)app
        dbURL:(NSString *)dbURL
         path:(NSString *)path
    modifiers:(NSArray *)modifiers
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject {
  // Single request/response read backing modular get(). JS routes queries and .info paths to
  // once() before this.
  RNFBDatabaseQuery *databaseQuery = [self databaseQueryForApp:app
                                                         dbURL:dbURL
                                                          path:path
                                                     modifiers:modifiers];

  // Read through once() on an SDK whose getData is unreliable, or with disk persistence on: getData
  // then answers an offline read from disk only after its 3s connect timeout, where once() answers
  // from disk at once (Android's native get uses once() with persistence on too).
  if (![self isGetDataReliable] || databaseQuery.query.ref.database.persistenceEnabled) {
    [self addOnceEventListener:databaseQuery eventType:@"value" resolve:resolve reject:reject];
    return;
  }

  [databaseQuery.query
      getDataWithCompletionBlock:^(NSError *_Nullable error, FIRDataSnapshot *_Nullable snapshot) {
        if (error == nil && snapshot != nil) {
          resolve([RNFBDatabaseCommon snapshotToDictionary:snapshot]);
          return;
        }
        // A denial rejects as once() would; anything else, "Client is offline." after getData's 3s
        // connect timeout included, rejects as database/unknown, which DatabaseQuery._get retries
        // as once('value'), the same rule as Android's Query.get() failures.
        if ([RNFBDatabaseGetErrors isPermissionDenied:error]) {
          [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
          return;
        }
        NSString *message = error.localizedDescription ?: @"An unknown error has occurred.";
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                          userInfo:[@{
                                            @"code" : @"unknown",
                                            @"message" : message,
                                          } mutableCopy]];
      }];
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
  RNFBDatabaseQueryRegistry *queries = [self queryRegistry];
  id cached = [queries get:queryKey];

  if ([cached isKindOfClass:[RNFBDatabaseQuery class]]) {
    RNFBDatabaseQuery *databaseQuery = cached;
    [databaseQuery removeEventListener:eventRegistrationKey];

    if ([queries takeIfIdle:queryKey] != nil) {
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
