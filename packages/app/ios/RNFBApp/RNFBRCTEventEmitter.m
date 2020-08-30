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

@interface RNFBRCTEventEmitter ()
@property(atomic, assign) BOOL jsReady;
@property(atomic, assign) NSInteger jsListenerCount;
@property(nonatomic, strong) NSMutableDictionary *jsListeners;
@property(nonatomic, strong) NSMutableArray *queuedEvents;
@property(readonly) BOOL isObserving;
@end

NSString *const RNFBRCTEventNameKey = @"name";
NSString *const RNFBRCTEventBodyKey = @"body";

@implementation RNFBRCTEventEmitter

- (void)invalidate {
  self.jsReady = FALSE;
  self.queuedEvents = [NSMutableArray array];
  self.jsListeners = [NSMutableDictionary dictionary];
  self.jsListenerCount = 0;
}

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
    self.jsReady = FALSE;
    self.queuedEvents = [NSMutableArray array];
    self.jsListeners = [NSMutableDictionary dictionary];
  }

  return self;
}

- (void)notifyJsReady:(BOOL)jsReady {
  @synchronized (self.jsListeners) {
    self.jsReady = jsReady;
    if (jsReady) {
      for (id event in [self.queuedEvents copy]) {
        [self sendEventWithName:event[RNFBRCTEventNameKey] body:event[RNFBRCTEventBodyKey]];
        @synchronized (self.queuedEvents) {
          [self.queuedEvents removeObject:event];
        }
      }
    }
  }
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
  @synchronized (self.jsListeners) {
    if (self.bridge && self.isObserving && self.jsListeners[eventName] != nil) {
      NSString *prefixedEventName = [@"rnfb_" stringByAppendingString:eventName];
      [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                          method:@"emit"
                            args:body ? @[prefixedEventName, body] : @[prefixedEventName]
                      completion:NULL];
    } else {
      @synchronized (self.queuedEvents) {
        [self.queuedEvents addObject:@{RNFBRCTEventNameKey: eventName, RNFBRCTEventBodyKey: body}];
      }
    }
  }
}

- (void)addListener:(NSString *)eventName {
  @synchronized (self.jsListeners) {
    self.jsListenerCount++;

    if (self.jsListeners[eventName] == nil) {
      self.jsListeners[eventName] = @([@1 integerValue]);
    } else {
      self.jsListeners[eventName] = @([self.jsListeners[eventName] integerValue] + [@1 integerValue]);
    }

    for (id event in [self.queuedEvents copy]) {
      if ([event[RNFBRCTEventNameKey] isEqualToString:eventName]) {
        [self sendEventWithName:event[RNFBRCTEventNameKey] body:event[RNFBRCTEventBodyKey]];
        @synchronized (self.queuedEvents) {
          [self.queuedEvents removeObject:event];
        }
      }
    }
  }
}

- (void)removeListeners:(NSString *)eventName all:(BOOL)all {
  @synchronized (self.jsListeners) {
    if (self.jsListeners[eventName] != nil) {
      NSInteger listenersForEvent = [self.jsListeners[eventName] integerValue];

      if (listenersForEvent <= 1 || all) {
        @synchronized (self.jsListeners) {
          [self.jsListeners removeObjectForKey:eventName];
        }
      } else {
        @synchronized (self.jsListeners) {
          self.jsListeners[eventName] = @([self.jsListeners[eventName] integerValue] - [@1 integerValue]);
        }
      }

      if (all) {
        self.jsListenerCount = self.jsListenerCount - listenersForEvent;
      } else {
        self.jsListenerCount = self.jsListenerCount - [@1 integerValue];
      }
    }
  }
}

- (NSDictionary *)getListenersDictionary {
  NSMutableDictionary *listenersDictionary = [NSMutableDictionary new];
  listenersDictionary[@"listeners"] = @(self.jsListenerCount);
  listenersDictionary[@"queued"] = @([self.queuedEvents count]);
  listenersDictionary[@"events"] = [self.jsListeners copy];
  return listenersDictionary;
}


- (BOOL)isObserving {
  return self.jsReady && self.jsListenerCount > 0;
}

@end
