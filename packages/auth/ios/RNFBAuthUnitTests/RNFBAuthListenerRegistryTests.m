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

#import "RNFBAuthListenerRegistry.h"
#import "RNFBHandleMap.h"

@interface FakeAuthListenerHandle : NSObject
@property(nonatomic, assign) NSInteger removeCount;
- (void)remove;
@end

@implementation FakeAuthListenerHandle
- (void)remove {
  self.removeCount += 1;
}
@end

@interface RNFBAuthListenerRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBAuthListenerRegistry *registry;
@end

@implementation RNFBAuthListenerRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBAuthListenerRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  FakeAuthListenerHandle *handle = [[FakeAuthListenerHandle alloc] init];
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@"app" value:handle error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(handle, [self.registry get:@"app"]);
  XCTAssertEqual(handle, [self.registry take:@"app"]);
  XCTAssertNil([self.registry get:@"app"]);
  XCTAssertEqual(handle.removeCount, 0);
}

- (void)testPut_occupiedId_returnsCollision {
  FakeAuthListenerHandle *first = [[FakeAuthListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);

  NSError *error = nil;
  XCTAssertFalse([self.registry put:@"app"
                              value:[[FakeAuthListenerHandle alloc] init]
                              error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqual(first, [self.registry get:@"app"]);
}

- (void)testPut_occupiedId_nilErrorOut_returnsNo {
  FakeAuthListenerHandle *first = [[FakeAuthListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);
  XCTAssertFalse([self.registry put:@"app" value:[[FakeAuthListenerHandle alloc] init] error:nil]);
  XCTAssertEqual(first, [self.registry get:@"app"]);
}

- (void)testGet_whenFree_isNil {
  XCTAssertNil([self.registry get:@"app"]);
}

- (void)testGet_whenOccupied_returnsHandle {
  FakeAuthListenerHandle *first = [[FakeAuthListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);
  XCTAssertEqual(first, [self.registry get:@"app"]);
}

- (void)testPutOrDiscard_collision_removesIncoming {
  FakeAuthListenerHandle *first = [[FakeAuthListenerHandle alloc] init];
  FakeAuthListenerHandle *duplicate = [[FakeAuthListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:first error:nil]);
  XCTAssertFalse([self.registry putOrDiscard:@"app" value:duplicate]);
  XCTAssertEqual(duplicate.removeCount, 1);
  XCTAssertEqual(first.removeCount, 0);
  XCTAssertEqual(first, [self.registry get:@"app"]);
}

- (void)testPutOrDiscard_storesWhenFree {
  FakeAuthListenerHandle *handle = [[FakeAuthListenerHandle alloc] init];
  XCTAssertTrue([self.registry putOrDiscard:@"app" value:handle]);
  XCTAssertEqual(handle, [self.registry get:@"app"]);
  XCTAssertEqual(handle.removeCount, 0);
}

- (void)testTakeAndRemove_removesAfterTake {
  FakeAuthListenerHandle *handle = [[FakeAuthListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"app" value:handle error:nil]);
  [self.registry takeAndRemove:@"app"];
  XCTAssertEqual(handle.removeCount, 1);
  XCTAssertNil([self.registry get:@"app"]);
}

- (void)testTakeAndRemove_missingKey_isNoOp {
  [self.registry takeAndRemove:@"missing"];
}

- (void)testRemoveAll_removesSnapshotAndLeavesEmpty {
  FakeAuthListenerHandle *a = [[FakeAuthListenerHandle alloc] init];
  FakeAuthListenerHandle *b = [[FakeAuthListenerHandle alloc] init];
  XCTAssertTrue([self.registry put:@"a" value:a error:nil]);
  XCTAssertTrue([self.registry put:@"b" value:b error:nil]);
  [self.registry removeAll];
  XCTAssertEqual(a.removeCount, 1);
  XCTAssertEqual(b.removeCount, 1);
  XCTAssertNil([self.registry get:@"a"]);
  XCTAssertNil([self.registry get:@"b"]);
}

- (void)testPut_afterTake_allowsReuse {
  FakeAuthListenerHandle *first = [[FakeAuthListenerHandle alloc] init];
  FakeAuthListenerHandle *second = [[FakeAuthListenerHandle alloc] init];
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
