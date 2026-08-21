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

#import "RNFBDatabaseQueryRegistry.h"

#if __has_include("RNFBHandleMap.h")
#import "RNFBHandleMap.h"
#else
#import "RNFBApp/RNFBHandleMap.h"
#endif

@protocol RNFBDatabaseHasListeners
- (BOOL)hasListeners;
@end

@interface RNFBDatabaseQueryRegistry ()
@property(nonatomic, strong) RNFBHandleMap *map;
@end

@implementation RNFBDatabaseQueryRegistry

- (instancetype)init {
  self = [super init];
  if (self) {
    _map = [[RNFBHandleMap alloc] init];
  }
  return self;
}

- (void)rnfb_removeAllListeners:(id)query {
  if (query && [query respondsToSelector:@selector(removeAllEventListeners)]) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    [query performSelector:@selector(removeAllEventListeners)];
#pragma clang diagnostic pop
  }
}

- (BOOL)put:(id)key value:(id)value error:(NSError **)error {
  return [self.map put:key value:value error:error];
}

- (id)get:(id)key {
  return [self.map get:key];
}

- (id)take:(id)key {
  return [self.map take:key];
}

- (id)takeIfIdle:(id)key {
  // Read hasListeners outside the HandleMap lock (avoids nesting listener occupancy), then
  // identity-take and put-back if listeners appeared.
  id query = [self.map get:key];
  if (query == nil) {
    return nil;
  }
  if (![query respondsToSelector:@selector(hasListeners)]) {
    return nil;
  }
  if ([(id<RNFBDatabaseHasListeners>)query hasListeners]) {
    return nil;
  }
  id taken = [self.map takeIf:key
                         when:^BOOL(id value) {
                           return value == query;
                         }];
  if (taken == nil) {
    return nil;
  }
  if ([taken respondsToSelector:@selector(hasListeners)] &&
      [(id<RNFBDatabaseHasListeners>)taken hasListeners]) {
    // Prefer put-back so an active query stays registered. If a concurrent put claimed the
    // slot, putIfAbsent fails and this taken query would be an orphan with listeners — clear
    // them so SDK callbacks are not left attached outside the registry.
    if (![self.map putIfAbsent:key value:taken]) {
      [self rnfb_removeAllListeners:taken];
    }
    return nil;
  }
  return taken;
}

- (void)removeAll {
  NSArray *queries = [self.map takeAll];
  for (id query in queries) {
    [self rnfb_removeAllListeners:query];
  }
}

@end
