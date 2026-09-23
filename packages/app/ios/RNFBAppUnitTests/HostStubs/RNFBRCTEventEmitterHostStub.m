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
 */

#import "RNFBRCTEventEmitter.h"

@implementation RNFBRCTEventEmitter

+ (RNFBRCTEventEmitter *)shared {
  static RNFBRCTEventEmitter *sharedInstance;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[RNFBRCTEventEmitter alloc] init];
  });
  return sharedInstance;
}

- (void)invalidate {
}

- (void)addListener:(NSString *)eventName {
  (void)eventName;
}

- (void)removeListeners:(NSString *)eventName all:(BOOL)all {
  (void)eventName;
  (void)all;
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
  (void)eventName;
  (void)body;
}

- (void)notifyJsReady:(BOOL)ready {
  (void)ready;
}

- (NSDictionary *)getListenersDictionary {
  return @{};
}

@end
