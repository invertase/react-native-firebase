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

#import "RNFBJSON.h"

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBJSONImplementation Swift interface not found"
#endif

@interface RNFBJSON ()
@property(nonatomic, strong) RNFBJSONImplementation *implementation;
@end

@implementation RNFBJSON

+ (instancetype)shared {
  static dispatch_once_t once;
  static RNFBJSON *sharedInstance;

  dispatch_once(&once, ^{
    sharedInstance = [[RNFBJSON alloc] init];
    NSString *__nullable firebaseJsonRaw =
        [[NSBundle mainBundle].infoDictionary valueForKey:@"firebase_json_raw"];
    sharedInstance.implementation =
        [[RNFBJSONImplementation alloc] initWithRawValue:firebaseJsonRaw];
  });

  return sharedInstance;
}

- (BOOL)contains:(NSString *)key {
  return [self.implementation contains:key];
}

- (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue {
  NSNumber *boolean = [self.implementation valueForKey:key defaultValue:nil];
  if (boolean == nil) return defaultValue;
  return [boolean boolValue];
}

- (NSString *)getStringValue:(NSString *)key defaultValue:(NSString *)defaultValue {
  return [self.implementation valueForKey:key defaultValue:defaultValue];
}

- (NSArray *)getArrayValue:(NSString *)key defaultValue:(NSArray *)defaultValue {
  return [self.implementation valueForKey:key defaultValue:defaultValue];
}

- (NSDictionary *)getAll {
  return [[NSDictionary alloc] initWithDictionary:(NSDictionary *)self.implementation.jsonObject
                                        copyItems:YES];
}

- (NSString *)getRawJSON {
  NSString *__nullable firebaseJsonRaw =
      [[NSBundle mainBundle].infoDictionary valueForKey:@"firebase_json_raw"];
  if (firebaseJsonRaw == nil) {
    return [RNFBJSONImplementation rawJSONFromRawValue:nil];
  }

  return [RNFBJSONImplementation rawJSONFromRawValue:firebaseJsonRaw];
}
@end
