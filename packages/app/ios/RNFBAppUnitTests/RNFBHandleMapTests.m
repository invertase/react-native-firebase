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

/**
 * XCTest coverage for RNFBHandleMap. Tests must not invoke methods on stored values — the map only
 * moves pointers.
 */
@interface RNFBHandleMapTests : XCTestCase
@property(nonatomic, strong) RNFBHandleMap *map;
@end

@implementation RNFBHandleMapTests

- (void)setUp {
  [super setUp];
  self.map = [[RNFBHandleMap alloc] init];
}

- (void)testPutGetTake_happyPath {
  NSObject *handle = [[NSObject alloc] init];
  NSError *error = nil;
  XCTAssertTrue([self.map put:@1 value:handle error:&error]);
  XCTAssertNil(error);

  XCTAssertEqual(handle, [self.map get:@1]);
  XCTAssertEqual(handle, [self.map take:@1]);
  XCTAssertNil([self.map get:@1]);
}

- (void)testTake_missingKey_returnsNil {
  XCTAssertNil([self.map take:@99]);
  XCTAssertNil([self.map get:@99]);
}

- (void)testTakeAll_returnsSnapshotAndLeavesMapEmpty {
  NSObject *a = [[NSObject alloc] init];
  NSObject *b = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:a error:nil]);
  XCTAssertTrue([self.map put:@2 value:b error:nil]);

  NSArray *snapshot = [self.map takeAll];

  XCTAssertEqual(snapshot.count, 2u);
  XCTAssertTrue([snapshot containsObject:a]);
  XCTAssertTrue([snapshot containsObject:b]);
  XCTAssertNil([self.map get:@1]);
  XCTAssertNil([self.map get:@2]);
  XCTAssertEqual([self.map takeAll].count, 0u);
}

- (void)testPut_occupiedId_returnsCollision {
  NSObject *first = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:first error:nil]);

  NSError *error = nil;
  XCTAssertFalse([self.map put:@1 value:[[NSObject alloc] init] error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertTrue([error.localizedDescription containsString:@"1"]);
  XCTAssertEqual(first, [self.map get:@1]);

  XCTAssertFalse([self.map put:@1 value:[[NSObject alloc] init] error:nil]);
  XCTAssertEqual(first, [self.map get:@1]);
}

- (void)testPutIfAbsent_whenFree_storesAndReturnsYes {
  NSObject *handle = [[NSObject alloc] init];
  XCTAssertTrue([self.map putIfAbsent:@1 value:handle]);
  XCTAssertEqual(handle, [self.map get:@1]);
}

- (void)testPutIfAbsent_whenOccupied_keepsExistingAndReturnsNo {
  NSObject *first = [[NSObject alloc] init];
  NSObject *second = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:first error:nil]);
  XCTAssertFalse([self.map putIfAbsent:@1 value:second]);
  XCTAssertEqual(first, [self.map get:@1]);
}

- (void)testPutIfAbsentOrSame_whenAbsent_storesAndReturnsYes {
  NSObject *handle = [[NSObject alloc] init];
  XCTAssertTrue([self.map putIfAbsentOrSame:@1 value:handle]);
  XCTAssertEqual(handle, [self.map get:@1]);
}

- (void)testPutIfAbsentOrSame_whenSameInstance_returnsYes {
  NSObject *handle = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:handle error:nil]);
  XCTAssertTrue([self.map putIfAbsentOrSame:@1 value:handle]);
  XCTAssertEqual(handle, [self.map get:@1]);
}

- (void)testPutIfAbsentOrSame_whenDifferent_returnsNo {
  NSObject *first = [[NSObject alloc] init];
  NSObject *second = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:first error:nil]);
  XCTAssertFalse([self.map putIfAbsentOrSame:@1 value:second]);
  XCTAssertEqual(first, [self.map get:@1]);
}

- (void)testPutReplacing_whenFree_storesAndReturnsNil {
  NSObject *handle = [[NSObject alloc] init];
  XCTAssertNil([self.map putReplacing:@1 value:handle]);
  XCTAssertEqual(handle, [self.map get:@1]);
}

- (void)testPutReplacing_whenOccupied_replacesLastWins {
  NSObject *first = [[NSObject alloc] init];
  NSObject *second = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:first error:nil]);
  XCTAssertEqual(first, [self.map putReplacing:@1 value:second]);
  XCTAssertEqual(second, [self.map get:@1]);
}

- (void)testPut_afterTake_allowsReuse {
  NSObject *first = [[NSObject alloc] init];
  NSObject *second = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:first error:nil]);
  XCTAssertEqual(first, [self.map take:@1]);
  XCTAssertTrue([self.map put:@1 value:second error:nil]);
  XCTAssertEqual(second, [self.map get:@1]);
}

- (void)testTake_sameIdFromTwoThreads_onlyOneReturnsNonNull {
  NSObject *handle = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:handle error:nil]);

  dispatch_semaphore_t start = dispatch_semaphore_create(0);
  dispatch_semaphore_t done = dispatch_semaphore_create(0);
  __block id first = [NSNull null];
  __block id second = [NSNull null];

  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    dispatch_semaphore_wait(start, DISPATCH_TIME_FOREVER);
    first = [self.map take:@1];
    dispatch_semaphore_signal(done);
  });
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    dispatch_semaphore_wait(start, DISPATCH_TIME_FOREVER);
    second = [self.map take:@1];
    dispatch_semaphore_signal(done);
  });

  dispatch_semaphore_signal(start);
  dispatch_semaphore_signal(start);
  XCTAssertEqual(dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  XCTAssertEqual(dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);

  BOOL onlyFirst = first == handle && second == nil;
  BOOL onlySecond = second == handle && first == nil;
  XCTAssertTrue(onlyFirst || onlySecond);
  XCTAssertNil([self.map get:@1]);
}

- (void)testPutReplacing_sameIdFromTwoThreads_lastWins {
  NSObject *first = [[NSObject alloc] init];
  NSObject *second = [[NSObject alloc] init];
  NSObject *third = [[NSObject alloc] init];
  XCTAssertTrue([self.map put:@1 value:first error:nil]);

  dispatch_semaphore_t start = dispatch_semaphore_create(0);
  dispatch_semaphore_t done = dispatch_semaphore_create(0);
  __block id prevA = [NSNull null];
  __block id prevB = [NSNull null];

  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    dispatch_semaphore_wait(start, DISPATCH_TIME_FOREVER);
    prevA = [self.map putReplacing:@1 value:second];
    dispatch_semaphore_signal(done);
  });
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    dispatch_semaphore_wait(start, DISPATCH_TIME_FOREVER);
    prevB = [self.map putReplacing:@1 value:third];
    dispatch_semaphore_signal(done);
  });

  dispatch_semaphore_signal(start);
  dispatch_semaphore_signal(start);
  XCTAssertEqual(dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  XCTAssertEqual(dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);

  id winner = [self.map get:@1];
  XCTAssertTrue(winner == second || winner == third);
  id returnedFirst = prevA == first ? prevA : prevB;
  XCTAssertEqual(first, returnedFirst);
}

@end
