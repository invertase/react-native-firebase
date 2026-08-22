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

#import "RNFBStorageTaskRegistry.h"

#if __has_include("RNFBHandleMap.h")
#import "RNFBHandleMap.h"
#else
#import "RNFBApp/RNFBHandleMap.h"
#endif

@interface RNFBStorageTaskRegistry ()
@property(nonatomic, strong) RNFBHandleMap *map;
@end

@implementation RNFBStorageTaskRegistry

- (instancetype)init {
  self = [super init];
  if (self) {
    _map = [[RNFBHandleMap alloc] init];
  }
  return self;
}

- (void)rnfb_cancelHandle:(id)handle {
  if (handle && [handle respondsToSelector:@selector(cancel)]) {
    [handle cancel];
  }
}

- (BOOL)put:(id)key value:(id)value error:(NSError **)error {
  return [self.map put:key value:value error:error];
}

- (BOOL)putOrDiscard:(id)key value:(id)value {
  NSError *error = nil;
  if ([self.map put:key value:value error:&error]) {
    return YES;
  }
  [self rnfb_cancelHandle:value];
  return NO;
}

- (id)get:(id)key {
  return [self.map get:key];
}

- (id)take:(id)key {
  return [self.map take:key];
}

- (BOOL)takeAndCancel:(id)key {
  id handle = [self.map take:key];
  if (handle == nil) {
    return NO;
  }
  [self rnfb_cancelHandle:handle];
  return YES;
}

- (void)cancelAll {
  NSArray *handlers = [self.map takeAll];
  for (id handler in handlers) {
    [self rnfb_cancelHandle:handler];
  }
}

@end
