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
#import <Firebase/Firebase.h>

#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseReferenceModule.h"


@implementation RNFBDatabaseReferenceModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_queue_create("io.invertase.firebase.database", DISPATCH_QUEUE_SERIAL);
}

#pragma mark -
#pragma mark Firebase Database

RCT_EXPORT_METHOD(set:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSString *) path
    : (NSDictionary *) props
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference setValue:[props valueForKey:@"value"] withCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
    if (error != nil) {
      [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
    } else {
      resolve([NSNull null]);
    }
  }];
}

RCT_EXPORT_METHOD(update:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSString *) path
    : (NSDictionary *) props
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference updateChildValues:[props valueForKey:@"values"] withCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
    if (error != nil) {
      [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
    } else {
      resolve([NSNull null]);
    }
  }];
}

RCT_EXPORT_METHOD(setWithPriority:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSString *) path
    : (NSDictionary *) props
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference setValue:[props valueForKey:@"value"] andPriority:[props valueForKey:@"priority"] withCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
    if (error != nil) {
      [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
    } else {
      resolve([NSNull null]);
    }
  }];
}

RCT_EXPORT_METHOD(remove:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSString *) path
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference removeValueWithCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
    if (error != nil) {
      [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
    } else {
      resolve([NSNull null]);
    }
  }];
}

RCT_EXPORT_METHOD(setPriority:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSString *) path
    : (NSDictionary *) props
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock)reject
) {
  FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
  FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

  [firDatabaseReference setPriority:[props valueForKey:@"priority"] withCompletionBlock:^(NSError *error, FIRDatabaseReference *ref) {
    if (error != nil) {
      [RNFBDatabaseCommon promiseRejectDatabaseException:reject error:error];
    } else {
      resolve([NSNull null]);
    }
  }];
}

@end
