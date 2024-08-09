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

#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <React/RCTUtils.h>

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

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (dispatch_queue_t)methodQueue {
  return [RNFBFirestoreCommon getFirestoreQueue];
}

- (void)dealloc {
  [self invalidate];
}

- (void)invalidate {
  for (NSString *key in [transactions allKeys]) {
    [transactions removeObjectForKey:key];
  }
}

#pragma mark -
#pragma mark Firebase Firestore Methods

RCT_EXPORT_METHOD(transactionGetDocument
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSNumber *)transactionId
                  : (NSString *)path
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  @synchronized(transactions[[transactionId stringValue]]) {
    NSMutableDictionary *transactionState = transactions[[transactionId stringValue]];

    if (!transactionState) {
      DLog(@"transactionGetDocument called for non-existent transactionId %@", transactionId);
      return;
    }

    NSError *error = nil;
    FIRTransaction *transaction = [transactionState valueForKey:@"transaction"];
    FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                           databaseId:databaseId];
    FIRDocumentReference *ref = [RNFBFirestoreCommon getDocumentForFirestore:firestore path:path];
    FIRDocumentSnapshot *snapshot = [transaction getDocument:ref error:&error];

    if (error != nil) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      NSString *appName = [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name];
      NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:appName
                                                                       databaseId:databaseId];
      NSDictionary *snapshotDict =
          [RNFBFirestoreSerialize documentSnapshotToDictionary:snapshot firestoreKey:firestoreKey];
      NSString *snapshotPath = snapshotDict[@"path"];

      if (snapshotPath == nil) {
        [snapshotDict setValue:ref.path forKey:@"path"];
      }

      resolve(snapshotDict);
    }
  }
}

RCT_EXPORT_METHOD(transactionDispose
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSNumber *)transactionId) {
  @synchronized(transactions[[transactionId stringValue]]) {
    NSMutableDictionary *transactionState = transactions[[transactionId stringValue]];

    if (!transactionState) {
      return;
    }

    dispatch_semaphore_t semaphore = transactionState[@"semaphore"];
    transactionState[@"aborted"] = @(true);
    dispatch_semaphore_signal(semaphore);
  }
}

RCT_EXPORT_METHOD(transactionApplyBuffer
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSNumber *)transactionId
                  : (NSArray *)commandBuffer) {
  @synchronized(transactions[[transactionId stringValue]]) {
    NSMutableDictionary *transactionState = transactions[[transactionId stringValue]];

    if (!transactionState) {
      DLog(@"transactionGetDocument called for non-existent transactionId %@", transactionId);
      return;
    }

    dispatch_semaphore_t semaphore = [transactionState valueForKey:@"semaphore"];
    [transactionState setValue:commandBuffer forKey:@"commandBuffer"];
    dispatch_semaphore_signal(semaphore);
  }
}

RCT_EXPORT_METHOD(transactionBegin
                  : (FIRApp *)firebaseApp
                  : (NSString *)databaseId
                  : (nonnull NSNumber *)transactionId) {
  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  __block BOOL aborted = false;
  __block NSMutableDictionary *transactionState = [NSMutableDictionary new];

  id transactionBlock = ^id(FIRTransaction *transaction, NSError **errorPointer) {
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

    @synchronized(transactionState) {
      transactionState[@"semaphore"] = semaphore;
      transactionState[@"transaction"] = transaction;

      if (!transactions[[transactionId stringValue]]) {
        transactions[[transactionId stringValue]] = transactionState;
      }

      // build and send transaction update event
      dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSMutableDictionary *eventMap = [NSMutableDictionary new];
        eventMap[@"type"] = @"update";
        [[RNFBRCTEventEmitter shared]
            sendEventWithName:RNFB_FIRESTORE_TRANSACTION_EVENT
                         body:@{
                           @"listenerId" : transactionId,
                           @"appName" : [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name],
                           @"databaseId" : databaseId,
                           @"body" : eventMap,
                         }];
      });
    }

    // wait for the js event handler to call transactionApplyBuffer
    // this wait occurs on the RNFirestore Worker Queue so if transactionApplyBuffer fails to
    // signal the semaphore then no further blocks will be executed by RNFirestore until the timeout
    // expires
    dispatch_time_t delayTime = dispatch_time(DISPATCH_TIME_NOW, 15 * NSEC_PER_SEC);
    BOOL timedOut = dispatch_semaphore_wait(semaphore, delayTime) != 0;

    @synchronized(transactionState) {
      aborted = (BOOL)transactionState[@"aborted"];

      if (transactionState[@"semaphore"] != semaphore) {
        return nil;
      }

      if (aborted == YES) {
        *errorPointer = [NSError errorWithDomain:FIRFirestoreErrorDomain
                                            code:FIRFirestoreErrorCodeAborted
                                        userInfo:@{}];
        return nil;
      }

      if (timedOut == YES) {
        *errorPointer = [NSError errorWithDomain:FIRFirestoreErrorDomain
                                            code:FIRFirestoreErrorCodeDeadlineExceeded
                                        userInfo:@{}];
        return nil;
      }

      NSArray *commandBuffer = transactionState[@"commandBuffer"];

      for (NSDictionary *command in commandBuffer) {
        NSString *type = command[@"type"];
        NSString *path = command[@"path"];
        FIRDocumentReference *documentReference =
            [RNFBFirestoreCommon getDocumentForFirestore:firestore path:path];

        if ([type isEqualToString:@"DELETE"]) {
          [transaction deleteDocument:documentReference];
        } else if ([type isEqualToString:@"SET"]) {
          NSDictionary *options = command[@"options"];
          NSDictionary *parsedData = [RNFBFirestoreSerialize parseNSDictionary:firestore
                                                                    dictionary:command[@"data"]];

          if (options[@"merge"]) {
            [transaction setData:parsedData forDocument:documentReference merge:true];
          } else if (options[@"mergeFields"]) {
            NSArray *mergeFields = options[@"mergeFields"];
            [transaction setData:parsedData forDocument:documentReference mergeFields:mergeFields];
          } else {
            [transaction setData:parsedData forDocument:documentReference];
          }
        } else if ([type isEqualToString:@"UPDATE"]) {
          NSDictionary *parsedData = [RNFBFirestoreSerialize parseNSDictionary:firestore
                                                                    dictionary:command[@"data"]];
          [transaction updateData:parsedData forDocument:documentReference];
        }
      }

      return nil;
    }
  };

  id completionBlock = ^(id result, NSError *error) {
    @synchronized(transactionState) {
      if (aborted == NO) {
        NSMutableDictionary *eventMap = [NSMutableDictionary new];

        if (error != nil) {
          NSArray *codeAndMessage = [RNFBFirestoreCommon getCodeAndMessage:error];
          eventMap[@"type"] = @"error";
          eventMap[@"error"] = @{
            @"code" : codeAndMessage[0],
            @"message" : codeAndMessage[1],
          };
        } else {
          eventMap[@"type"] = @"complete";
        }

        [[RNFBRCTEventEmitter shared]
            sendEventWithName:RNFB_FIRESTORE_TRANSACTION_EVENT
                         body:@{
                           @"listenerId" : transactionId,
                           @"appName" : [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name],
                           @"databaseId" : databaseId,
                           @"body" : eventMap,
                         }];
      }

      [transactions removeObjectForKey:[transactionId stringValue]];
    }
  };

  [firestore runTransactionWithBlock:transactionBlock completion:completionBlock];
}

@end
