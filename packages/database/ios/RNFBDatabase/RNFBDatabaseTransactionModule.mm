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

#import <Firebase/Firebase.h>
#import <React/RCTUtils.h>

#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBDatabaseCommon.h"
#import "RNFBDatabaseTransactionModule.h"
#import "RNFBDatabaseTurboModules.h"
#import "RNFBRCTEventEmitter.h"
#import "RNFBSharedUtils.h"

static __strong NSMutableDictionary *transactions;
static NSString *const RNFB_DATABASE_TRANSACTION_EVENT = @"database_transaction_event";

@interface RNFBDatabaseTransactionModule () <NativeRNFBTurboDatabaseTransactionSpec,
                                             RCTBridgeModule>
@end

@implementation RNFBDatabaseTransactionModule
#pragma mark -
#pragma mark Module Setup

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboDatabaseTransactionSpecJSI>(params);
}

RCT_EXPORT_MODULE(NativeRNFBTurboDatabaseTransaction);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return [RNFBDatabaseCommon getDispatchQueue];
}

- (id)init {
  if (self = [super init]) {
    transactions = [[NSMutableDictionary alloc] init];
#pragma clang diagnostic push
#pragma ide diagnostic ignored "BridgeCastIssues"
    _transactionQueue = dispatch_queue_create(
        "io.invertase.react-native-firebase.database.transactions", DISPATCH_QUEUE_CONCURRENT);
#pragma clang diagnostic pop
  }
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  dispatch_sync(_transactionQueue, ^{
    for (NSString *key in [transactions allKeys]) {
      NSMutableDictionary *transactionState = transactions[key];
      [transactionState setValue:@true forKey:@"abort"];
      dispatch_semaphore_t sema = [transactionState valueForKey:@"semaphore"];
      if (sema) {
        dispatch_semaphore_signal(sema);
      }
      [transactions removeObjectForKey:key];
    }
  });
}

#pragma mark -
#pragma mark Firebase Database

- (void)transactionStart:(NSString *)app
                   dbURL:(NSString *)dbURL
                    path:(NSString *)path
           transactionId:(double)transactionId
            applyLocally:(BOOL)applyLocally {
  dispatch_async(_transactionQueue, ^{
    NSMutableDictionary *transactionState = [NSMutableDictionary new];
    dispatch_semaphore_t sema = dispatch_semaphore_create(0);
#pragma clang diagnostic push
#pragma ide diagnostic ignored "err_typecheck_convert_incompatible"
    transactionState[@"semaphore"] = sema;
#pragma clang diagnostic pop
    FIRApp *firebaseApp = [RCTConvert firAppFromString:app];
    FIRDatabase *firDatabase = [RNFBDatabaseCommon getDatabaseForApp:firebaseApp dbURL:dbURL];
    FIRDatabaseReference *firDatabaseReference =
        [RNFBDatabaseCommon getReferenceForDatabase:firDatabase path:path];

    id runTransactionBlock = ^FIRTransactionResult *(FIRMutableData *currentData) {
      dispatch_barrier_async(self->_transactionQueue, ^{
        [transactions setValue:transactionState forKey:[@(transactionId) stringValue]];

        [[RNFBRCTEventEmitter shared]
            sendEventWithName:RNFB_DATABASE_TRANSACTION_EVENT
                         body:@{
                           @"appName" : [RNFBSharedUtils getAppJavaScriptName:firDatabase.app.name],
                           @"id" : @(transactionId),
                           @"body" : @{
                             @"type" : @"update",
                             @"value" : currentData.value,
                           }
                         }];
      });

      dispatch_time_t delayTime = dispatch_time(DISPATCH_TIME_NOW, 30 * NSEC_PER_SEC);
      BOOL timedout = dispatch_semaphore_wait(sema, delayTime) != 0;

      BOOL abort = [transactionState valueForKey:@"abort"] || timedout;
      id value = [transactionState valueForKey:@"value"];

      dispatch_barrier_async(self->_transactionQueue, ^{
        [transactions removeObjectForKey:[@(transactionId) stringValue]];
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
          @"code" : codeAndMessage[0],
          @"message" : codeAndMessage[1],
        };
      } else {
        resultMap[@"type"] = @"complete";
        resultMap[@"snapshot"] = [RNFBDatabaseCommon snapshotToDictionary:dataSnapshot];
      }

      [[RNFBRCTEventEmitter shared]
          sendEventWithName:RNFB_DATABASE_TRANSACTION_EVENT
                       body:@{
                         @"id" : @(transactionId),
                         @"appName" : [RNFBSharedUtils getAppJavaScriptName:firDatabase.app.name],
                         @"body" : resultMap,
                       }];
    };

    [firDatabaseReference runTransactionBlock:runTransactionBlock
                           andCompletionBlock:andCompletionBlock
                              withLocalEvents:applyLocally];
  });
}

- (void)transactionTryCommit:(NSString *)app
                       dbURL:(NSString *)dbURL
               transactionId:(double)transactionId
                     updates:(NSDictionary *)updates {
  __block NSMutableDictionary *transactionState;

  dispatch_sync(_transactionQueue, ^{
    transactionState = transactions[[@(transactionId) stringValue]];
  });

  if (!transactionState) {
    NSLog(@"tryCommitTransaction for unknown ID %@", @(transactionId));
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

@end
