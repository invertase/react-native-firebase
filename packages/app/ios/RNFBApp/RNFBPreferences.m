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

#import "RNFBPreferences.h"

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBPreferencesStorage Swift interface not found"
#endif

@interface RNFBPreferences ()
@property(nonatomic, strong) RNFBPreferencesStorage *storage;
@end

@implementation RNFBPreferences

static RNFBPreferences *sharedInstance;

+ (void)load {
  sharedInstance = [[RNFBPreferences alloc] init];
}

- (instancetype)init {
  self = [super init];

  if (self) {
    _storage = [[RNFBPreferencesStorage alloc] init];
  }

  return self;
}

- (BOOL)contains:(NSString *)key {
  return [self.storage contains:key];
}

- (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue {
  return [self.storage getBooleanValue:key defaultValue:defaultValue];
}

- (void)setBooleanValue:(NSString *)key boolValue:(BOOL)boolValue {
  [self.storage setBooleanValue:key boolValue:boolValue];
}

- (void)setIntegerValue:(NSString *)key integerValue:(NSInteger)integerValue {
  [self.storage setIntegerValue:key integerValue:integerValue];
}

- (NSInteger)getIntegerValue:(NSString *)key defaultValue:(NSInteger)defaultValue {
  return [self.storage getIntegerValue:key defaultValue:defaultValue];
}

- (NSString *)getStringValue:(NSString *)key defaultValue:(NSString *)defaultValue {
  return [self.storage getStringValue:key defaultValue:defaultValue];
}

- (void)setStringValue:(NSString *)key stringValue:(NSString *)stringValue {
  [self.storage setStringValue:key stringValue:stringValue];
}

- (NSDictionary *)getAll {
  return [self.storage getAll];
}

- (void)clearAll {
  [self.storage clearAll];
}

- (void)remove:(NSString *)key {
  [self.storage remove:key];
}

+ (RNFBPreferences *)shared {
  return sharedInstance;
}

@end
