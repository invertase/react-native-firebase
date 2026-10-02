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

#import <XCTest/XCTest.h>

#import <React/RCTBridge.h>
#import "RNFBHandleMapStorage-Swift.inc"
#import "RNFBRCTEventEmitter.h"

@interface RNFBRCTEventEmitterFacadeTests : XCTestCase
@property(nonatomic, strong) RNFBRCTEventEmitter *emitter;
@property(nonatomic, strong) RCTBridge *bridge;
@end

@implementation RNFBRCTEventEmitterFacadeTests

- (void)setUp {
  [super setUp];
  self.emitter = [[RNFBRCTEventEmitter alloc] init];
  self.bridge = [[RCTBridge alloc] init];
  [self.emitter invalidate];
}

- (void)tearDown {
  [self.emitter invalidate];
  self.emitter.bridge = nil;
  self.emitter = nil;
  self.bridge = nil;
  [super tearDown];
}

- (void)testSharedIsSingleton {
  XCTAssertIdentical([RNFBRCTEventEmitter shared], [RNFBRCTEventEmitter shared]);
}

- (void)testPublicSelectorsUnchanged {
  NSArray<NSString *> *selectorNames = @[
    @"invalidate",
    @"addListener:",
    @"removeListeners:all:",
    @"sendEventWithName:body:",
    @"notifyJsReady:",
    @"getListenersDictionary",
  ];
  for (NSString *selectorName in selectorNames) {
    XCTAssertTrue([self.emitter respondsToSelector:NSSelectorFromString(selectorName)]);
  }
  XCTAssertTrue([RNFBRCTEventEmitter respondsToSelector:@selector(shared)]);
  XCTAssertTrue([self.emitter respondsToSelector:@selector(bridge)]);
  XCTAssertTrue([self.emitter respondsToSelector:@selector(setBridge:)]);
}

- (void)testInvalidateResetsListenersAndQueue {
  [self.emitter sendEventWithName:@"evt" body:@{@"a" : @1}];
  [self.emitter addListener:@"evt"];
  [self.emitter notifyJsReady:YES];

  [self.emitter invalidate];

  NSDictionary *dict = [self.emitter getListenersDictionary];
  XCTAssertEqualObjects(dict[@"listeners"], @0);
  XCTAssertEqualObjects(dict[@"queued"], @0);
  XCTAssertEqual([dict[@"events"] count], 0u);
}

- (void)testSendEventQueuesWithoutBridge {
  [self.emitter notifyJsReady:YES];
  [self.emitter addListener:@"evt"];
  [self.emitter sendEventWithName:@"evt" body:@{@"a" : @1}];

  NSDictionary *dict = [self.emitter getListenersDictionary];
  XCTAssertEqualObjects(dict[@"queued"], @1);
  XCTAssertNil(self.bridge.lastModule);
}

- (void)testSendEventEmitsViaBridgeWhenReady {
  self.emitter.bridge = self.bridge;
  [self.emitter notifyJsReady:YES];
  [self.emitter addListener:@"evt"];
  [self.bridge resetLastJSCallForTesting];

  [self.emitter sendEventWithName:@"evt" body:@{@"a" : @1}];

  XCTAssertEqualObjects(self.bridge.lastModule, @"RCTDeviceEventEmitter");
  XCTAssertEqualObjects(self.bridge.lastMethod, @"emit");
  XCTAssertEqualObjects(self.bridge.lastArgs[0], @"rnfb_evt");
  XCTAssertEqualObjects(self.bridge.lastArgs[1][@"a"], @1);
  XCTAssertEqualObjects([self.emitter getListenersDictionary][@"queued"], @0);
}

- (void)testSendEventEmitsNilBodyAsSingleArg {
  self.emitter.bridge = self.bridge;
  [self.emitter notifyJsReady:YES];
  [self.emitter addListener:@"evt"];
  [self.bridge resetLastJSCallForTesting];

  [self.emitter sendEventWithName:@"evt" body:nil];

  XCTAssertEqualObjects(self.bridge.lastArgs, (@[ @"rnfb_evt" ]));
}

- (void)testNotifyJsReadyFlushesQueuedEvents {
  self.emitter.bridge = self.bridge;
  [self.emitter addListener:@"evt"];
  [self.emitter sendEventWithName:@"evt" body:@{@"a" : @1}];
  [self.bridge resetLastJSCallForTesting];

  [self.emitter notifyJsReady:YES];

  XCTAssertEqualObjects(self.bridge.lastArgs[0], @"rnfb_evt");
  XCTAssertEqualObjects([self.emitter getListenersDictionary][@"queued"], @0);
}

- (void)testAddAndRemoveListeners {
  [self.emitter addListener:@"evt"];
  [self.emitter addListener:@"evt"];
  XCTAssertEqualObjects([self.emitter getListenersDictionary][@"listeners"], @2);
  XCTAssertEqualObjects([self.emitter getListenersDictionary][@"events"][@"evt"], @2);

  [self.emitter removeListeners:@"evt" all:NO];
  XCTAssertEqualObjects([self.emitter getListenersDictionary][@"events"][@"evt"], @1);

  [self.emitter removeListeners:@"evt" all:YES];
  XCTAssertNil([self.emitter getListenersDictionary][@"events"][@"evt"]);
  XCTAssertEqualObjects([self.emitter getListenersDictionary][@"listeners"], @0);
}

@end
