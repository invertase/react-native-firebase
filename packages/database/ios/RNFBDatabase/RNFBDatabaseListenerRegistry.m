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

#if __has_include(<RNFBDatabase/RNFBDatabase-Swift.h>)
#import <RNFBDatabase/RNFBDatabase-Swift.h>
#elif __has_include("RNFBDatabase-Swift.h")
#import "RNFBDatabase-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBDatabaseListenerRegistryStorage Swift interface not found"
#endif

@interface RNFBDatabaseListenerRegistry ()
@property(nonatomic, strong) RNFBDatabaseListenerRegistryStorage *storage;
@end

@implementation RNFBDatabaseListenerRegistry

- (instancetype)init {
  self = [super init];
  if (self) {
    _storage = [[RNFBDatabaseListenerRegistryStorage alloc] init];
  }
  return self;
}

- (BOOL)put:(id)key value:(id)value error:(NSError **)error {
  @synchronized(self) {
    if ([self.storage putIfAbsent:key value:value]) {
      return YES;
    }
    if (error != nil) {
      NSString *message = [NSString stringWithFormat:@"Handle id already registered: %@", key];
      *error = [NSError errorWithDomain:RNFBHandleMapErrorDomain
                                   code:RNFBHandleMapErrorCollision
                               userInfo:@{NSLocalizedDescriptionKey : message}];
    }
    return NO;
  }
}

- (id)get:(id)key {
  return [self.storage get:key];
}

- (id)take:(id)key {
  @synchronized(self) {
    return [self.storage take:key];
  }
}

- (NSArray *)takeAll {
  @synchronized(self) {
    return [self.storage takeAll];
  }
}

- (BOOL)hasEventListener:(id)key {
  return [self.storage hasEventListener:key];
}

- (BOOL)hasListeners {
  @synchronized(self) {
    return [self.storage hasListeners];
  }
}

@end
