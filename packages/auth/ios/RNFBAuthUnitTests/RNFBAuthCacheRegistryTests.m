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

#import "RNFBAuthCacheRegistry.h"
#import "RNFBHandleMap.h"

@interface RNFBAuthCacheRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBAuthCacheRegistry *registry;
@end

@implementation RNFBAuthCacheRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBAuthCacheRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@"k1" value:@"payload" error:&error]);
  XCTAssertNil(error);
  XCTAssertEqualObjects(@"payload", [self.registry get:@"k1"]);
  XCTAssertEqualObjects(@"payload", [self.registry take:@"k1"]);
  XCTAssertNil([self.registry get:@"k1"]);
}

- (void)testPut_occupiedId_returnsCollision {
  XCTAssertTrue([self.registry put:@"k1" value:@"first" error:nil]);

  NSError *error = nil;
  XCTAssertFalse([self.registry put:@"k1" value:@"second" error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqualObjects(@"first", [self.registry get:@"k1"]);
}

- (void)testPut_occupiedId_nilErrorOut_returnsNo {
  XCTAssertTrue([self.registry put:@"k1" value:@"first" error:nil]);
  XCTAssertFalse([self.registry put:@"k1" value:@"second" error:nil]);
  XCTAssertEqualObjects(@"first", [self.registry get:@"k1"]);
}

- (void)testGet_whenFree_isNil {
  XCTAssertNil([self.registry get:@"missing"]);
}

- (void)testTake_whenFree_isNil {
  XCTAssertNil([self.registry take:@"missing"]);
}

- (void)testPutOrDiscard_storesWhenFree {
  XCTAssertTrue([self.registry putOrDiscard:@"k1" value:@"payload"]);
  XCTAssertEqualObjects(@"payload", [self.registry get:@"k1"]);
}

- (void)testPutOrDiscard_collision_keepsExisting {
  XCTAssertTrue([self.registry put:@"k1" value:@"first" error:nil]);
  XCTAssertFalse([self.registry putOrDiscard:@"k1" value:@"second"]);
  XCTAssertEqualObjects(@"first", [self.registry get:@"k1"]);
}

- (void)testPutReplacing_whenFree_stores {
  XCTAssertTrue([self.registry putReplacing:@"k1" value:@"payload"]);
  XCTAssertEqualObjects(@"payload", [self.registry get:@"k1"]);
}

- (void)testPutReplacing_whenOccupied_replacesLastWins {
  XCTAssertTrue([self.registry put:@"k1" value:@"first" error:nil]);
  XCTAssertTrue([self.registry putReplacing:@"k1" value:@"second"]);
  XCTAssertEqualObjects(@"second", [self.registry get:@"k1"]);
}

- (void)testPutReplacing_sameIdFromTwoThreads_lastWins {
  XCTAssertTrue([self.registry put:@"k1" value:@"first" error:nil]);

  dispatch_group_t group = dispatch_group_create();
  dispatch_group_enter(group);
  dispatch_group_enter(group);

  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    [self.registry putReplacing:@"k1" value:@"second"];
    dispatch_group_leave(group);
  });
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    [self.registry putReplacing:@"k1" value:@"third"];
    dispatch_group_leave(group);
  });

  dispatch_group_wait(group, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC));
  id stored = [self.registry get:@"k1"];
  XCTAssertTrue([stored isEqual:@"second"] || [stored isEqual:@"third"]);
}

- (void)testPut_afterTake_allowsReuse {
  XCTAssertTrue([self.registry put:@"k1" value:@"first" error:nil]);
  XCTAssertEqualObjects(@"first", [self.registry take:@"k1"]);
  XCTAssertTrue([self.registry put:@"k1" value:@"second" error:nil]);
  XCTAssertEqualObjects(@"second", [self.registry get:@"k1"]);
}

- (void)testClear_removesAll {
  XCTAssertTrue([self.registry put:@"a" value:@"1" error:nil]);
  XCTAssertTrue([self.registry put:@"b" value:@"2" error:nil]);
  [self.registry clear];
  XCTAssertNil([self.registry get:@"a"]);
  XCTAssertNil([self.registry get:@"b"]);
}

- (void)testClear_empty_isNoOp {
  [self.registry clear];
  XCTAssertNil([self.registry get:@"k1"]);
}

@end
