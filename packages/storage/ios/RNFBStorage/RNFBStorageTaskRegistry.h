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
 * Pending upload/download task map. Unique `put`; callers `take` or `cancelAll` then cancel
 * outside the HandleMap lock. Stored values are expected to respond to `cancel`.
 */
@interface RNFBStorageTaskRegistry : NSObject

- (BOOL)put:(id)key value:(id)value error:(NSError *_Nullable *_Nullable)error;
/// Unique put. On collision, `cancel`s the incoming value and leaves the existing mapping.
- (BOOL)putOrDiscard:(id)key value:(id)value;
- (nullable id)get:(id)key;
- (nullable id)take:(id)key;
/// Take then cancel outside the HandleMap lock. Returns NO when no mapping existed.
- (BOOL)takeAndCancel:(id)key;
- (void)cancelAll;

@end

NS_ASSUME_NONNULL_END
