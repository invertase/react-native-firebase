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

#import "RNFBHandleMap.h"
#import "RNFBRemoteConfigListenerRegistry.h"

@interface FakeRemoteConfigListenerHandle : NSObject
@property(nonatomic, assign) NSInteger removeCount;
- (void)remove;
@end

@implementation FakeRemoteConfigListenerHandle
- (void)remove {
  self.removeCount += 1;
}
@end

@interface RNFBRemoteConfigListenerRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBRemoteConfigListenerRegistry *registry;
@end

@implementation RNFBRemoteConfigListenerRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBRemoteConfigListenerRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  FakeRemoteConfigListenerHandle *handle = [[FakeRemoteConfigListenerHandle alloc] init];
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@"app" value:handle error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(handle, [self.registry get:@"app"]);
  XCTAssertEqual(handle, [self.registry take:@"app"]);
  XCTAssertNil([self.registry get:@"app"]);
  XCTAssertEqual(handle.removeCount, 0);
}

- (void)testPut_occupiedId_returnsCollision {
  FakeRemoteConfigListenerHandle *first = [[FakeRemoteConfigListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);

  NSError *error = nil;
  XCTAssertFalse([self.registry put:@"app"
                              value:[[FakeRemoteConfigListenerHandle alloc] init]
                              error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqual(first, [self.registry get:@"app"]);
}

- (void)testPut_occupiedId_nilErrorOut_returnsNo {
  FakeRemoteConfigListenerHandle *first = [[FakeRemoteConfigListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);
  XCTAssertFalse([self.registry put:@"app"
                              value:[[FakeRemoteConfigListenerHandle alloc] init]
                              error:nil]);
  XCTAssertEqual(first, [self.registry get:@"app"]);
}

- (void)testGet_whenFree_isNil {
  XCTAssertNil([self.registry get:@"app"]);
}

- (void)testGet_whenOccupied_returnsHandle {
  FakeRemoteConfigListenerHandle *first = [[FakeRemoteConfigListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);
  XCTAssertEqual(first, [self.registry get:@"app"]);
}

- (void)testPutOrDiscard_collision_removesIncoming {
  FakeRemoteConfigListenerHandle *first = [[FakeRemoteConfigListenerHandle alloc] init];
  FakeRemoteConfigListenerHandle *duplicate = [[FakeRemoteConfigListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);
  XCTAssertFalse([self.registry putOrDiscard:@"app" value:duplicate]);
  XCTAssertEqual(duplicate.removeCount, 1);
  XCTAssertEqual(first.removeCount, 0);
  XCTAssertEqual(first, [self.registry get:@"app"]);
}

- (void)testPutOrDiscard_storesWhenFree {
  FakeRemoteConfigListenerHandle *handle = [[FakeRemoteConfigListenerHandle alloc] init];
  XCTAssertTrue([self.registry putOrDiscard:@"app" value:handle]);
  XCTAssertEqual(handle, [self.registry get:@"app"]);
  XCTAssertEqual(handle.removeCount, 0);
}

- (void)testTakeAndRemove_removesAfterTake {
  FakeRemoteConfigListenerHandle *handle = [[FakeRemoteConfigListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:handle error:nil]);
  [self.registry takeAndRemove:@"app"];
  XCTAssertEqual(handle.removeCount, 1);
  XCTAssertNil([self.registry get:@"app"]);
}

- (void)testTakeAndRemove_missingKey_isNoOp {
  [self.registry takeAndRemove:@"missing"];
}

- (void)testRemoveAll_removesSnapshotAndLeavesEmpty {
  FakeRemoteConfigListenerHandle *a = [[FakeRemoteConfigListenerHandle alloc] init];
  FakeRemoteConfigListenerHandle *b = [[FakeRemoteConfigListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"a" value:a error:nil]);
  XCTAssertTrue([self.registry put:@"b" value:b error:nil]);
  [self.registry removeAll];
  XCTAssertEqual(a.removeCount, 1);
  XCTAssertEqual(b.removeCount, 1);
  XCTAssertNil([self.registry get:@"a"]);
  XCTAssertNil([self.registry get:@"b"]);
}

- (void)testPut_afterTake_allowsReuse {
  FakeRemoteConfigListenerHandle *first = [[FakeRemoteConfigListenerHandle alloc] init];
  FakeRemoteConfigListenerHandle *second = [[FakeRemoteConfigListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);
  XCTAssertEqual(first, [self.registry take:@"app"]);
  XCTAssertTrue([self.registry put:@"app" value:second error:nil]);
  XCTAssertEqual(second, [self.registry get:@"app"]);
  XCTAssertEqual(first.removeCount, 0);
}

- (void)testRemoveAll_objectWithoutRemove_doesNotCrash {
  NSObject *plain = [[NSObject alloc] init];
  XCTAssertTrue([self.registry put:@"plain" value:plain error:nil]);
  [self.registry removeAll];
  XCTAssertNil([self.registry get:@"plain"]);
}

- (void)testTakeAndRemove_objectWithoutRemove_doesNotCrash {
  NSObject *plain = [[NSObject alloc] init];
  XCTAssertTrue([self.registry put:@"plain" value:plain error:nil]);
  [self.registry takeAndRemove:@"plain"];
  XCTAssertNil([self.registry get:@"plain"]);
}

@end
