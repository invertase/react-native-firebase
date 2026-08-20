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

FOUNDATION_EXPORT NSErrorDomain const RNFBHandleMapErrorDomain;

typedef NS_ERROR_ENUM(RNFBHandleMapErrorDomain, RNFBHandleMapErrorCode){
    RNFBHandleMapErrorCollision = 1,
};

/**
 * Thread-safe id → handle registry. The lock only moves pointers; this class never invokes methods
 * on stored values (no SDK cancel/remove). Callers `take` or `takeAll`, then act on the returned
 * object(s) outside the lock. Keys are typically NSNumber or NSString.
 *
 * `put` is unique: an occupied id fails with `RNFBHandleMapErrorCollision`. There is no upsert.
 * Replace at the call site with `take` then `put`.
 *
 * Do not lock on a `RNFBHandleMap` instance. This type uses `@synchronized(self)`; callers that
 * synchronize on the same object can deadlock. Never `@synchronized(handleMap)` around these
 * methods.
 */
@interface RNFBHandleMap : NSObject

/// Registers `value` under `key`. Returns NO and sets `error` if `key` is already occupied.
- (BOOL)put:(id)key value:(id)value error:(NSError *_Nullable *_Nullable)error;

/// Peeks at the handle for `key` without removing it (for emit while still registered).
- (nullable id)get:(id)key;

/// Removes and returns the handle for `key`, or nil if absent.
- (nullable id)take:(id)key;

/// Snapshot of current values, then clear. Cancel/remove each returned object after this method
/// returns, not under this map's lock.
- (NSArray *)takeAll;

@end

NS_ASSUME_NONNULL_END
