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
#import "RNFBApp/RNFBSharedUtils.h"

@implementation RNFBDatabaseCommon

+ (FIRDatabase *)getDatabaseForApp
    :(FIRApp *)firebaseApp
                             dbURL:(NSString *)dbURL {
  if (dbURL == nil && dbURL.length == 0) {
    return [FIRDatabase databaseForApp:firebaseApp];
  }
  return [FIRDatabase databaseForApp:firebaseApp URL:dbURL];
}

+ (FIRDatabaseReference *)getReferenceForDatabase
    :(FIRDatabase *)firebaseDatabase
                                             path:(NSString *)path {
  NSLog(path);
  return [firebaseDatabase referenceWithPath:path];
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

  [snapshot setValue:dataSnapshot.key forKey:@"key"];
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
    while (child = [children nextObject]) {
      [childKeys addObject:child.key];
    }
  }
  return childKeys;
}

@end
