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

#import "RNFBDatabaseCommon.h"
#import "RNFBPreferences.h"
#import "RNFBApp/RNFBSharedUtils.h"

static __strong NSMutableDictionary *references;
static __strong NSMutableDictionary *configSettingsLock;

NSString *const DATABASE_PERSISTENCE_ENABLED = @"firebase_database_persistence_enabled";
NSString *const DATABASE_LOGGING_ENABLED = @"firebase_database_logging_enabled";
NSString *const DATABASE_PERSISTENCE_CACHE_SIZE = @"firebase_database_persistence_cache_size_bytes";

@implementation RNFBDatabaseCommon

+ (void)load {
  references = [NSMutableDictionary dictionary];
  configSettingsLock = [NSMutableDictionary dictionary];
}

+ (dispatch_queue_t)getDispatchQueue {
  static dispatch_once_t once;
  __strong static dispatch_queue_t sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = dispatch_queue_create("io.invertase.firebase.database", DISPATCH_QUEUE_SERIAL);
  });
  return sharedInstance;
}

+ (FIRDatabase *)getDatabaseForApp:(FIRApp *)firebaseApp dbURL:(NSString *)dbURL {
  FIRDatabase *firDatabase;

  if (dbURL == nil && dbURL.length == 0) {
    firDatabase = [FIRDatabase databaseForApp:firebaseApp];
  } else {
    firDatabase = [FIRDatabase databaseForApp:firebaseApp URL:dbURL];
  }

  [RNFBDatabaseCommon setDatabaseConfig:firDatabase dbURL:dbURL];

  return firDatabase;
}

+ (void)setDatabaseConfig:(FIRDatabase *)firDatabase
                    dbURL:(NSString *)dbURL {
  NSMutableString *lockKey = [firDatabase.app.name mutableCopy];

  if (dbURL != nil && dbURL.length > 0) {
    [lockKey appendString:dbURL];
  }

  @synchronized (configSettingsLock) {
    if (configSettingsLock[lockKey]) {
      return;
    }
  }

  RNFBPreferences *preferences = [RNFBPreferences shared];
    
  @try {
    firDatabase.callbackQueue = [RNFBDatabaseCommon getDispatchQueue];
    // Persistence enabled
    BOOL *persistenceEnabled = (BOOL *) [preferences getBooleanValue:DATABASE_PERSISTENCE_ENABLED defaultValue:false];
    [firDatabase setPersistenceEnabled:(BOOL) persistenceEnabled];

    // Logging enabled
    BOOL *loggingEnabled = (BOOL *) [preferences getBooleanValue:DATABASE_LOGGING_ENABLED defaultValue:false];
    [FIRDatabase setLoggingEnabled:(BOOL) loggingEnabled];

    // Persistence cache size
    if ([preferences contains:DATABASE_PERSISTENCE_CACHE_SIZE]) {
      NSInteger *cacheSizeBytes = [preferences getIntegerValue:DATABASE_PERSISTENCE_CACHE_SIZE defaultValue:(NSInteger *) 10000000];
      [firDatabase setPersistenceCacheSizeBytes:(NSUInteger) cacheSizeBytes];
    }
      
    @synchronized (configSettingsLock) {
      configSettingsLock[lockKey] = @YES;
    }
      
  } @catch (NSException *exception) {
    if (![@"FIRDatabaseAlreadyInUse" isEqualToString:exception.name]) {
      @throw exception;
    } else {
      @synchronized (configSettingsLock) {
      configSettingsLock[lockKey] = @YES;
      }
    }
  }
}

+ (FIRDatabaseReference *)getReferenceForDatabase
    :(FIRDatabase *)firebaseDatabase
                                             path:(NSString *)path {
  @synchronized (configSettingsLock) {
    return [firebaseDatabase referenceWithPath:path];
  }
}

+ (FIRDatabaseReference *)getReferenceForDatabase
    :(NSString *)key
                                 firebaseDatabase:(FIRDatabase *)firebaseDatabase
                                             path:(NSString *)path {
  @synchronized (configSettingsLock) {
    FIRDatabaseReference *cachedReference = references[key];

    if (cachedReference != nil) {
      return cachedReference;
    }

    FIRDatabaseReference *databaseReference = [firebaseDatabase referenceWithPath:path];

    references[key] = databaseReference;
        
    return databaseReference;
  }
}

+ (void)removeReferenceByKey:(NSString *)key {
  [references removeObjectForKey:key];
}

+ (void)promiseRejectDatabaseException
    :(RCTPromiseRejectBlock)reject
                                 error:(NSError *)error {
  NSArray *codeAndMessage = [self getCodeAndMessage:error];
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:(NSMutableDictionary *) @{
    @"code": (NSString *) codeAndMessage[0],
    @"message": (NSString *) codeAndMessage[1],
  }];
}

+ (NSArray *)getCodeAndMessage:(NSError *)error {
  NSString *code = @"unknown";

  if (error == nil) {
    return @[code, @"An unknown error has occurred."];
  }

//  NSDictionary *userInfo = [error userInfo];
  NSString *message;
//  NSError *underlyingError = userInfo[NSUnderlyingErrorKey];
//  NSString *underlyingErrorDescription = [underlyingError localizedDescription];

  switch (error.code) {
    case 1:
      code = @"permission-denied";
      message = @"Client doesn't have permission to access the desired data.";
      break;
    case 2:
      code = @"unavailable";
      message = @"The service is unavailable.";
      break;
    case 3:
      code = @"write-cancelled";
      message = @"The write was cancelled by the user.";
      break;

    case -1:
      code = @"data-stale";
      message = @"The transaction needs to be run again with current data.";
      break;
    case -2:
      code = @"failure";
      message = @"The server indicated that this operation failed.";
      break;
    case -4:
      code = @"disconnected";
      message = @"The operation had to be aborted due to a network disconnect.";
      break;
    case -6:
      code = @"expired-token";
      message = @"The supplied auth token has expired.";
      break;
    case -7:
      code = @"invalid-token";
      message = @"The supplied auth token was invalid.";
      break;
    case -8:
      code = @"max-retries";
      message = @"The transaction had too many retries.";
      break;
    case -9:
      code = @"overridden-by-set";
      message = @"The transaction was overridden by a subsequent set";
      break;
    case -11:
      code = @"user-code-exception";
      message = @"User code called from the Firebase Database runloop threw an exception.";
      break;
    case -24:
      code = @"network-error";
      message = @"The operation could not be performed due to a network error.";
      break;
    default:
      code = @"unknown";
      message = [error localizedDescription];
  }

  return @[code, message];
}

+ (int)getEventTypeFromName
    :(NSString *)name {
  int eventType = FIRDataEventTypeValue;

  if ([name isEqualToString:@"value"]) {
    eventType = FIRDataEventTypeValue;
  } else if ([name isEqualToString:@"child_added"]) {
    eventType = FIRDataEventTypeChildAdded;
  } else if ([name isEqualToString:@"child_changed"]) {
    eventType = FIRDataEventTypeChildChanged;
  } else if ([name isEqualToString:@"child_removed"]) {
    eventType = FIRDataEventTypeChildRemoved;
  } else if ([name isEqualToString:@"child_moved"]) {
    eventType = FIRDataEventTypeChildMoved;
  }

  return eventType;
}

+ (NSDictionary *)snapshotWithPreviousChildToDictionary
    :(FIRDataSnapshot *)dataSnapshot
                                      previousChildName:(NSString *)previousChildName {
  NSMutableDictionary *result = [[NSMutableDictionary alloc] init];
  NSDictionary *snapshot = [self snapshotToDictionary:dataSnapshot];

  [result setValue:snapshot forKey:@"snapshot"];
  [result setValue:previousChildName forKey:@"previousChildName"];

  return result;
}

+ (NSDictionary *)snapshotToDictionary
    :(FIRDataSnapshot *)dataSnapshot {
  NSMutableDictionary *snapshot = [[NSMutableDictionary alloc] init];

  if (dataSnapshot.key != nil) {
    [snapshot setValue:dataSnapshot.key forKey:@"key"];
  } else {
    [snapshot setValue:[NSNull null] forKey:@"key"];
  }
  [snapshot setValue:@(dataSnapshot.exists) forKey:@"exists"];
  [snapshot setValue:@(dataSnapshot.hasChildren) forKey:@"hasChildren"];
  [snapshot setValue:@(dataSnapshot.childrenCount) forKey:@"childrenCount"];
  [snapshot setValue:[self getSnapshotChildKeys:dataSnapshot] forKey:@"childKeys"];
  [snapshot setValue:dataSnapshot.priority forKey:@"priority"];
  [snapshot setValue:dataSnapshot.value forKey:@"value"];

  return snapshot;
}

+ (NSMutableArray *)getSnapshotChildKeys:(FIRDataSnapshot *)dataSnapshot {
  NSMutableArray *childKeys = [NSMutableArray array];
  if (dataSnapshot.childrenCount > 0) {
    NSEnumerator *children = [dataSnapshot children];
    FIRDataSnapshot *child;
    child = [children nextObject];
    while (child) {
      [childKeys addObject:child.key];
      child = [children nextObject];
    }
  }
  return childKeys;
}

@end
