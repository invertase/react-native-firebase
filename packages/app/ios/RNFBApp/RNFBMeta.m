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

#import "RNFBMeta.h"

@interface RNFBMeta ()
@property(nonatomic, strong) NSDictionary *firebaseJson;
@end

NSString *const RNFBMetaPrefix = @"rnfirebase_";

@implementation RNFBMeta

+ (BOOL)contains:(NSString *)key {
  id keyValue = [[NSBundle mainBundle].infoDictionary valueForKey:[RNFBMetaPrefix stringByAppendingString:key]];
  return keyValue != nil;
}

+ (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue {
  NSNumber *keyValue = [[NSBundle mainBundle].infoDictionary valueForKey:[RNFBMetaPrefix stringByAppendingString:key]];
  if (keyValue == nil) return defaultValue;
  return [keyValue boolValue];
}

+ (NSString *)getStringValue:(NSString *)key defaultValue:(NSString *)defaultValue {
  NSString *keyValue = [[NSBundle mainBundle].infoDictionary valueForKey:[RNFBMetaPrefix stringByAppendingString:key]];
  if (keyValue == nil) return defaultValue;
  return keyValue;
}

+ (NSDictionary *)getAll {
  NSMutableDictionary *allMetaValues = [NSMutableDictionary dictionary];

  NSArray *keys = [[NSBundle mainBundle].infoDictionary allKeys];
  for (NSString *key in keys) {
    if ([key hasPrefix:RNFBMetaPrefix]) {
      allMetaValues[key] = [NSBundle mainBundle].infoDictionary[key];
    }
  }

  return allMetaValues;
}

@end
