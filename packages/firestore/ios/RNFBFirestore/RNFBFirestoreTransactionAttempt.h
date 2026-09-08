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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/**
 * Timeout NSError domain for the JS-bridge wait. Must not be FIRFirestoreErrorDomain so the iOS
 * SDK treats the failure as permanent (no transaction retry). Code matches
 * FIRFirestoreErrorCodeDeadlineExceeded (4) so JS maps via getCodeAndMessage:.
 */
FOUNDATION_EXPORT NSString *const RNFBFirestoreTransactionTimeoutErrorDomain;
FOUNDATION_EXPORT const NSInteger RNFBFirestoreTransactionTimeoutErrorCode;
FOUNDATION_EXPORT const int64_t RNFBFirestoreTransactionWaitTimeoutNSec;

FOUNDATION_EXPORT NSString *const RNFBFirestoreTransactionRejectCodeAborted;
FOUNDATION_EXPORT NSString *const RNFBFirestoreTransactionRejectCodeDeadlineExceeded;
FOUNDATION_EXPORT NSString *const RNFBFirestoreTransactionRejectCodeInternalError;
FOUNDATION_EXPORT NSString *const RNFBFirestoreTransactionMissingIdMessage;

typedef NS_ENUM(NSInteger, RNFBFirestoreTransactionWaitResult) {
  RNFBFirestoreTransactionWaitResultSignaled = 0,
  RNFBFirestoreTransactionWaitResultTimeout = 1,
  RNFBFirestoreTransactionWaitResultAborted = 2,
  RNFBFirestoreTransactionWaitResultStale = 3,
};

/**
 * One native transaction id's attempt state. Foundation-only so in-package XCTest can compile it
 * without Firebase or TurboModules. FIRTransaction is stored as an opaque id; the module casts.
 */
@interface RNFBFirestoreTransactionAttempt : NSObject

@property(nonatomic, readonly) BOOL aborted;
@property(nonatomic, readonly) BOOL updateBlockReturned;
@property(nonatomic, readonly, nullable) NSArray *commandBuffer;
@property(nonatomic, readonly, nullable) id nativeTransaction;

+ (dispatch_time_t)defaultWaitTimeout;
- (NSError *)timeoutError;

/**
 * Arms a new semaphore and native transaction, and resets `updateBlockReturned` so get is eligible
 * again. Timeout must stay a non-FIRFirestoreErrorDomain error so the SDK does not retry; a retry
 * would make a leftover JS get look live on the new FIRTransaction.
 */
- (void)prepareForUpdateBlockWithNativeTransaction:(nullable id)nativeTransaction;
- (RNFBFirestoreTransactionWaitResult)waitUntilSignaledWithTimeout:(dispatch_time_t)timeout;
- (RNFBFirestoreTransactionWaitResult)completeWaitForSemaphore:(dispatch_semaphore_t)semaphore
                                                      timedOut:(BOOL)timedOut;

- (BOOL)isEligibleForGet;
/// JS reject payload when get is not eligible. aborted, else leftover after the update block
/// returned (`deadline-exceeded`), else `internal-error`. Missing registry id is the module.
- (NSDictionary *)ineligibleGetRejectUserInfo;
/// nil when get is still live. Otherwise the same payload as `ineligibleGetRejectUserInfo`,
/// chosen under the same lock as the eligibility check.
- (nullable NSDictionary *)rejectUserInfoIfIneligibleForGet;
- (BOOL)applyCommandBuffer:(nullable NSArray *)commandBuffer;
- (void)abort;

@end

NS_ASSUME_NONNULL_END
