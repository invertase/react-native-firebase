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

#import "RNFBAuthNullSentinelDecoder.h"

#import "RNFBApp/RNFBNullSentinelDecoder.h"

@implementation RNFBAuthNullSentinelDecoder

+ (NSDictionary *)decodedProfileProps:(NSDictionary *)props {
  NSDictionary *decoded = [RNFBNullSentinelDecoder decodeNullSentinels:props];
  NSMutableDictionary *normalized = [NSMutableDictionary dictionaryWithCapacity:decoded.count];
  for (NSString *key in decoded) {
    id value = decoded[key];
    if (value == [NSNull null]) {
      continue;
    }
    normalized[key] = value;
  }
  return normalized;
}

+ (NSURL *)photoURLFromDecodedValue:(id)value {
  return value == nil ? nil : [NSURL URLWithString:value];
}

@end
