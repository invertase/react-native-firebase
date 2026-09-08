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

#import <XCTest/XCTest.h>

#import "RNFBFirestoreTransactionAttempt.h"

@interface RNFBFirestoreTransactionAttemptTests : XCTestCase
@property(nonatomic, strong) RNFBFirestoreTransactionAttempt *attempt;
@end

@implementation RNFBFirestoreTransactionAttemptTests

- (void)setUp {
  [super setUp];
  self.attempt = [[RNFBFirestoreTransactionAttempt alloc] init];
}

- (void)testTimeoutError_usesNonFirestoreDomainAndDeadlineExceededCode {
  NSError *error = [self.attempt timeoutError];
  XCTAssertEqualObjects(error.domain, RNFBFirestoreTransactionTimeoutErrorDomain);
  XCTAssertEqual(error.code, RNFBFirestoreTransactionTimeoutErrorCode);
  XCTAssertEqual(error.code, 4);
  XCTAssertFalse([error.domain isEqualToString:@"FIRFirestoreErrorDomain"]);
}

- (void)testDefaultWaitTimeout_isFifteenSeconds {
  XCTAssertEqual(RNFBFirestoreTransactionWaitTimeoutNSec, 15 * NSEC_PER_SEC);
  XCTAssertNotEqual([RNFBFirestoreTransactionAttempt defaultWaitTimeout], (dispatch_time_t)0);
}

- (void)testWait_withoutPrepare_isStale {
  XCTAssertEqual([self.attempt waitUntilSignaledWithTimeout:DISPATCH_TIME_NOW],
                 RNFBFirestoreTransactionWaitResultStale);
}

- (void)testWait_withDispatchTimeNow_timesOutWithoutSleepingFifteenSeconds {
  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  RNFBFirestoreTransactionWaitResult result =
      [self.attempt waitUntilSignaledWithTimeout:DISPATCH_TIME_NOW];
  XCTAssertEqual(result, RNFBFirestoreTransactionWaitResultTimeout);
  XCTAssertTrue(self.attempt.updateBlockReturned);
  XCTAssertFalse(self.attempt.isEligibleForGet);
  XCTAssertNil(self.attempt.nativeTransaction);
}

- (void)testWait_afterApplyBuffer_isSignaled {
  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  NSArray *buffer = @[ @{@"type" : @"DELETE"} ];
  XCTAssertTrue([self.attempt applyCommandBuffer:buffer]);
  RNFBFirestoreTransactionWaitResult result =
      [self.attempt waitUntilSignaledWithTimeout:DISPATCH_TIME_NOW];
  XCTAssertEqual(result, RNFBFirestoreTransactionWaitResultSignaled);
  XCTAssertEqualObjects(self.attempt.commandBuffer, buffer);
}

- (void)testWait_afterAbort_isAborted {
  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  [self.attempt abort];
  RNFBFirestoreTransactionWaitResult result =
      [self.attempt waitUntilSignaledWithTimeout:DISPATCH_TIME_NOW];
  XCTAssertEqual(result, RNFBFirestoreTransactionWaitResultAborted);
  XCTAssertTrue(self.attempt.aborted);
}

- (void)testCompleteWait_mismatchedSemaphore_isStaleAndLeavesLiveAttempt {
  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  dispatch_semaphore_t leftover = dispatch_semaphore_create(0);
  RNFBFirestoreTransactionWaitResult result = [self.attempt completeWaitForSemaphore:leftover
                                                                            timedOut:NO];
  XCTAssertEqual(result, RNFBFirestoreTransactionWaitResultStale);
  XCTAssertFalse(self.attempt.updateBlockReturned);
  XCTAssertTrue(self.attempt.isEligibleForGet);
}

- (void)testGetEligibility_requiresPreparedLiveTransaction {
  XCTAssertFalse(self.attempt.isEligibleForGet);

  [self.attempt prepareForUpdateBlockWithNativeTransaction:nil];
  XCTAssertFalse(self.attempt.isEligibleForGet);

  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  XCTAssertTrue(self.attempt.isEligibleForGet);

  [self.attempt abort];
  XCTAssertFalse(self.attempt.isEligibleForGet);
}

- (void)testApplyBuffer_afterUpdateBlockReturned_isNoOp {
  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  XCTAssertEqual([self.attempt waitUntilSignaledWithTimeout:DISPATCH_TIME_NOW],
                 RNFBFirestoreTransactionWaitResultTimeout);

  XCTAssertFalse([self.attempt applyCommandBuffer:@[ @{@"type" : @"UPDATE"} ]]);
  XCTAssertNil(self.attempt.commandBuffer);
}

- (void)testApplyBuffer_whenAborted_isNoOp {
  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  [self.attempt abort];
  XCTAssertFalse([self.attempt applyCommandBuffer:@[ @{@"type" : @"SET"} ]]);
}

- (void)testApplyBuffer_beforePrepare_isNoOp {
  XCTAssertFalse([self.attempt applyCommandBuffer:@[]]);
}

- (void)testLeftoverApplyBuffer_doesNotSignalLiveWait {
  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  XCTAssertEqual([self.attempt waitUntilSignaledWithTimeout:DISPATCH_TIME_NOW],
                 RNFBFirestoreTransactionWaitResultTimeout);
  XCTAssertFalse([self.attempt applyCommandBuffer:@[ @{@"type" : @"DELETE"} ]]);

  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx2"];
  RNFBFirestoreTransactionWaitResult result =
      [self.attempt waitUntilSignaledWithTimeout:DISPATCH_TIME_NOW];
  XCTAssertEqual(result, RNFBFirestoreTransactionWaitResultTimeout);
}

- (void)testAbort_withoutSemaphore_setsAborted {
  [self.attempt abort];
  XCTAssertTrue(self.attempt.aborted);
}

- (void)testPrepare_resetsReturnedFlagForRetry {
  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx"];
  [self.attempt waitUntilSignaledWithTimeout:DISPATCH_TIME_NOW];
  XCTAssertTrue(self.attempt.updateBlockReturned);

  [self.attempt prepareForUpdateBlockWithNativeTransaction:@"tx2"];
  XCTAssertFalse(self.attempt.updateBlockReturned);
  XCTAssertTrue(self.attempt.isEligibleForGet);
}

@end
