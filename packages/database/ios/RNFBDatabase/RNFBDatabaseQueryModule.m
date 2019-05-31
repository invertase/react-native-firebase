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
#import "RNFBDatabaseQueryModule.h"
#import "RNFBDatabaseQuery.h"

static __strong NSMutableDictionary *queryDictionary;

@implementation RNFBDatabaseQueryModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_queue_create("io.invertase.firebase.database", DISPATCH_QUEUE_SERIAL);
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
  for (NSString *key in queryDictionary) {
    RNFBDatabaseQuery *query = queryDictionary[key];
    // TODO remove all query listeners
//    [query invalidate];
    [queryDictionary removeObjectForKey:key];
  }
}

- (RNFBDatabaseQuery *)getDatabaseQueryInstance
    :(FIRDatabaseReference *)reference
    modifiers:(NSArray *)modifiers {
  return [[RNFBDatabaseQuery alloc] initWithReferenceAndModifiers:reference modifiers:modifiers];
}

- (RNFBDatabaseQuery *)getDatabaseQueryInstance
    :(NSString *)key
    reference:(FIRDatabaseReference *)reference
    modifiers:(NSArray *)modifiers {
  RNFBDatabaseQuery *cachedQuery = queryDictionary[key];

  if (cachedQuery != nil) {
    return cachedQuery;
  }

  RNFBDatabaseQuery *query = [[RNFBDatabaseQuery alloc] initWithReferenceAndModifiers:reference modifiers:modifiers];

  queryDictionary[key] = query;
  return query;
}

- (void)addOnceEventListener
    :(RNFBDatabaseQuery *)databaseQuery
                   eventType:(NSString *)eventType
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
  FIRDataEventType firDataEventType = (FIRDataEventType) [RNFBDatabaseCommon getEventTypeFromName:eventType];

  [databaseQuery.query observeSingleEventOfType:firDataEventType andPreviousSiblingKeyWithBlock:^(FIRDataSnapshot *_Nonnull snapshot, NSString *_Nullable previousChildName) {
    NSDictionary *data;
    if ([eventType isEqualToString:@"value"]) {
      data = [RNFBDatabaseCommon snapshotToDictionary:snapshot];
    } else {
      NSLog(@"In else");
      data = [RNFBDatabaseCommon snapshotWithPreviousChildToDictionary:snapshot previousChildName:previousChildName];
    }
    resolve(data);
  }                             withCancelBlock:^(NSError *_Nonnull error) {
    [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
  }];
}

- (void)addEventListener:(RNFBDatabaseQuery *)databaseQuery
               eventType:(NSString *)eventType
            registration:(NSDictionary *)registration {
  NSString *eventRegistrationKey = registration[@"eventRegistrationKey"];

  if (![databaseQuery ])
}

#pragma mark -
#pragma mark Firebase Database

RCT_EXPORT_METHOD(once:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSString *) path
    : (NSArray *) modifiers
    : (NSString *) eventType
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:firDatabaseReference modifiers:modifiers];
  [self addOnceEventListener:databaseQuery eventType:eventType resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(on:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSDictionary *) props
) {
  NSString *key = [props valueForKey:@"key"];
  NSString *path = [props valueForKey:@"path"];
  NSString *eventType = [props valueForKey:@"eventType"];
  NSArray *modifiers = [props valueForKey:@"modifiers"];
  NSDictionary *registration = [props valueForKey:@"registration"];

  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:firDatabaseReference  modifiers:modifiers]
}

RCT_EXPORT_METHOD(keepSynced:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSString *) path
    : (NSArray *) modifiers
    : (BOOL) value
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];
  RNFBDatabaseQuery *databaseQuery = [self getDatabaseQueryInstance:firDatabaseReference modifiers:modifiers];
  [databaseQuery.query keepSynced:value];
}

@end
