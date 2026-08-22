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

#import "RNFBFirestoreTransactionRegistry.h"

#if __has_include("RNFBHandleMap.h")
#import "RNFBHandleMap.h"
#else
#import "RNFBApp/RNFBHandleMap.h"
#endif

@interface RNFBFirestoreTransactionRegistry ()
@property(nonatomic, strong) RNFBHandleMap *map;
@end

@implementation RNFBFirestoreTransactionRegistry

- (instancetype)init {
  self = [super init];
  if (self) {
    _map = [[RNFBHandleMap alloc] init];
  }
  return self;
}

- (void)rnfb_abortState:(id)state {
  if (![state isKindOfClass:[NSMutableDictionary class]]) {
    return;
  }
  NSMutableDictionary *transactionState = (NSMutableDictionary *)state;
  @synchronized(transactionState) {
    transactionState[@"aborted"] = @YES;
    dispatch_semaphore_t semaphore = transactionState[@"semaphore"];
    if (semaphore) {
      dispatch_semaphore_signal(semaphore);
    }
  }
}

- (BOOL)put:(id)key value:(id)value error:(NSError **)error {
  return [self.map put:key value:value error:error];
}

- (BOOL)putOrSkip:(id)key value:(id)value {
  id existing = [self.map get:key];
  if (existing == value) {
    return YES;
  }
  NSError *error = nil;
  return [self.map put:key value:value error:&error];
}

- (id)get:(id)key {
  return [self.map get:key];
}

- (id)take:(id)key {
  return [self.map take:key];
}

- (void)abortAll {
  NSArray *remaining = [self.map takeAll];
  for (id state in remaining) {
    [self rnfb_abortState:state];
  }
}

@end
