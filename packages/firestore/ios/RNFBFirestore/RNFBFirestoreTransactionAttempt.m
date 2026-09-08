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

#import "RNFBFirestoreTransactionAttempt.h"

NSString *const RNFBFirestoreTransactionTimeoutErrorDomain =
    @"io.invertase.firebase.firestore.transaction";
const NSInteger RNFBFirestoreTransactionTimeoutErrorCode = 4;
const int64_t RNFBFirestoreTransactionWaitTimeoutNSec = 15 * NSEC_PER_SEC;
NSString *const RNFBFirestoreTransactionRejectCodeAborted = @"aborted";
NSString *const RNFBFirestoreTransactionRejectCodeDeadlineExceeded = @"deadline-exceeded";
NSString *const RNFBFirestoreTransactionRejectCodeInternalError = @"internal-error";
NSString *const RNFBFirestoreTransactionMissingIdMessage =
    @"An internal error occurred whilst attempting to find a native transaction by id.";

@implementation RNFBFirestoreTransactionAttempt {
  dispatch_semaphore_t _semaphore;
  BOOL _aborted;
  BOOL _updateBlockReturned;
  NSArray *_commandBuffer;
  id _nativeTransaction;
}

+ (dispatch_time_t)defaultWaitTimeout {
  return dispatch_time(DISPATCH_TIME_NOW, RNFBFirestoreTransactionWaitTimeoutNSec);
}

- (BOOL)aborted {
  @synchronized(self) {
    return _aborted;
  }
}

- (BOOL)updateBlockReturned {
  @synchronized(self) {
    return _updateBlockReturned;
  }
}

- (NSArray *)commandBuffer {
  @synchronized(self) {
    return _commandBuffer;
  }
}

- (id)nativeTransaction {
  @synchronized(self) {
    return _nativeTransaction;
  }
}

- (NSError *)timeoutError {
  return [NSError errorWithDomain:RNFBFirestoreTransactionTimeoutErrorDomain
                             code:RNFBFirestoreTransactionTimeoutErrorCode
                         userInfo:@{}];
}

- (void)prepareForUpdateBlockWithNativeTransaction:(id)nativeTransaction {
  @synchronized(self) {
    _semaphore = dispatch_semaphore_create(0);
    _updateBlockReturned = NO;
    _commandBuffer = nil;
    _nativeTransaction = nativeTransaction;
  }
}

- (RNFBFirestoreTransactionWaitResult)waitUntilSignaledWithTimeout:(dispatch_time_t)timeout {
  dispatch_semaphore_t semaphore;
  @synchronized(self) {
    semaphore = _semaphore;
  }

  if (semaphore == NULL) {
    return [self completeWaitForSemaphore:dispatch_semaphore_create(0) timedOut:YES];
  }

  BOOL timedOut = dispatch_semaphore_wait(semaphore, timeout) != 0;
  return [self completeWaitForSemaphore:semaphore timedOut:timedOut];
}

- (RNFBFirestoreTransactionWaitResult)completeWaitForSemaphore:(dispatch_semaphore_t)semaphore
                                                      timedOut:(BOOL)timedOut {
  @synchronized(self) {
    if (_semaphore != semaphore) {
      return RNFBFirestoreTransactionWaitResultStale;
    }

    _updateBlockReturned = YES;
    _nativeTransaction = nil;

    if (_aborted) {
      return RNFBFirestoreTransactionWaitResultAborted;
    }

    if (timedOut) {
      return RNFBFirestoreTransactionWaitResultTimeout;
    }

    return RNFBFirestoreTransactionWaitResultSignaled;
  }
}

- (BOOL)isEligibleForGet {
  @synchronized(self) {
    return _semaphore != NULL && !_updateBlockReturned && !_aborted && _nativeTransaction != nil;
  }
}

- (NSDictionary *)ineligibleGetRejectUserInfo {
  @synchronized(self) {
    if (_aborted) {
      return @{
        @"code" : RNFBFirestoreTransactionRejectCodeAborted,
        @"message" : @"The transaction was aborted before this get could complete.",
      };
    }

    if (_updateBlockReturned) {
      return @{
        @"code" : RNFBFirestoreTransactionRejectCodeDeadlineExceeded,
        @"message" : @"The transaction update block returned before this get could complete.",
      };
    }

    return @{
      @"code" : RNFBFirestoreTransactionRejectCodeInternalError,
      @"message" : RNFBFirestoreTransactionMissingIdMessage,
    };
  }
}

- (NSDictionary *)rejectUserInfoIfIneligibleForGet {
  @synchronized(self) {
    if (_semaphore != NULL && !_updateBlockReturned && !_aborted && _nativeTransaction != nil) {
      return nil;
    }
    return [self ineligibleGetRejectUserInfo];
  }
}

- (BOOL)applyCommandBuffer:(NSArray *)commandBuffer {
  @synchronized(self) {
    if (_semaphore == NULL || _updateBlockReturned || _aborted) {
      return NO;
    }

    _commandBuffer = [commandBuffer copy];
    dispatch_semaphore_signal(_semaphore);
    return YES;
  }
}

- (void)abort {
  @synchronized(self) {
    _aborted = YES;
    if (_semaphore) {
      dispatch_semaphore_signal(_semaphore);
    }
  }
}

@end
