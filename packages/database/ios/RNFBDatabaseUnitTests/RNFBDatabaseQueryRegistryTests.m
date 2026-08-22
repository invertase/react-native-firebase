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

#import "RNFBDatabaseQueryRegistry.h"
#import "RNFBHandleMap.h"

@interface FakeDatabaseQuery : NSObject
@property(nonatomic, assign) NSInteger removeCount;
@property(nonatomic, assign) BOOL listeners;
- (void)removeAllEventListeners;
- (BOOL)hasListeners;
@end

@implementation FakeDatabaseQuery
- (void)removeAllEventListeners {
  self.removeCount += 1;
  self.listeners = NO;
}
- (BOOL)hasListeners {
  return self.listeners;
}
@end

@interface RNFBDatabaseQueryRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBDatabaseQueryRegistry *registry;
@end

@implementation RNFBDatabaseQueryRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBDatabaseQueryRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  FakeDatabaseQuery *query = [[FakeDatabaseQuery alloc] init];
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@"q1" value:query error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(query, [self.registry get:@"q1"]);
  XCTAssertEqual(query, [self.registry take:@"q1"]);
  XCTAssertNil([self.registry get:@"q1"]);
  XCTAssertEqual(query.removeCount, 0);
}

- (void)testPut_occupiedId_returnsCollision {
  FakeDatabaseQuery *first = [[FakeDatabaseQuery alloc] init];
  XCTAssertTrue([self.registry put:@"q1" value:first error:nil]);
  NSError *error = nil;
  XCTAssertFalse([self.registry put:@"q1" value:[[FakeDatabaseQuery alloc] init] error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqual(first, [self.registry get:@"q1"]);
}

- (void)testPut_occupiedId_nilErrorOut_returnsNo {
  FakeDatabaseQuery *first = [[FakeDatabaseQuery alloc] init];
  XCTAssertTrue([self.registry put:@"q1" value:first error:nil]);
  XCTAssertFalse([self.registry put:@"q1" value:[[FakeDatabaseQuery alloc] init] error:nil]);
  XCTAssertEqual(first, [self.registry get:@"q1"]);
}

- (void)testRemoveAll_removesSnapshotAndLeavesEmpty {
  FakeDatabaseQuery *a = [[FakeDatabaseQuery alloc] init];
  FakeDatabaseQuery *b = [[FakeDatabaseQuery alloc] init];
  XCTAssertTrue([self.registry put:@"a" value:a error:nil]);
  XCTAssertTrue([self.registry put:@"b" value:b error:nil]);
  [self.registry removeAll];
  XCTAssertEqual(a.removeCount, 1);
  XCTAssertEqual(b.removeCount, 1);
  XCTAssertNil([self.registry get:@"a"]);
  XCTAssertNil([self.registry get:@"b"]);
}

- (void)testRemoveAll_objectWithoutRemove_doesNotCrash {
  NSObject *plain = [[NSObject alloc] init];
  XCTAssertTrue([self.registry put:@"p" value:plain error:nil]);
  [self.registry removeAll];
  XCTAssertNil([self.registry get:@"p"]);
}

- (void)testPut_afterTake_allowsReuse {
  FakeDatabaseQuery *first = [[FakeDatabaseQuery alloc] init];
  FakeDatabaseQuery *second = [[FakeDatabaseQuery alloc] init];
  XCTAssertTrue([self.registry put:@"q1" value:first error:nil]);
  XCTAssertEqual(first, [self.registry take:@"q1"]);
  XCTAssertTrue([self.registry put:@"q1" value:second error:nil]);
  XCTAssertEqual(second, [self.registry get:@"q1"]);
}

- (void)testTakeIfIdle_whenNoListeners_takes {
  FakeDatabaseQuery *query = [[FakeDatabaseQuery alloc] init];
  query.listeners = NO;
  XCTAssertTrue([self.registry put:@"q" value:query error:nil]);
  XCTAssertEqual(query, [self.registry takeIfIdle:@"q"]);
  XCTAssertNil([self.registry get:@"q"]);
  XCTAssertEqual(query.removeCount, 0);
}

- (void)testTakeIfIdle_whenHasListeners_leavesMapping {
  FakeDatabaseQuery *query = [[FakeDatabaseQuery alloc] init];
  query.listeners = YES;
  XCTAssertTrue([self.registry put:@"q" value:query error:nil]);
  XCTAssertNil([self.registry takeIfIdle:@"q"]);
  XCTAssertEqual(query, [self.registry get:@"q"]);
}

- (void)testTakeIfIdle_whenMissing_isNoOp {
  XCTAssertNil([self.registry takeIfIdle:@"missing"]);
}

- (void)testTakeIfIdle_objectWithoutHasListeners_leavesMapping {
  NSObject *plain = [[NSObject alloc] init];
  XCTAssertTrue([self.registry put:@"p" value:plain error:nil]);
  XCTAssertNil([self.registry takeIfIdle:@"p"]);
  XCTAssertEqual(plain, [self.registry get:@"p"]);
}

@end
