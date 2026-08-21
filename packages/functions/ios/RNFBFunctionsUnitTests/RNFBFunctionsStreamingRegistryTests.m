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

#import <XCTest/XCTest.h>

#import "RNFBFunctionsStreamingRegistry.h"
#import "RNFBHandleMap.h"

@interface FakeStreamHandle : NSObject
@property(nonatomic, assign) NSInteger cancelCount;
- (void)cancel;
@end

@implementation FakeStreamHandle
- (void)cancel {
  self.cancelCount += 1;
}
@end

@interface RNFBFunctionsStreamingRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBFunctionsStreamingRegistry *registry;
@end

@implementation RNFBFunctionsStreamingRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBFunctionsStreamingRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  FakeStreamHandle *handle = [[FakeStreamHandle alloc] init];
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@1 value:handle error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(handle, [self.registry get:@1]);
  XCTAssertEqual(handle, [self.registry take:@1]);
  XCTAssertNil([self.registry get:@1]);
  XCTAssertEqual(handle.cancelCount, 0);
}

- (void)testPut_occupiedId_returnsCollision {
  FakeStreamHandle *first = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);

  NSError *error = nil;
  XCTAssertFalse([self.registry put:@1 value:[[FakeStreamHandle alloc] init] error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPutOrCollisionMessage_uniqueId_returnsNil {
  FakeStreamHandle *handle = [[FakeStreamHandle alloc] init];
  XCTAssertNil([self.registry putOrCollisionMessage:@1 value:handle]);
  XCTAssertEqual(handle, [self.registry get:@1]);
}

- (void)testPutOrCollisionMessage_occupiedId_returnsMessage {
  FakeStreamHandle *first = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);

  NSString *message = [self.registry putOrCollisionMessage:@1
                                                     value:[[FakeStreamHandle alloc] init]];
  XCTAssertTrue(message.length > 0);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testShouldForwardEvent_done_takesAndForwards {
  FakeStreamHandle *handle = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@2 value:handle error:nil]);

  BOOL forward = [self.registry shouldForwardEvent:@{@"done" : @YES} listenerId:@2 expected:handle];

  XCTAssertTrue(forward);
  XCTAssertNil([self.registry get:@2]);
  XCTAssertEqual(handle.cancelCount, 0);
}

- (void)testShouldForwardEvent_chunkWhenPresent_forwards {
  FakeStreamHandle *handle = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@3 value:handle error:nil]);

  BOOL forward = [self.registry shouldForwardEvent:@{@"done" : @NO} listenerId:@3 expected:handle];

  XCTAssertTrue(forward);
  XCTAssertEqual(handle, [self.registry get:@3]);
}

- (void)testShouldForwardEvent_chunkAfterTake_skips {
  FakeStreamHandle *handle = [[FakeStreamHandle alloc] init];
  BOOL forward = [self.registry shouldForwardEvent:@{@"done" : @NO} listenerId:@4 expected:handle];
  XCTAssertFalse(forward);
}

- (void)testShouldForwardEvent_doneAfterTake_skips {
  FakeStreamHandle *handle = [[FakeStreamHandle alloc] init];
  BOOL forward = [self.registry shouldForwardEvent:@{@"done" : @YES} listenerId:@5 expected:handle];
  XCTAssertFalse(forward);
}

- (void)testShouldForwardEvent_doneWhenReplaced_leavesReplacement {
  FakeStreamHandle *original = [[FakeStreamHandle alloc] init];
  FakeStreamHandle *replacement = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@6 value:original error:nil]);
  XCTAssertEqual(original, [self.registry take:@6]);
  XCTAssertTrue([self.registry put:@6 value:replacement error:nil]);

  BOOL forward = [self.registry shouldForwardEvent:@{@"done" : @YES}
                                        listenerId:@6
                                          expected:original];

  XCTAssertFalse(forward);
  XCTAssertEqual(replacement, [self.registry get:@6]);
}

- (void)testShouldForwardEvent_chunkWhenDifferentHolder_skips {
  FakeStreamHandle *mapped = [[FakeStreamHandle alloc] init];
  FakeStreamHandle *other = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@7 value:mapped error:nil]);

  BOOL forward = [self.registry shouldForwardEvent:@{@"done" : @NO} listenerId:@7 expected:other];

  XCTAssertFalse(forward);
  XCTAssertEqual(mapped, [self.registry get:@7]);
}

- (void)testTakeAndCancel_cancelsAfterTake {
  FakeStreamHandle *handle = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@3 value:handle error:nil]);

  [self.registry takeAndCancel:@3];

  XCTAssertEqual(handle.cancelCount, 1);
  XCTAssertNil([self.registry get:@3]);
}

- (void)testTakeAndCancel_missingKey_isNoOp {
  [self.registry takeAndCancel:@99];
}

- (void)testCancelAll_cancelsSnapshotAndLeavesEmpty {
  FakeStreamHandle *a = [[FakeStreamHandle alloc] init];
  FakeStreamHandle *b = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:a error:nil]);
  XCTAssertTrue([self.registry put:@2 value:b error:nil]);

  [self.registry cancelAll];

  XCTAssertEqual(a.cancelCount, 1);
  XCTAssertEqual(b.cancelCount, 1);
  XCTAssertNil([self.registry get:@1]);
  XCTAssertNil([self.registry get:@2]);
}

- (void)testPut_occupiedId_nilErrorOut_returnsNo {
  FakeStreamHandle *first = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  XCTAssertFalse([self.registry put:@1 value:[[FakeStreamHandle alloc] init] error:nil]);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPut_afterTake_allowsReuse {
  FakeStreamHandle *first = [[FakeStreamHandle alloc] init];
  FakeStreamHandle *second = [[FakeStreamHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  XCTAssertEqual(first, [self.registry take:@1]);
  XCTAssertTrue([self.registry put:@1 value:second error:nil]);
  XCTAssertEqual(second, [self.registry get:@1]);
  XCTAssertEqual(first.cancelCount, 0);
}

- (void)testCancelAll_objectWithoutCancel_doesNotCrash {
  NSObject *plain = [[NSObject alloc] init];
  XCTAssertTrue([self.registry put:@4 value:plain error:nil]);
  [self.registry cancelAll];
  XCTAssertNil([self.registry get:@4]);
}

@end
