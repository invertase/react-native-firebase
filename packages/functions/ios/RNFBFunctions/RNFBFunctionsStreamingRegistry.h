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
 * Functions streaming listener map. Unique `put`; callers `take` or `cancelAll` then cancel
 * outside the HandleMap lock. Stored values are expected to respond to `cancel`. Emit-after-take
 * is `shouldForwardEvent:listenerId:`.
 */
@interface RNFBFunctionsStreamingRegistry : NSObject

- (BOOL)put:(id)key value:(id)value error:(NSError *_Nullable *_Nullable)error;

/// Unique put. On success returns nil; on collision returns a non-empty message.
- (nullable NSString *)putOrCollisionMessage:(id)key value:(id)value;

- (nullable id)get:(id)key;
- (nullable id)take:(id)key;
- (void)takeAndCancel:(id)key;
- (void)cancelAll;

/// When `event[@"done"]` is true, takes the listener and returns YES. Otherwise returns whether
/// the listener is still registered (chunk may be forwarded).
- (BOOL)shouldForwardEvent:(NSDictionary *)event listenerId:(NSNumber *)listenerId;

@end

NS_ASSUME_NONNULL_END
