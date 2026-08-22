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
 * Credential / MFA cache map (data only — no SDK cancel). Unique `put`; callers that previously
 * NSMutableDictionary-upserted use `putReplacing` (atomic last wins). Peek with `get`; remove with
 * `take`; invalidate with `clear`. Unique `put` errors on collision; `putOrDiscard` keeps the first
 * mapping.
 */
@interface RNFBAuthCacheRegistry : NSObject

- (BOOL)put:(id)key value:(id)value error:(NSError *_Nullable *_Nullable)error;
/// Unique put. On collision, leave the existing mapping (first wins).
- (BOOL)putOrDiscard:(id)key value:(id)value;
/// Atomic replace (last wins). Preserves prior dictionary upsert.
- (BOOL)putReplacing:(id)key value:(id)value;
- (nullable id)get:(id)key;
- (nullable id)take:(id)key;
- (void)clear;

@end

NS_ASSUME_NONNULL_END
