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

#import "RNFBRCTEventEmitter.h"
#import "RNFBFirestoreTransactionModule.h"

static __strong NSMutableDictionary *transactions;
static NSString *const RNFB_FIRESTORE_TRANSACTION_EVENT = @"firestore_transaction_event";


@implementation RNFBFirestoreTransactionModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (id)init {
  self = [super init];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    transactions = [[NSMutableDictionary alloc] init];
  });
  return self;
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  for (NSNumber *id in transactions) {
    NSMutableDictionary *transactionState = transactions[id];
    // TODO How to remove
    [transactionState removeObjectForKey:id];
  }
}

#pragma mark -
#pragma mark Firebase Firestore Methods

RCT_EXPORT_METHOD(transactionGetDocument:
  (FIRApp *) firebaseApp
    :(nonnull NSNumber *)transactionId
    :(NSString *)path
    :(RCTPromiseResolveBlock)resolve
    :(RCTPromiseRejectBlock)reject
) {

}

RCT_EXPORT_METHOD(transactionDispose:
  (FIRApp *) firebaseApp
    :(nonnull NSNumber *)transactionId
) {
  @synchronized (transactions[[transactionId stringValue]]) {
    __block NSMutableDictionary *transactionState = transactions[transactionId];

    if (!transactionState) {
      return;
    }

    dispatch_semaphore_t semaphore = transactionState[@"semaphore"];
    transactionState[@"abort"] = @(true);
    dispatch_semaphore_signal(semaphore);
  }
}

RCT_EXPORT_METHOD(transactionApplyBuffer:
  (FIRApp *) firebaseApp
    :(nonnull NSNumber *)transactionId
    :(NSArray *)commandBuffer
) {

}

RCT_EXPORT_METHOD(transactionBegin:
  (FIRApp *) firebaseApp
    :(nonnull NSNumber *)transactionId
) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp];
  __block BOOL aborted = false;
  __block BOOL completed = false;
  __block NSMutableDictionary *transactionState = [NSMutableDictionary new];

  id transactionBlock = ^id(FIRTransaction *transaction, NSError **pError) {
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

    @synchronized (transactionState) {
      transactionState[@"semaphore"] = semaphore;
      transactionState[@"transaction"] = transaction;

      if (!transactions[transactionId]) {
        transactions[transactionId] = transactionState;
      }

      // todo dispatch
    }

    // wait for the js event handler to call transactionApplyBuffer
    // this wait occurs on the RNFirestore Worker Queue so if transactionApplyBuffer fails to
    // signal the semaphore then no further blocks will be executed by RNFirestore until the timeout expires
    dispatch_time_t delayTime = dispatch_time(DISPATCH_TIME_NOW, 5000 * NSEC_PER_SEC);
    BOOL timedOut = dispatch_semaphore_wait(semaphore, delayTime) != 0;

    @synchronized (transactionState) {
      aborted = (BOOL) transactionState[@"aborted"];

      if (transactionState[@"semaphore"] != semaphore) {
        return nil;
      }

      if (aborted == YES) {
        // TODO error pointer
        return nil;
      }

      if (timedOut == YES) {
        return nil;
      }

      NSArray *commandBuffer = transactionState[@"commandBuffer"];

      for (NSDictionary *command in commandBuffer) {
        NSString *type = command[@"type"];
        NSString *path = command[@"path"];
        FIRDocumentReference *documentReference = [RNFBFirestoreCommon getDocumentForFirestore:firestore path:path];

        if ([type isEqualToString:@"DELETE"]) {
          [transaction deleteDocument:documentReference];
        } else if ([type isEqualToString:@"SET"]) {
          NSDictionary *options = command[@"options"];
          NSDictionary *parsedData = [RNFBFirestoreSerialize parseNSDictionary:firestore dictionary:command[@"data"]];

          if (options[@"merge"]) {
            [transaction setData:parsedData forDocument:documentReference merge:true];
          } else if (options[@"mergeFields"]) {
            NSArray *mergeFields = options[@"mergeFields"];
            [transaction setData:parsedData forDocument:documentReference mergeFields:mergeFields];
          } else {
            [transaction setData:parsedData forDocument:documentReference];
          }
        } else if ([type isEqualToString:@"UPDATE"]) {
          NSDictionary *parsedData = [RNFBFirestoreSerialize parseNSDictionary:firestore dictionary:command[@"data"]];
          [transaction updateData:parsedData forDocument:documentReference];
        }
      }

      return nil;
    }
  };

  id completionBlock = ^(id result, NSError *error) {
    if (completed == YES) {
      return;
    }

    completed = YES;

    @synchronized (transactionState) {
      if (aborted == NO) {
        // TODO send event
      }

      [transactions removeObjectForKey:transactionId];
    }
  };

  [firestore runTransactionWithBlock:transactionBlock completion:completionBlock];
}

@end