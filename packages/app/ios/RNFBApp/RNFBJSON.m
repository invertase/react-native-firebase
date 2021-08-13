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

@implementation RNFBJSON

+ (instancetype)shared {
  static dispatch_once_t once;
  static RNFBJSON *sharedInstance;

  dispatch_once(&once, ^{
    sharedInstance = [[RNFBJSON alloc] init];
    NSString *__nullable firebaseJsonRaw =
        [[NSBundle mainBundle].infoDictionary valueForKey:@"firebase_json_raw"];

    if (firebaseJsonRaw == nil) {
      sharedInstance.firebaseJson = [NSDictionary dictionary];
      return;
    }

    NSData *data = [[NSData alloc] initWithBase64EncodedString:firebaseJsonRaw options:0];

    if (data == nil) {
      sharedInstance.firebaseJson = [NSDictionary dictionary];
      return;
    }

    NSError *jsonError = nil;
    NSDictionary *dictionary = [NSJSONSerialization JSONObjectWithData:data
                                                               options:0
                                                                 error:&jsonError];
    if (jsonError != nil) {
      sharedInstance.firebaseJson = [NSDictionary dictionary];
      return;
    }

    sharedInstance.firebaseJson = dictionary;
  });

  return sharedInstance;
}

- (BOOL)contains:(NSString *)key {
  return [_firebaseJson valueForKey:key] != nil;
}

- (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue {
  if ([_firebaseJson valueForKey:key] == nil) return defaultValue;
  NSNumber *boolean = [_firebaseJson valueForKey:key];
  return [boolean boolValue];
}

- (NSString *)getStringValue:(NSString *)key defaultValue:(NSString *)defaultValue {
  if ([_firebaseJson valueForKey:key] == nil) return defaultValue;
  NSString *string = [_firebaseJson valueForKey:key];
  return string;
}

- (NSDictionary *)getAll {
  return [[NSDictionary alloc] initWithDictionary:_firebaseJson copyItems:YES];
}

- (NSString *)getRawJSON {
  NSString *__nullable firebaseJsonRaw =
      [[NSBundle mainBundle].infoDictionary valueForKey:@"firebase_json_raw"];
  if (firebaseJsonRaw == nil) {
    return @"{}";
  }

  NSData *data = [[NSData alloc] initWithBase64EncodedString:firebaseJsonRaw options:0];
  return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  ;
}
@end
