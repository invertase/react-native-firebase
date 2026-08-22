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
 * Perf trace / HTTP metric handle map. Module start paths use `putReplacing` (last wins, stop
 * displaced outside lock). Unique `put` / `putOrDiscard` remain for tests. Callers `get` then
 * `take` then stop outside the HandleMap lock. Tear-down uses `takeAll` without stopping.
 */
@interface RNFBPerfHandleRegistry : NSObject

- (BOOL)put:(id)key value:(id)value error:(NSError *_Nullable *_Nullable)error;
/// Unique put. On collision, drop the incoming handle without stopping.
- (BOOL)putOrDiscard:(id)key value:(id)value;
/// Last wins. Returns the displaced handle, or nil if the key was free.
- (nullable id)putReplacing:(id)key value:(id)value;
- (nullable id)get:(id)key;
- (nullable id)take:(id)key;
- (nullable id)takeIf:(id)key when:(BOOL (^)(id value))condition;
- (NSArray *)takeAll;

@end

NS_ASSUME_NONNULL_END
