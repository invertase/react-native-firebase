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

/**
 * Foundation-only decoder for the `{__rnfbNull: true}` null sentinels the JS layer encodes so
 * null object properties survive iOS TurboModule serialization. Kept free of Firebase and React
 * imports so unit-test targets can compile it directly.
 */
@interface RNFBNullSentinelDecoder : NSObject

+ (id)decodeNullSentinels:(id)value;

@end
