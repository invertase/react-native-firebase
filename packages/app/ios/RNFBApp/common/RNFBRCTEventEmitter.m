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
@property(nonatomic, strong) NSMutableArray *pendingEvents;
@property(atomic, assign) NSInteger listenerCount;
@property(nonatomic, strong) NSMutableSet *knownListeners;
@property(readonly) BOOL isObserving;
@end

NSString *const RNFBRCTEventNameKey = @"name";
NSString *const RNFBRCTEventBodyKey = @"body";

@implementation RNFBRCTEventEmitter

  static RNFBRCTEventEmitter *sharedEventEmitter_;

  + (void)load {
    sharedEventEmitter_ = [[RNFBRCTEventEmitter alloc] init];
  }

  + (RNFBRCTEventEmitter *)shared {
    return sharedEventEmitter_;
  }

  - (instancetype)init {
    self = [super init];

    if (self) {
      self.pendingEvents = [NSMutableArray array];
      self.knownListeners = [NSMutableSet set];
    }

    return self;
  }

  - (void)sendEventWithName:(NSString *)eventName body:(id)body {
    @synchronized (self.knownListeners) {
      if (self.bridge && self.isObserving && [self.knownListeners containsObject:eventName]) {
        [self.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                            method:@"emit"
                              args:body ? @[eventName, body] : @[eventName]
                        completion:NULL];

      } else {
        @synchronized (self.pendingEvents) {
          [self.pendingEvents addObject:@{RNFBRCTEventNameKey: eventName, RNFBRCTEventBodyKey: body}];
        }
      }
    }
  }

  - (void)addListener:(NSString *)eventName {
    @synchronized (self.knownListeners) {
      self.listenerCount++;

      for (id event in [self.pendingEvents copy]) {
        if ([event[RNFBRCTEventNameKey] isEqualToString:eventName]) {
          [self sendEventWithName:event[RNFBRCTEventNameKey] body:event[RNFBRCTEventBodyKey]];
          [self.pendingEvents removeObject:event];
        }
      }

      [self.knownListeners addObject:eventName];
    }
  }

  - (void)removeListeners:(NSInteger)count {
    @synchronized (self.knownListeners) {
      self.listenerCount = MAX(self.listenerCount - count, 0);
      if (self.listenerCount == 0) {
        @synchronized (self.knownListeners) {
          [self.knownListeners removeAllObjects];
        }
      }
    }
  }

  - (BOOL)isObserving {
    return self.listenerCount > 0;
  }

@end
