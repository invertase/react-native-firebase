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

#import "RNFBPerfHandleRegistry.h"

#if __has_include("RNFBHandleMap.h")
#import "RNFBHandleMap.h"
#else
#import "RNFBApp/RNFBHandleMap.h"
#endif

@interface RNFBPerfHandleRegistry ()
@property(nonatomic, strong) RNFBHandleMap *map;
@end

@implementation RNFBPerfHandleRegistry

- (instancetype)init {
  self = [super init];
  if (self) {
    _map = [[RNFBHandleMap alloc] init];
  }
  return self;
}

- (BOOL)put:(id)key value:(id)value error:(NSError **)error {
  return [self.map put:key value:value error:error];
}

- (BOOL)putOrDiscard:(id)key value:(id)value {
  return [self.map putIfAbsent:key value:value];
}

- (id)putReplacing:(id)key value:(id)value {
  return [self.map putReplacing:key value:value];
}

- (id)get:(id)key {
  return [self.map get:key];
}

- (id)take:(id)key {
  return [self.map take:key];
}

- (id)takeIf:(id)key when:(BOOL (^)(id))condition {
  return [self.map takeIf:key when:condition];
}

- (NSArray *)takeAll {
  return [self.map takeAll];
}

@end
