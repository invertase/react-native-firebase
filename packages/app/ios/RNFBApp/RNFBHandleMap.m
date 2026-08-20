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

NSErrorDomain const RNFBHandleMapErrorDomain = @"io.invertase.firebase.RNFBHandleMap";

@interface RNFBHandleMap ()
@property(nonatomic, strong) NSMutableDictionary *map;
@end

@implementation RNFBHandleMap

- (instancetype)init {
  self = [super init];
  if (self) {
    _map = [NSMutableDictionary dictionary];
  }
  return self;
}

- (BOOL)put:(id)key value:(id)value error:(NSError **)error {
  @synchronized(self) {
    if (self.map[key] != nil) {
      if (error != nil) {
        NSString *message = [NSString stringWithFormat:@"Handle id already registered: %@", key];
        *error = [NSError errorWithDomain:RNFBHandleMapErrorDomain
                                     code:RNFBHandleMapErrorCollision
                                 userInfo:@{NSLocalizedDescriptionKey : message}];
      }
      return NO;
    }
    self.map[key] = value;
    return YES;
  }
}

- (id)get:(id)key {
  @synchronized(self) {
    return self.map[key];
  }
}

- (id)take:(id)key {
  @synchronized(self) {
    id value = self.map[key];
    [self.map removeObjectForKey:key];
    return value;
  }
}

- (NSArray *)takeAll {
  @synchronized(self) {
    NSArray *values = [self.map allValues];
    [self.map removeAllObjects];
    return values;
  }
}

@end
