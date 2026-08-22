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
#import "RNFBPerfHandleRegistry.h"

@interface FakePerfHandle : NSObject
@property(nonatomic, assign) NSInteger stopCount;
- (void)stop;
@end

@implementation FakePerfHandle
- (void)stop {
  self.stopCount += 1;
}
@end

@interface RNFBPerfHandleRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBPerfHandleRegistry *registry;
@end

@implementation RNFBPerfHandleRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBPerfHandleRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  FakePerfHandle *handle = [[FakePerfHandle alloc] init];
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@1 value:handle error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(handle, [self.registry get:@1]);
  XCTAssertEqual(handle, [self.registry take:@1]);
  XCTAssertNil([self.registry get:@1]);
  XCTAssertEqual(handle.stopCount, 0);
}

- (void)testPut_occupiedId_returnsCollision {
  FakePerfHandle *first = [[FakePerfHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);

  NSError *error = nil;
  XCTAssertFalse([self.registry put:@1 value:[[FakePerfHandle alloc] init] error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPutOrDiscard_collision_dropsIncomingWithoutStop {
  FakePerfHandle *first = [[FakePerfHandle alloc] init];
  FakePerfHandle *duplicate = [[FakePerfHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  XCTAssertFalse([self.registry putOrDiscard:@1 value:duplicate]);
  XCTAssertEqual(duplicate.stopCount, 0);
  XCTAssertEqual(first.stopCount, 0);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPutOrDiscard_storesWhenFree {
  FakePerfHandle *handle = [[FakePerfHandle alloc] init];
  XCTAssertTrue([self.registry putOrDiscard:@2 value:handle]);
  XCTAssertEqual(handle, [self.registry get:@2]);
  XCTAssertEqual(handle.stopCount, 0);
}

- (void)testPutReplacing_whenOccupied_returnsDisplaced {
  FakePerfHandle *first = [[FakePerfHandle alloc] init];
  FakePerfHandle *second = [[FakePerfHandle alloc] init];
  XCTAssertTrue([self.registry put:@3 value:first error:nil]);
  XCTAssertEqual(first, [self.registry putReplacing:@3 value:second]);
  XCTAssertEqual(second, [self.registry get:@3]);
}

- (void)testPutReplacing_moduleCollisionPattern_stopsDisplacedOutsideLock {
  FakePerfHandle *first = [[FakePerfHandle alloc] init];
  FakePerfHandle *second = [[FakePerfHandle alloc] init];
  XCTAssertTrue([self.registry put:@6 value:first error:nil]);
  FakePerfHandle *displaced = [self.registry putReplacing:@6 value:second];
  if (displaced != nil) {
    [displaced stop];
  }
  XCTAssertEqual(first.stopCount, 1);
  XCTAssertEqual(second.stopCount, 0);
  XCTAssertEqual(second, [self.registry get:@6]);
}

- (void)testTakeAll_returnsSnapshotAndLeavesEmpty {
  FakePerfHandle *a = [[FakePerfHandle alloc] init];
  FakePerfHandle *b = [[FakePerfHandle alloc] init];
  XCTAssertTrue([self.registry put:@4 value:a error:nil]);
  XCTAssertTrue([self.registry put:@5 value:b error:nil]);
  NSArray *remaining = [self.registry takeAll];
  XCTAssertEqual(remaining.count, 2);
  XCTAssertNil([self.registry get:@4]);
  XCTAssertNil([self.registry get:@5]);
  XCTAssertEqual(a.stopCount, 0);
  XCTAssertEqual(b.stopCount, 0);
}

- (void)testGet_whenFree_isNil {
  XCTAssertNil([self.registry get:@99]);
}

@end
