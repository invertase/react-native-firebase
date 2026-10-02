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

#import "RNFBNullSentinelDecoder.h"

@implementation RNFBNullSentinelDecoder

/**
 * Decodes null sentinel objects back to NSNull values.
 * Uses iterative stack-based traversal to avoid stack overflow on deeply nested structures.
 *
 * This reverses the encoding done on the JavaScript side where null values in object
 * properties are replaced with {__rnfbNull: true} sentinel objects to survive iOS
 * TurboModule serialization.
 *
 * Process:
 * 1. Detects sentinel objects: dictionaries with single key "__rnfbNull" set to a true NSNumber
 * 2. Replaces sentinels with NSNull in object properties and arrays
 * 3. Preserves regular NSNull values that were in arrays (never encoded as sentinels)
 * 4. Deep processes all nested objects and arrays using a stack-based iteration
 *
 * @param value - The value to decode (dictionary, array, or primitive)
 * @return The decoded value with sentinels replaced by NSNull
 */
+ (id)decodeNullSentinels:(id)value {
  // Non-container values are returned as-is
  if (![value isKindOfClass:[NSDictionary class]] && ![value isKindOfClass:[NSArray class]]) {
    return value;
  }

  // Helper to detect the sentinel. The flag must be an NSNumber (JS sends boolean true):
  // other value types (NSNull, NSDictionary, NSArray) do not respond to -boolValue.
  BOOL (^isNullSentinel)(NSDictionary *) = ^BOOL(NSDictionary *dict) {
    id flag = dict[@"__rnfbNull"];
    return (dict.count == 1 && [flag isKindOfClass:[NSNumber class]] && [flag boolValue]);
  };

  // Helper to process a child element and add it to the parent container
  void (^processChild)(id, id, id, BOOL, NSMutableArray *) =
      ^void(id child, id parentMutable, id keyOrNil, BOOL isParentDict, NSMutableArray *stack) {
        id processedValue = nil;

        if ([child isKindOfClass:[NSDictionary class]]) {
          NSDictionary *childDict = (NSDictionary *)child;

          if (isNullSentinel(childDict)) {
            // Replace sentinel with NSNull
            processedValue = [NSNull null];
          } else {
            // Process nested dictionary
            NSMutableDictionary *childMut =
                [NSMutableDictionary dictionaryWithCapacity:childDict.count];
            processedValue = childMut;
            [stack addObject:@{@"original" : childDict, @"mutable" : childMut}];
          }
        } else if ([child isKindOfClass:[NSArray class]]) {
          // Process nested array
          NSArray *childArray = (NSArray *)child;
          NSMutableArray *childMut = [NSMutableArray arrayWithCapacity:childArray.count];
          processedValue = childMut;
          [stack addObject:@{@"original" : childArray, @"mutable" : childMut}];
        } else {
          // Preserve primitive values
          // Children come from NSDictionary / NSArray enumeration, so they are never nil.
          processedValue = child;
        }

        // Add to parent container based on type
        if (isParentDict) {
          NSMutableDictionary *mutDict = (NSMutableDictionary *)parentMutable;
          mutDict[keyOrNil] = processedValue;
        } else {
          NSMutableArray *mutArray = (NSMutableArray *)parentMutable;
          [mutArray addObject:processedValue];
        }
      };

  // Root-level sentinel case
  if ([value isKindOfClass:[NSDictionary class]] && isNullSentinel((NSDictionary *)value)) {
    return [NSNull null];
  }

  id rootOriginal = value;
  id rootMutable = nil;

  if ([value isKindOfClass:[NSDictionary class]]) {
    NSDictionary *dict = (NSDictionary *)value;
    rootMutable = [NSMutableDictionary dictionaryWithCapacity:dict.count];
  } else {
    NSArray *array = (NSArray *)value;
    rootMutable = [NSMutableArray arrayWithCapacity:array.count];
  }

  // Stack-based iteration to process nested structures without recursion
  // Stack frames: { @"original": container, @"mutable": mutableContainer }
  NSMutableArray<NSDictionary *> *stack = [NSMutableArray array];
  [stack addObject:@{@"original" : rootOriginal, @"mutable" : rootMutable}];

  while (stack.count > 0) {
    NSDictionary *frame = [stack lastObject];
    [stack removeLastObject];

    id original = frame[@"original"];
    id mutable = frame[@"mutable"];

    if ([original isKindOfClass:[NSDictionary class]]) {
      NSDictionary *origDict = (NSDictionary *)original;

      for (id key in origDict) {
        id child = origDict[key];
        processChild(child, mutable, key, YES, stack);
      }
    } else {
      // Stack frames only ever hold dictionaries or arrays.
      NSArray *origArray = (NSArray *)original;

      for (id child in origArray) {
        processChild(child, mutable, nil, NO, stack);
      }
    }
  }

  return rootMutable;
}

@end
