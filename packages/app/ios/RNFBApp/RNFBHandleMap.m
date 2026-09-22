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

#import "RNFBHandleMap.h"

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBHandleMapStorage Swift interface not found"
#endif

NSErrorDomain const RNFBHandleMapErrorDomain = @"io.invertase.firebase.RNFBHandleMap";

@interface RNFBHandleMap ()
@property(nonatomic, strong) RNFBHandleMapStorage *storage;
@end

@implementation RNFBHandleMap

- (instancetype)init {
  self = [super init];
  if (self) {
    _storage = [[RNFBHandleMapStorage alloc] init];
  }
  return self;
}

- (BOOL)put:(id)key value:(id)value error:(NSError **)error {
  if (![self.storage putIfAbsent:key value:value]) {
    if (error != nil) {
      NSString *message = [NSString stringWithFormat:@"Handle id already registered: %@", key];
      *error = [NSError errorWithDomain:RNFBHandleMapErrorDomain
                                   code:RNFBHandleMapErrorCollision
                               userInfo:@{NSLocalizedDescriptionKey : message}];
    }
    return NO;
  }
  return YES;
}

- (BOOL)putIfAbsent:(id)key value:(id)value {
  return [self.storage putIfAbsent:key value:value];
}

- (BOOL)putIfAbsentOrSame:(id)key value:(id)value {
  return [self.storage putIfAbsentOrSame:key value:value];
}

- (id)putReplacing:(id)key value:(id)value {
  return [self.storage putReplacing:key value:value];
}

- (id)get:(id)key {
  return [self.storage get:key];
}

- (id)take:(id)key {
  return [self.storage take:key];
}

- (id)takeIf:(id)key when:(BOOL (^)(id))condition {
  return [self.storage takeIf:key when:condition];
}

- (NSArray *)takeAll {
  return [self.storage takeAll];
}

@end
