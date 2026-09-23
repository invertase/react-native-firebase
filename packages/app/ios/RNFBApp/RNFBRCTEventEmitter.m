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

#import "RNFBRCTEventEmitter.h"

#import <React/RCTBridge.h>

#if __has_include(<RNFBApp/RNFBApp-Swift.h>)
#import <RNFBApp/RNFBApp-Swift.h>
#elif __has_include("RNFBApp-Swift.h")
#import "RNFBApp-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBRCTEventEmitterCore Swift interface not found"
#endif

@interface RNFBRCTEventEmitter ()
@property(nonatomic, strong) RNFBRCTEventEmitterCore *core;
@end

@implementation RNFBRCTEventEmitter

+ (instancetype)shared {
  static dispatch_once_t once;
  static RNFBRCTEventEmitter *sharedInstance;
  dispatch_once(&once, ^{
    sharedInstance = [[RNFBRCTEventEmitter alloc] init];
  });
  return sharedInstance;
}

- (instancetype)init {
  self = [super init];

  if (self) {
    __weak typeof(self) weakSelf = self;
    _core = [[RNFBRCTEventEmitterCore alloc]
        initWithIsBridgePresent:^BOOL {
          return weakSelf.bridge != nil;
        }
        emitHandler:^(NSString *eventName, id body) {
          __strong typeof(weakSelf) strongSelf = weakSelf;
          NSString *prefixedEventName = [@"rnfb_" stringByAppendingString:eventName];
          [strongSelf.bridge
              enqueueJSCall:@"RCTDeviceEventEmitter"
                     method:@"emit"
                       args:body ? @[ prefixedEventName, body ] : @[ prefixedEventName ]
                 completion:NULL];
        }];
  }

  return self;
}

- (void)invalidate {
  [self.core invalidate];
}

- (void)notifyJsReady:(BOOL)jsReady {
  [self.core notifyJsReady:jsReady];
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
  [self.core sendEventWithName:eventName body:body];
}

- (void)addListener:(NSString *)eventName {
  [self.core addListener:eventName];
}

- (void)removeListeners:(NSString *)eventName all:(BOOL)all {
  [self.core removeListeners:eventName all:all];
}

- (NSDictionary *)getListenersDictionary {
  return [self.core getListenersDictionary];
}

@end
