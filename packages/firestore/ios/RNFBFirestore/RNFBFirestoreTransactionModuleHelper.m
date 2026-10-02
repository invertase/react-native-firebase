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
#elif __has_include(<FirebaseFirestore/FirebaseFirestore.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseFirestore/FirebaseFirestore.h>
#else
@import FirebaseCore;
@import FirebaseFirestore;
#endif

#import <RNFBApp/RNFBRCTEventEmitter.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTUtils.h>
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBFirestoreCommon.h"
#import "RNFBFirestoreSerialize.h"
#import "RNFBFirestoreTransactionAttempt.h"
#import "RNFBFirestoreTransactionModuleHelper.h"
#import "RNFBFirestoreTransactionRegistry.h"

static RNFBFirestoreTransactionRegistry *transactions;
static NSString *const RNFB_FIRESTORE_TRANSACTION_EVENT = @"firestore_transaction_event";

@implementation RNFBFirestoreTransactionModuleHelper

+ (void)ensureRegistry {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    transactions = [[RNFBFirestoreTransactionRegistry alloc] init];
  });
}

+ (void)invalidate {
  [self ensureRegistry];
  [transactions abortAll];
}

#pragma mark Firebase Firestore Methods

+ (void)transactionBegin:(NSString *)appName
              databaseId:(NSString *)databaseId
           transactionId:(double)transactionId
             maxAttempts:(double)maxAttempts {
  [self ensureRegistry];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *transactionIdNumber = @(transactionId);

  FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                         databaseId:databaseId];
  RNFBFirestoreTransactionAttempt *attempt = [[RNFBFirestoreTransactionAttempt alloc] init];

  id transactionBlock = ^id(FIRTransaction *transaction, NSError **errorPointer) {
    [attempt prepareForUpdateBlockWithNativeTransaction:transaction];

    if (![transactions putOrSkip:transactionIdNumber value:attempt]) {
      *errorPointer = [NSError errorWithDomain:FIRFirestoreErrorDomain
                                          code:FIRFirestoreErrorCodeAborted
                                      userInfo:@{}];
      return nil;
    }

    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      NSMutableDictionary *eventMap = [NSMutableDictionary new];
      eventMap[@"type"] = @"update";
      [[RNFBRCTEventEmitter shared]
          sendEventWithName:RNFB_FIRESTORE_TRANSACTION_EVENT
                       body:@{
                         @"listenerId" : transactionIdNumber,
                         @"appName" : [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name],
                         @"databaseId" : databaseId,
                         @"body" : eventMap,
                       }];
    });

    RNFBFirestoreTransactionWaitResult waitResult =
        [attempt waitUntilSignaledWithTimeout:[RNFBFirestoreTransactionAttempt defaultWaitTimeout]];

    if (waitResult == RNFBFirestoreTransactionWaitResultStale) {
      return nil;
    }

    if (waitResult == RNFBFirestoreTransactionWaitResultAborted) {
      *errorPointer = [NSError errorWithDomain:FIRFirestoreErrorDomain
                                          code:FIRFirestoreErrorCodeAborted
                                      userInfo:@{}];
      return nil;
    }

    if (waitResult == RNFBFirestoreTransactionWaitResultTimeout) {
      *errorPointer = [attempt timeoutError];
      return nil;
    }

    NSArray *commandBuffer = attempt.commandBuffer;

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
  };

  id completionBlock = ^(id result, NSError *error) {
    [transactions take:transactionIdNumber];
    if (attempt.aborted) {
      return;
    }

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
                       @"listenerId" : transactionIdNumber,
                       @"appName" : [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name],
                       @"databaseId" : databaseId,
                       @"body" : eventMap,
                     }];
  };

  if (maxAttempts > 0) {
    FIRTransactionOptions *options = [[FIRTransactionOptions alloc] init];
    options.maxAttempts = (NSInteger)maxAttempts;
    [firestore runTransactionWithOptions:options block:transactionBlock completion:completionBlock];
  } else {
    [firestore runTransactionWithBlock:transactionBlock completion:completionBlock];
  }
}

+ (void)rejectMissingTransaction:(RCTPromiseRejectBlock)reject {
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                    userInfo:(NSMutableDictionary *)@{
                                      @"code" : RNFBFirestoreTransactionRejectCodeInternalError,
                                      @"message" : RNFBFirestoreTransactionMissingIdMessage,
                                    }];
}

+ (void)transactionGetDocument:(NSString *)appName
                    databaseId:(NSString *)databaseId
                 transactionId:(double)transactionId
                          path:(NSString *)path
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  [self ensureRegistry];
  FIRApp *firebaseApp = [RCTConvert firAppFromString:appName];
  NSNumber *transactionIdNumber = @(transactionId);
  RNFBFirestoreTransactionAttempt *attempt = [transactions get:transactionIdNumber];

  if (attempt == nil) {
    [RNFBFirestoreTransactionModuleHelper rejectMissingTransaction:reject];
    return;
  }

  NSDictionary *ineligible = [attempt rejectUserInfoIfIneligibleForGet];
  if (ineligible != nil) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[ineligible mutableCopy]];
    return;
  }

  @synchronized(attempt) {
    ineligible = [attempt rejectUserInfoIfIneligibleForGet];
    if (ineligible != nil) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[ineligible mutableCopy]];
      return;
    }

    NSError *error = nil;
    FIRTransaction *transaction = (FIRTransaction *)attempt.nativeTransaction;
    FIRFirestore *firestore = [RNFBFirestoreCommon getFirestoreForApp:firebaseApp
                                                           databaseId:databaseId];
    FIRDocumentReference *ref = [RNFBFirestoreCommon getDocumentForFirestore:firestore path:path];
    FIRDocumentSnapshot *snapshot = [transaction getDocument:ref error:&error];

    if (error != nil) {
      [RNFBFirestoreCommon promiseRejectFirestoreException:reject error:error];
    } else {
      NSString *resolvedAppName = [RNFBSharedUtils getAppJavaScriptName:firebaseApp.name];
      NSString *firestoreKey = [RNFBFirestoreCommon createFirestoreKeyWithAppName:resolvedAppName
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

+ (void)transactionDispose:(NSString *)appName
                databaseId:(NSString *)databaseId
             transactionId:(double)transactionId {
  [self ensureRegistry];
  NSNumber *transactionIdNumber = @(transactionId);
  RNFBFirestoreTransactionAttempt *attempt = [transactions get:transactionIdNumber];
  [attempt abort];
}

+ (void)transactionApplyBuffer:(NSString *)appName
                    databaseId:(NSString *)databaseId
                 transactionId:(double)transactionId
                 commandBuffer:(NSArray *)commandBuffer {
  [self ensureRegistry];
  NSNumber *transactionIdNumber = @(transactionId);
  RNFBFirestoreTransactionAttempt *attempt = [transactions get:transactionIdNumber];
  [attempt applyCommandBuffer:commandBuffer];
}

@end
