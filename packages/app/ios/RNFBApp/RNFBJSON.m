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

@interface RNFBJSON ()
@property(nonatomic, strong) NSDictionary *firebaseJson;
@end

NSString *const RNFBJSONBundleKey = @"firebase_json_raw";

@implementation RNFBJSON

static RNFBJSON *sharedInstance;

+ (void)load {
  sharedInstance = [[RNFBJSON alloc] init];
}

- (instancetype)init {
  self = [super init];

  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    NSString *__nullable firebaseJsonRaw = [[NSBundle mainBundle].infoDictionary valueForKey:RNFBJSONBundleKey];

    if (firebaseJsonRaw == nil) {
      self.firebaseJson = [NSDictionary dictionary];
      return;
    }

    NSData *data = [[NSData alloc] initWithBase64EncodedString:firebaseJsonRaw options:0];

    if (data == nil) {
      self.firebaseJson = [NSDictionary dictionary];
      return;
    }

    NSError *jsonError = nil;
    NSDictionary *dictionary = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
    if (jsonError != nil) {
      self.firebaseJson = [NSDictionary dictionary];
      return;
    }

    self.firebaseJson = dictionary;
  });

  return self;
}

- (BOOL)contains:(NSString *)key {
  return [_firebaseJson valueForKey:key] != nil;
}

- (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue {
  if ([_firebaseJson valueForKey:key] == nil)
    return defaultValue;
  NSNumber *boolean = [_firebaseJson valueForKey:key];
  return [boolean boolValue];
}

- (NSString *)getStringValue:(NSString *)key defaultValue:(NSString *)defaultValue {
  if ([_firebaseJson valueForKey:key] == nil)
    return defaultValue;
  NSString *string = [_firebaseJson valueForKey:key];
  return string;
}

- (NSDictionary *)getAll {
  return [[NSDictionary alloc] initWithDictionary:_firebaseJson copyItems:YES];
}

- (NSString *)getRawJSON {
  NSString *__nullable firebaseJsonRaw = [[NSBundle mainBundle].infoDictionary valueForKey:RNFBJSONBundleKey];
  if (firebaseJsonRaw == nil) {
    return @"{}";
  }

  return firebaseJsonRaw;
}

+ (RNFBJSON *)shared {
  return sharedInstance;
}
@end
