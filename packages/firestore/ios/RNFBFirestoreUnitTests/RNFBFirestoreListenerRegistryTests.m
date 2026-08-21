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

#import "RNFBFirestoreListenerRegistry.h"
#import "RNFBHandleMap.h"

@interface FakeListenerRegistration : NSObject
@property(nonatomic, assign) NSInteger removeCount;
- (void)remove;
@end

@implementation FakeListenerRegistration
- (void)remove {
  self.removeCount += 1;
}
@end

@interface RNFBFirestoreListenerRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBFirestoreListenerRegistry *registry;
@end

@implementation RNFBFirestoreListenerRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBFirestoreListenerRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  FakeListenerRegistration *handle = [[FakeListenerRegistration alloc] init];
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@1 value:handle error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(handle, [self.registry get:@1]);
  XCTAssertEqual(handle, [self.registry take:@1]);
  XCTAssertNil([self.registry get:@1]);
  XCTAssertEqual(handle.removeCount, 0);
}

- (void)testPut_occupiedId_returnsCollision {
  FakeListenerRegistration *first = [[FakeListenerRegistration alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);

  NSError *error = nil;
  XCTAssertFalse([self.registry put:@1 value:[[FakeListenerRegistration alloc] init] error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPut_occupiedId_nilErrorOut_returnsNo {
  FakeListenerRegistration *first = [[FakeListenerRegistration alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  XCTAssertFalse([self.registry put:@1 value:[[FakeListenerRegistration alloc] init] error:nil]);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testGet_whenFree_isNil {
  XCTAssertNil([self.registry get:@1]);
}

- (void)testGet_whenOccupied_returnsHandle {
  FakeListenerRegistration *first = [[FakeListenerRegistration alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPutOrDiscard_collision_removesIncoming {
  FakeListenerRegistration *first = [[FakeListenerRegistration alloc] init];
  FakeListenerRegistration *duplicate = [[FakeListenerRegistration alloc] init];
  XCTAssertTrue([self.registry put:@2 value:first error:nil]);
  XCTAssertFalse([self.registry putOrDiscard:@2 value:duplicate]);
  XCTAssertEqual(duplicate.removeCount, 1);
  XCTAssertEqual(first.removeCount, 0);
  XCTAssertEqual(first, [self.registry get:@2]);
}

- (void)testPutOrDiscard_storesWhenFree {
  FakeListenerRegistration *handle = [[FakeListenerRegistration alloc] init];
  XCTAssertTrue([self.registry putOrDiscard:@3 value:handle]);
  XCTAssertEqual(handle, [self.registry get:@3]);
  XCTAssertEqual(handle.removeCount, 0);
}

- (void)testTakeAndRemove_removesAfterTake {
  FakeListenerRegistration *handle = [[FakeListenerRegistration alloc] init];
  XCTAssertTrue([self.registry put:@5 value:handle error:nil]);
  [self.registry takeAndRemove:@5];
  XCTAssertEqual(handle.removeCount, 1);
  XCTAssertNil([self.registry get:@5]);
}

- (void)testTakeAndRemove_missingKey_isNoOp {
  [self.registry takeAndRemove:@99];
}

- (void)testRemoveAll_removesSnapshotAndLeavesEmpty {
  FakeListenerRegistration *a = [[FakeListenerRegistration alloc] init];
  FakeListenerRegistration *b = [[FakeListenerRegistration alloc] init];
  XCTAssertTrue([self.registry put:@1 value:a error:nil]);
  XCTAssertTrue([self.registry put:@2 value:b error:nil]);
  [self.registry removeAll];
  XCTAssertEqual(a.removeCount, 1);
  XCTAssertEqual(b.removeCount, 1);
  XCTAssertNil([self.registry get:@1]);
  XCTAssertNil([self.registry get:@2]);
}

- (void)testPut_afterTake_allowsReuse {
  FakeListenerRegistration *first = [[FakeListenerRegistration alloc] init];
  FakeListenerRegistration *second = [[FakeListenerRegistration alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  XCTAssertEqual(first, [self.registry take:@1]);
  XCTAssertTrue([self.registry put:@1 value:second error:nil]);
  XCTAssertEqual(second, [self.registry get:@1]);
  XCTAssertEqual(first.removeCount, 0);
}

- (void)testRemoveAll_objectWithoutRemove_doesNotCrash {
  NSObject *plain = [[NSObject alloc] init];
  XCTAssertTrue([self.registry put:@4 value:plain error:nil]);
  [self.registry removeAll];
  XCTAssertNil([self.registry get:@4]);
}

@end
