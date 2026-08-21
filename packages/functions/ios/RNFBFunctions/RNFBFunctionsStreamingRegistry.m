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

#import "RNFBFunctionsStreamingRegistry.h"

#if __has_include("RNFBHandleMap.h")
#import "RNFBHandleMap.h"
#else
#import "RNFBApp/RNFBHandleMap.h"
#endif

@interface RNFBFunctionsStreamingRegistry ()
@property(nonatomic, strong) RNFBHandleMap *map;
@end

@implementation RNFBFunctionsStreamingRegistry

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

- (NSString *)putOrCollisionMessage:(id)key value:(id)value {
  NSError *putError = nil;
  if ([self put:key value:value error:&putError]) {
    return nil;
  }
  return putError.localizedDescription;
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

- (void)rnfb_cancelHandle:(id)handle {
  if (handle && [handle respondsToSelector:@selector(cancel)]) {
    [handle cancel];
  }
}

- (void)takeAndCancel:(id)key {
  id handle = [self.map take:key];
  [self rnfb_cancelHandle:handle];
}

- (void)cancelAll {
  NSArray *handlers = [self.map takeAll];
  for (id handler in handlers) {
    [self rnfb_cancelHandle:handler];
  }
}

- (BOOL)shouldForwardEvent:(NSDictionary *)event
                listenerId:(NSNumber *)listenerId
                  expected:(id)expected {
  if ([event[@"done"] boolValue]) {
    return [self takeIf:listenerId
                   when:^BOOL(id value) {
                     return value == expected;
                   }] != nil;
  }
  return [self get:listenerId] == expected;
}

@end
