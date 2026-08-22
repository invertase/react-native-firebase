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
 * Per-query listener handle map. Unique `put`; callers `take` or `takeAll` then remove the SDK
 * observer outside the HandleMap lock. Values are typically NSNumber observer handles.
 */
@interface RNFBDatabaseListenerRegistry : NSObject

- (BOOL)put:(id)key value:(id)value error:(NSError *_Nullable *_Nullable)error;
- (nullable id)get:(id)key;
- (nullable id)take:(id)key;
- (NSArray *)takeAll;
- (BOOL)hasEventListener:(id)key;
- (BOOL)hasListeners;

@end

NS_ASSUME_NONNULL_END
