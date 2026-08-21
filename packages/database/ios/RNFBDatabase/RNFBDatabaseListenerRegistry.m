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

#import "RNFBDatabaseListenerRegistry.h"

#if __has_include("RNFBHandleMap.h")
#import "RNFBHandleMap.h"
#else
#import "RNFBApp/RNFBHandleMap.h"
#endif

@interface RNFBDatabaseListenerRegistry ()
@property(nonatomic, strong) RNFBHandleMap *map;
@property(nonatomic, assign) NSInteger occupancy;
@end

@implementation RNFBDatabaseListenerRegistry

- (instancetype)init {
  self = [super init];
  if (self) {
    _map = [[RNFBHandleMap alloc] init];
    _occupancy = 0;
  }
  return self;
}

- (BOOL)put:(id)key value:(id)value error:(NSError **)error {
  @synchronized(self) {
    if ([self.map put:key value:value error:error]) {
      _occupancy += 1;
      return YES;
    }
    return NO;
  }
}

- (id)get:(id)key {
  return [self.map get:key];
}

- (id)take:(id)key {
  @synchronized(self) {
    id value = [self.map take:key];
    if (value != nil) {
      _occupancy -= 1;
    }
    return value;
  }
}

- (NSArray *)takeAll {
  @synchronized(self) {
    NSArray *remaining = [self.map takeAll];
    _occupancy -= (NSInteger)remaining.count;
    return remaining;
  }
}

- (BOOL)hasEventListener:(id)key {
  return [self.map get:key] != nil;
}

- (BOOL)hasListeners {
  @synchronized(self) {
    return _occupancy > 0;
  }
}

@end
