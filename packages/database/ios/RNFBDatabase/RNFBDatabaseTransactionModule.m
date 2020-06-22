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

#import "RNFBRCTEventEmitter.h"
#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseTransactionModule.h"
#import "RNFBSharedUtils.h"

static __strong NSMutableDictionary *transactions;
static NSString *const RNFB_DATABASE_TRANSACTION_EVENT = @"database_transaction_event";

@implementation RNFBDatabaseTransactionModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseCommon getDispatchQueue];
}

- (id)init {
  if (self = [super init]) {
    transactions = [[NSMutableDictionary alloc] init];
#pragma clang diagnostic push
#pragma ide diagnostic ignored "BridgeCastIssues"
    _transactionQueue = dispatch_queue_create("io.invertase.react-native-firebase.database.transactions", DISPATCH_QUEUE_CONCURRENT);
#pragma clang diagnostic pop
  }
  return self;
}

#pragma mark -
#pragma mark Firebase Database

RCT_EXPORT_METHOD(transactionStart:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (NSString *) path
    : (nonnull NSNumber *) transactionId
    : (BOOL) applyLocally
) {
  dispatch_async(_transactionQueue, ^{
    NSMutableDictionary *transactionState = [NSMutableDictionary new];
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
#pragma clang diagnostic push
#pragma ide diagnostic ignored "err_typecheck_convert_incompatible"
    transactionState[@"semaphore"] = sema;
#pragma clang diagnostic pop
    FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
    FIRDatabaseReference *firDatabaseReference = [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

    id runTransactionBlock = ^FIRTransactionResult *(FIRMutableData *currentData) {
      dispatch_barrier_async(_transactionQueue, ^{
        [transactions setValue:transactionState forKey:[transactionId stringValue]];

        [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_DATABASE_TRANSACTION_EVENT body:@{
            @"appName": [RNFBSharedUtils getAppJavaScriptName:firDatabase.app.name],
            @"id": transactionId,
            @"body": @{
                @"type": @"update",
                @"value": currentData.value,
            }
        }];
      });

      // wait for the js event handler to call tryCommitTransaction
      // this wait occurs on the Firebase Worker Queue
      // so if the tryCommitTransaction fails to signal the semaphore
      // no further blocks will be executed by Firebase until the timeout expires
      dispatch_time_t delayTime = dispatch_time(DISPATCH_TIME_NOW, 30 * NSEC_PER_SEC);
      BOOL timedout = dispatch_semaphore_wait(sema, delayTime) != 0;

      BOOL abort = [transactionState valueForKey:@"abort"] || timedout;
      id value = [transactionState valueForKey:@"value"];

      dispatch_barrier_async(_transactionQueue, ^{
        [transactions removeObjectForKey:[transactionId stringValue]];
      });

      if (abort) {
        return [FIRTransactionResult abort];
      }

      currentData.value = value;
      return [FIRTransactionResult successWithValue:currentData];
    };

    id andCompletionBlock = ^(NSError *error, BOOL committed, FIRDataSnapshot *dataSnapshot) {
      NSMutableDictionary *resultMap = [NSMutableDictionary dictionary];
      resultMap[@"committed"] = @(committed);

      if (error != nil) {
        NSArray *codeAndMessage = [RNFBDatabaseCommon getCodeAndMessage:error];
        resultMap[@"type"] = @"error";
        resultMap[@"error"] = @{
            @"code": codeAndMessage[0],
            @"message": codeAndMessage[1],
        };
      } else {
        resultMap[@"type"] = @"complete";
        resultMap[@"snapshot"] = [RNFBDatabaseCommon snapshotToDictionary:dataSnapshot];
      }

      [[RNFBRCTEventEmitter shared] sendEventWithName:RNFB_DATABASE_TRANSACTION_EVENT body:@{
          @"id": transactionId,
          @"appName": [RNFBSharedUtils getAppJavaScriptName:firDatabase.app.name],
          @"body": resultMap,
      }];
    };

    [firDatabaseReference runTransactionBlock:runTransactionBlock andCompletionBlock:andCompletionBlock withLocalEvents:applyLocally];
  });
}

RCT_EXPORT_METHOD(transactionTryCommit:
  (FIRApp *) firebaseApp
    : (NSString *) dbURL
    : (nonnull NSNumber *) transactionId
    : (NSDictionary *) updates
) {
  __block NSMutableDictionary *transactionState;

  dispatch_sync(_transactionQueue, ^{
    transactionState = transactions[[transactionId stringValue]];
  });

  if (!transactionState) {
    NSLog(@"tryCommitTransaction for unknown ID %@", transactionId);
    return;
  }


  BOOL abort = [[updates valueForKey:@"abort"] boolValue];

  if (abort) {
    [transactionState setValue:@true forKey:@"abort"];
  } else {
    id newValue = [updates valueForKey:@"value"];
    [transactionState setValue:newValue forKey:@"value"];
  }

  dispatch_semaphore_signal([transactionState valueForKey:@"semaphore"]);
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

@end
