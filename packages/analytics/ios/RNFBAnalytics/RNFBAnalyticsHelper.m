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

#import "RNFBAnalyticsHelper.h"

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#elif __has_include("RNFBAnalyticsJavascriptParamsCleaner-Swift.inc")
#import "RNFBAnalyticsJavascriptParamsCleaner-Swift.inc"
#else
#error "RNFBApp Swift interface not found"
#endif

@implementation RNFBAnalyticsHelper

+ (NSDictionary *)decodedParams:(NSDictionary *)params {
  return [RNFBNullSentinelDecoder decodeNullSentinels:params];
}

+ (NSDictionary *)logEventParams:(NSDictionary *)params {
  return [self dictionaryByDecodingAndOmittingNSNull:params];
}

+ (NSDictionary *)decodedUserProperties:(NSDictionary *)properties {
  return [self dictionaryByDecodingAndOmittingNSNull:properties];
}

/**
 * Shared path for logEvent and setUserProperties: decode sentinels, then drop NSNull.
 * setDefaultEventParameters uses decodedParams: instead so NSNull is kept.
 */
+ (NSDictionary *)dictionaryByDecodingAndOmittingNSNull:(NSDictionary *)params {
  return [self dictionaryByOmittingNSNull:[RNFBNullSentinelDecoder decodeNullSentinels:params]];
}

/**
 * Drops NSNull entries from a decoded dictionary (and nested dictionaries/arrays).
 * Used by logEvent (unsupported param types) and setUserProperties (nil clear via omit).
 * Not used by setDefaultEventParameters, which must keep NSNull.
 */
+ (NSDictionary *)dictionaryByOmittingNSNull:(id)decoded {
  if (decoded == nil || decoded == [NSNull null]) {
    return nil;
  }
  if (![decoded isKindOfClass:[NSDictionary class]]) {
    return nil;
  }
  return [self valueByOmittingNSNull:decoded];
}

+ (id)valueByOmittingNSNull:(id)value {
  if (value == nil || value == [NSNull null]) {
    return nil;
  }
  if ([value isKindOfClass:[NSDictionary class]]) {
    NSDictionary *dict = (NSDictionary *)value;
    NSMutableDictionary *normalized = [NSMutableDictionary dictionaryWithCapacity:dict.count];
    for (id key in dict) {
      id child = [self valueByOmittingNSNull:dict[key]];
      if (child != nil) {
        normalized[key] = child;
      }
    }
    return normalized;
  }
  if ([value isKindOfClass:[NSArray class]]) {
    NSArray *array = (NSArray *)value;
    NSMutableArray *normalized = [NSMutableArray arrayWithCapacity:array.count];
    for (id child in array) {
      id processed = [self valueByOmittingNSNull:child];
      if (processed != nil) {
        [normalized addObject:processed];
      }
    }
    return normalized;
  }
  return value;
}

@end
