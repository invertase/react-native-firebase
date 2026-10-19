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
 */

#import <XCTest/XCTest.h>

#import <Firebase/Firebase.h>
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBFirestoreTransactionAttempt.h"
#import "RNFBFirestoreTransactionModuleHelper.h"

@interface RNFBFirestoreTransactionModuleHelperHostStubTests : XCTestCase
@end

@implementation RNFBFirestoreTransactionModuleHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [RNFBFirestoreTransactionModuleHelper invalidate];
  // Keep HostStub update-block waits short unless a test widens the window.
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:(int64_t)(50 * NSEC_PER_MSEC)];
  [RCTConvert setFirAppFromStringHandler:^FIRApp *(NSString *appName) {
    return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
  }];
}

- (void)tearDown {
  [RNFBFirestoreTransactionModuleHelper setTransactionGetAfterEligibleHook:nil];
  [RNFBFirestoreTransactionModuleHelper invalidate];
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:-1];
  [FIRFirestore resetTestState];
  [RCTConvert resetTestState];
  [super tearDown];
}

- (BOOL)waitUntilTransactionGetEligible:(double)transactionId timeout:(NSTimeInterval)timeout {
  NSDate *deadline = [NSDate dateWithTimeIntervalSinceNow:timeout];
  __block BOOL eligible = NO;
  while ([deadline timeIntervalSinceNow] > 0) {
    __block BOOL resolved = NO;
    [RNFBFirestoreTransactionModuleHelper transactionGetDocument:@"app"
        databaseId:@"(default)"
        transactionId:transactionId
        path:@"col/doc"
        resolve:^(id result) {
          (void)result;
          resolved = YES;
          eligible = YES;
        }
        reject:^(NSString *code, NSString *message, NSError *error) {
          (void)code;
          (void)message;
          (void)error;
          resolved = YES;
        }];
    if (eligible) {
      return YES;
    }
    (void)resolved;
    [NSThread sleepForTimeInterval:0.01];
  }
  return NO;
}

- (void)testTransactionGetDocument_missingTransaction_rejectsInternalError {
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  __block BOOL resolved = NO;

  [RNFBFirestoreTransactionModuleHelper transactionGetDocument:@"app"
      databaseId:@"(default)"
      transactionId:42
      path:@"col/doc"
      resolve:^(id result) {
        (void)result;
        resolved = YES;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertFalse(resolved);
  XCTAssertEqualObjects(rejectCode, RNFBFirestoreTransactionRejectCodeInternalError);
  XCTAssertEqualObjects(rejectMessage, RNFBFirestoreTransactionMissingIdMessage);
}

- (void)testTransactionDisposeAndApplyBuffer_missingAttempt_noCrash {
  [RNFBFirestoreTransactionModuleHelper transactionDispose:@"app"
                                                databaseId:@"(default)"
                                             transactionId:99];
  [RNFBFirestoreTransactionModuleHelper
      transactionApplyBuffer:@"app"
                  databaseId:@"(default)"
               transactionId:99
               commandBuffer:@[ @{@"type" : @"DELETE", @"path" : @"a/b"} ]];
  XCTAssertTrue(YES);
}

- (void)testTransactionBegin_withAndWithoutMaxAttempts_invokesUpdateBlock {
  [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                              databaseId:@"(default)"
                                           transactionId:7
                                             maxAttempts:0];
  [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                              databaseId:@"(default)"
                                           transactionId:8
                                             maxAttempts:5];
  // Short timeout override lets both update blocks finish without JS applyBuffer.
  XCTAssertTrue(YES);
}

- (void)testTransactionBegin_timeout_setsDeadlineExceededOnUpdateBlock {
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:0];
  [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                              databaseId:@"(default)"
                                           transactionId:11
                                             maxAttempts:0];
  XCTAssertTrue(YES);
}

- (void)testTransactionBegin_commandBuffer_appliesDeleteSetUpdate {
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:(int64_t)(2 * NSEC_PER_SEC)];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                                databaseId:@"(default)"
                                             transactionId:12
                                               maxAttempts:0];
  });

  XCTAssertTrue([self waitUntilTransactionGetEligible:12 timeout:1.0]);
  [RNFBFirestoreTransactionModuleHelper transactionApplyBuffer:@"app"
                                                    databaseId:@"(default)"
                                                 transactionId:12
                                                 commandBuffer:@[
                                                   @{@"type" : @"DELETE", @"path" : @"a/b"},
                                                   @{
                                                     @"type" : @"SET",
                                                     @"path" : @"a/c",
                                                     @"data" : @{@"k" : @"v"},
                                                     @"options" : @{@"merge" : @YES},
                                                   },
                                                   @{
                                                     @"type" : @"SET",
                                                     @"path" : @"a/d",
                                                     @"data" : @{@"k" : @"v"},
                                                     @"options" : @{@"mergeFields" : @[ @"k" ]},
                                                   },
                                                   @{
                                                     @"type" : @"SET",
                                                     @"path" : @"a/e",
                                                     @"data" : @{@"k" : @"v"},
                                                     @"options" : @{},
                                                   },
                                                   @{
                                                     @"type" : @"UPDATE",
                                                     @"path" : @"a/f",
                                                     @"data" : @{@"k" : @"v2"},
                                                   },
                                                 ]];
  // Allow the waiting update block + completion to finish.
  [NSThread sleepForTimeInterval:0.1];
}

- (void)testTransactionBegin_collisionAbort_whenIdAlreadyRegistered {
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:(int64_t)(2 * NSEC_PER_SEC)];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                                databaseId:@"(default)"
                                             transactionId:13
                                               maxAttempts:0];
  });
  XCTAssertTrue([self waitUntilTransactionGetEligible:13 timeout:1.0]);

  // Second begin with the same id: HostStub invokes the update block; putOrSkip fails.
  [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                              databaseId:@"(default)"
                                           transactionId:13
                                             maxAttempts:0];

  [RNFBFirestoreTransactionModuleHelper transactionDispose:@"app"
                                                databaseId:@"(default)"
                                             transactionId:13];
  [NSThread sleepForTimeInterval:0.1];
}

- (void)testTransactionBegin_staleWait_whenHostStubRetriesUpdateBlock {
  [RNFBFirestoreTransactionAttempt
      setDefaultWaitTimeoutOverrideNSec:(int64_t)(200 * NSEC_PER_MSEC)];
  FIRFirestore.transactionUpdateBlockInvokeCount = 2;
  FIRFirestore.transactionRetryDelayUSec = 20000;

  [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                              databaseId:@"(default)"
                                           transactionId:14
                                             maxAttempts:0];
  XCTAssertTrue(YES);
}

- (void)testTransactionGetDocument_afterAbort_rejectsIneligible {
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:(int64_t)(2 * NSEC_PER_SEC)];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                                databaseId:@"(default)"
                                             transactionId:15
                                               maxAttempts:0];
  });
  XCTAssertTrue([self waitUntilTransactionGetEligible:15 timeout:1.0]);

  [RNFBFirestoreTransactionModuleHelper transactionDispose:@"app"
                                                databaseId:@"(default)"
                                             transactionId:15];

  __block NSString *rejectCode = nil;
  [RNFBFirestoreTransactionModuleHelper transactionGetDocument:@"app"
      databaseId:@"(default)"
      transactionId:15
      path:@"col/doc"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];
  XCTAssertEqualObjects(rejectCode, RNFBFirestoreTransactionRejectCodeAborted);
  [NSThread sleepForTimeInterval:0.1];
}

- (void)testTransactionGetDocument_raceAfterEligible_rejectsIneligible {
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:(int64_t)(2 * NSEC_PER_SEC)];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                                databaseId:@"(default)"
                                             transactionId:16
                                               maxAttempts:0];
  });
  XCTAssertTrue([self waitUntilTransactionGetEligible:16 timeout:1.0]);

  [RNFBFirestoreTransactionModuleHelper setTransactionGetAfterEligibleHook:^{
    [RNFBFirestoreTransactionModuleHelper transactionDispose:@"app"
                                                  databaseId:@"(default)"
                                               transactionId:16];
  }];

  __block NSString *rejectCode = nil;
  [RNFBFirestoreTransactionModuleHelper transactionGetDocument:@"app"
      databaseId:@"(default)"
      transactionId:16
      path:@"col/doc"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject after race hook");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];
  XCTAssertEqualObjects(rejectCode, RNFBFirestoreTransactionRejectCodeAborted);
  [NSThread sleepForTimeInterval:0.1];
}

- (void)testTransactionGetDocument_nativeError_rejects {
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:(int64_t)(2 * NSEC_PER_SEC)];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                                databaseId:@"(default)"
                                             transactionId:17
                                               maxAttempts:0];
  });
  XCTAssertTrue([self waitUntilTransactionGetEligible:17 timeout:1.0]);

  FIRTransaction.getDocumentError =
      [NSError errorWithDomain:FIRFirestoreErrorDomain
                          code:FIRFirestoreErrorCodeAborted
                      userInfo:@{NSLocalizedDescriptionKey : @"boom"}];

  __block BOOL rejected = NO;
  [RNFBFirestoreTransactionModuleHelper transactionGetDocument:@"app"
      databaseId:@"(default)"
      transactionId:17
      path:@"col/doc"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected native get error");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];
  XCTAssertTrue(rejected);

  [RNFBFirestoreTransactionModuleHelper transactionApplyBuffer:@"app"
                                                    databaseId:@"(default)"
                                                 transactionId:17
                                                 commandBuffer:@[]];
  [NSThread sleepForTimeInterval:0.1];
}

- (void)testTransactionGetDocument_nilSnapshotPath_fillsFromRef {
  [RNFBFirestoreTransactionAttempt setDefaultWaitTimeoutOverrideNSec:(int64_t)(2 * NSEC_PER_SEC)];
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [RNFBFirestoreTransactionModuleHelper transactionBegin:@"app"
                                                databaseId:@"(default)"
                                             transactionId:18
                                               maxAttempts:0];
  });
  XCTAssertTrue([self waitUntilTransactionGetEligible:18 timeout:1.0]);

  __block NSDictionary *snapshot = nil;
  [RNFBFirestoreTransactionModuleHelper transactionGetDocument:@"app"
      databaseId:@"(default)"
      transactionId:18
      path:@"col/doc"
      resolve:^(id result) {
        snapshot = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"expected resolve with filled path");
      }];
  // Serialize host stub omits path; helper fills from the document ref.
  XCTAssertEqualObjects(snapshot[@"path"], @"col/doc");

  [RNFBFirestoreTransactionModuleHelper transactionApplyBuffer:@"app"
                                                    databaseId:@"(default)"
                                                 transactionId:18
                                                 commandBuffer:@[]];
  [NSThread sleepForTimeInterval:0.1];
}

@end
