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

#import "RNFBDatabaseListenerRegistry.h"
#import "RNFBHandleMap.h"

@interface RNFBDatabaseListenerRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBDatabaseListenerRegistry *registry;
@end

@implementation RNFBDatabaseListenerRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBDatabaseListenerRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  NSNumber *handle = @7;
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@"k" value:handle error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(handle, [self.registry get:@"k"]);
  XCTAssertEqual(handle, [self.registry take:@"k"]);
  XCTAssertNil([self.registry get:@"k"]);
  XCTAssertFalse([self.registry hasListeners]);
}

- (void)testPut_occupiedId_returnsCollision {
  XCTAssertTrue([self.registry put:@"k" value:@1 error:nil]);
  NSError *error = nil;
  XCTAssertFalse([self.registry put:@"k" value:@2 error:&error]);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqualObjects([self.registry get:@"k"], @1);
  XCTAssertTrue([self.registry hasListeners]);
}

- (void)testPut_occupiedId_nilErrorOut_returnsNo {
  XCTAssertTrue([self.registry put:@"k" value:@1 error:nil]);
  XCTAssertFalse([self.registry put:@"k" value:@2 error:nil]);
}

- (void)testTake_missingKey_isNoOp {
  XCTAssertNil([self.registry take:@"missing"]);
  XCTAssertFalse([self.registry hasListeners]);
}

- (void)testTakeAll_snapshotAndLeavesEmpty {
  XCTAssertTrue([self.registry put:@"a" value:@1 error:nil]);
  XCTAssertTrue([self.registry put:@"b" value:@2 error:nil]);
  NSArray *remaining = [self.registry takeAll];
  XCTAssertEqual(remaining.count, 2);
  XCTAssertFalse([self.registry hasListeners]);
  XCTAssertNil([self.registry get:@"a"]);
}

- (void)testTakeAll_empty_isNoOp {
  XCTAssertEqual([self.registry takeAll].count, 0);
}

- (void)testHasEventListener {
  XCTAssertFalse([self.registry hasEventListener:@"k"]);
  XCTAssertTrue([self.registry put:@"k" value:@1 error:nil]);
  XCTAssertTrue([self.registry hasEventListener:@"k"]);
}

- (void)testPut_afterTake_allowsReuse {
  XCTAssertTrue([self.registry put:@"k" value:@1 error:nil]);
  XCTAssertEqualObjects([self.registry take:@"k"], @1);
  XCTAssertTrue([self.registry put:@"k" value:@2 error:nil]);
  XCTAssertEqualObjects([self.registry get:@"k"], @2);
}

@end
