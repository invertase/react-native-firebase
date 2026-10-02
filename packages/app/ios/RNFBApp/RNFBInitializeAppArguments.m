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

#import "RNFBInitializeAppArguments.h"

#import "RNFBNullSentinelDecoder.h"

@implementation RNFBInitializeAppArguments

+ (NSDictionary *)decodedDictionary:(NSDictionary *)dictionary
                       optionalKeys:(NSArray<NSString *> *)optionalKeys
                   nullReplacements:(NSDictionary<NSString *, id> *)nullReplacements {
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:dictionary];
  if (![decoded isKindOfClass:[NSDictionary class]]) {
    // nil stays nil. A root-level sentinel decodes to NSNull, which carries no keys to read.
    return nil;
  }

  NSMutableDictionary *normalized = [decoded mutableCopy];
  for (NSString *key in optionalKeys) {
    if ([normalized[key] isEqual:[NSNull null]]) {
      [normalized removeObjectForKey:key];
    }
  }
  for (NSString *key in nullReplacements) {
    if ([normalized[key] isEqual:[NSNull null]]) {
      normalized[key] = nullReplacements[key];
    }
  }
  return normalized;
}

+ (NSDictionary *)normalizedOptions:(NSDictionary *)options {
  return [self decodedDictionary:options
                    optionalKeys:@[
                      @"databaseURL", @"storageBucket", @"iosBundleId", @"iosClientId",
                      @"appGroupId", @"authDomain"
                    ]
                nullReplacements:@{}];
}

+ (NSDictionary *)normalizedAppConfig:(NSDictionary *)appConfig {
  // A null automaticDataCollectionEnabled means false (matches the JS `!!null` in FirebaseApp),
  // while an omitted key leaves the SDK default untouched.
  return [self decodedDictionary:appConfig
                    optionalKeys:@[ @"name" ]
                nullReplacements:@{@"automaticDataCollectionEnabled" : @NO}];
}

+ (NSNumber *)automaticDataCollectionEnabledFromAppConfig:(NSDictionary *)appConfig {
  id value = appConfig[@"automaticDataCollectionEnabled"];
  return [value isKindOfClass:[NSNumber class]] ? @([value boolValue]) : nil;
}

@end
