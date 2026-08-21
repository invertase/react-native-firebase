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

@interface GatedFakeDatabaseQuery : NSObject
@property(nonatomic, assign) BOOL listeners;
@property(nonatomic, strong) dispatch_semaphore_t hasListenersEntered;
@property(nonatomic, strong) dispatch_semaphore_t allowHasListenersReturn;
- (void)removeAllEventListeners;
- (BOOL)hasListeners;
@end

@implementation GatedFakeDatabaseQuery
- (instancetype)init {
  self = [super init];
  if (self) {
    _hasListenersEntered = dispatch_semaphore_create(0);
    _allowHasListenersReturn = dispatch_semaphore_create(0);
  }
  return self;
}
- (void)removeAllEventListeners {
  self.listeners = NO;
}
- (BOOL)hasListeners {
  dispatch_semaphore_signal(self.hasListenersEntered);
  XCTAssertEqual(dispatch_semaphore_wait(self.allowHasListenersReturn,
                                         dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  return self.listeners;
}
@end

@interface PutBackGatedDatabaseQuery : NSObject
@property(nonatomic, assign) BOOL listeners;
@property(nonatomic, assign) NSInteger callCount;
@property(nonatomic, assign) NSInteger removeCount;
@property(nonatomic, strong) dispatch_semaphore_t firstEntered;
@property(nonatomic, strong) dispatch_semaphore_t allowFirstReturn;
@property(nonatomic, strong) dispatch_semaphore_t secondEntered;
@property(nonatomic, strong) dispatch_semaphore_t allowSecondReturn;
- (void)removeAllEventListeners;
- (BOOL)hasListeners;
@end

@implementation PutBackGatedDatabaseQuery
- (instancetype)init {
  self = [super init];
  if (self) {
    _firstEntered = dispatch_semaphore_create(0);
    _allowFirstReturn = dispatch_semaphore_create(0);
    _secondEntered = dispatch_semaphore_create(0);
    _allowSecondReturn = dispatch_semaphore_create(0);
  }
  return self;
}
- (void)removeAllEventListeners {
  self.removeCount += 1;
  self.listeners = NO;
}
- (BOOL)hasListeners {
  self.callCount += 1;
  if (self.callCount == 1) {
    dispatch_semaphore_signal(self.firstEntered);
    XCTAssertEqual(dispatch_semaphore_wait(self.allowFirstReturn,
                                           dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                   0);
    return NO;
  }
  dispatch_semaphore_signal(self.secondEntered);
  XCTAssertEqual(dispatch_semaphore_wait(self.allowSecondReturn,
                                         dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  return self.listeners;
}
@end

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

- (void)testTakeIfIdle_concurrentOffOnRace_retainsMappingWhenListenersAddedDuringCheck {
  GatedFakeDatabaseQuery *query = [[GatedFakeDatabaseQuery alloc] init];
  query.listeners = NO;
  RNFBDatabaseQueryRegistry *registry = [[RNFBDatabaseQueryRegistry alloc] init];
  XCTAssertTrue([registry put:@"q" value:query error:nil]);

  dispatch_semaphore_t offDone = dispatch_semaphore_create(0);
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    [registry takeIfIdle:@"q"];
    dispatch_semaphore_signal(offDone);
  });

  XCTAssertEqual(dispatch_semaphore_wait(query.hasListenersEntered,
                                         dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  query.listeners = YES;
  dispatch_semaphore_signal(query.allowHasListenersReturn);
  XCTAssertEqual(
      dispatch_semaphore_wait(offDone, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)), 0);

  XCTAssertEqual(query, [registry get:@"q"]);
}

- (void)testTakeIfIdle_doesNotHoldMapLockDuringHasListeners {
  GatedFakeDatabaseQuery *query = [[GatedFakeDatabaseQuery alloc] init];
  query.listeners = NO;
  RNFBDatabaseQueryRegistry *registry = [[RNFBDatabaseQueryRegistry alloc] init];
  XCTAssertTrue([registry put:@"q" value:query error:nil]);

  dispatch_semaphore_t putDone = dispatch_semaphore_create(0);
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    [registry takeIfIdle:@"q"];
  });

  XCTAssertEqual(dispatch_semaphore_wait(query.hasListenersEntered,
                                         dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);

  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    FakeDatabaseQuery *other = [[FakeDatabaseQuery alloc] init];
    XCTAssertTrue([registry put:@"other" value:other error:nil]);
    dispatch_semaphore_signal(putDone);
  });

  XCTAssertEqual(
      dispatch_semaphore_wait(putDone, dispatch_time(DISPATCH_TIME_NOW, 2 * NSEC_PER_SEC)), 0);

  // Keep the mapping after unlock; this test only asserts lock nesting.
  query.listeners = YES;
  dispatch_semaphore_signal(query.allowHasListenersReturn);
  XCTAssertEqual(query, [registry get:@"q"]);
  XCTAssertNotNil([registry get:@"other"]);
}

- (void)testTakeIfIdle_putBackWhenListenersAppearAfterOutsideIdleCheck {
  PutBackGatedDatabaseQuery *query = [[PutBackGatedDatabaseQuery alloc] init];
  query.listeners = NO;
  RNFBDatabaseQueryRegistry *registry = [[RNFBDatabaseQueryRegistry alloc] init];
  XCTAssertTrue([registry put:@"q" value:query error:nil]);

  dispatch_semaphore_t takeDone = dispatch_semaphore_create(0);
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    [registry takeIfIdle:@"q"];
    dispatch_semaphore_signal(takeDone);
  });

  XCTAssertEqual(dispatch_semaphore_wait(query.firstEntered,
                                         dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  dispatch_semaphore_signal(query.allowFirstReturn);
  XCTAssertEqual(dispatch_semaphore_wait(query.secondEntered,
                                         dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  query.listeners = YES;
  dispatch_semaphore_signal(query.allowSecondReturn);
  XCTAssertEqual(
      dispatch_semaphore_wait(takeDone, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)), 0);

  XCTAssertEqual(query, [registry get:@"q"]);
  XCTAssertEqual(query.callCount, 2);
}

/**
 * After identity-take, listeners appear but a concurrent put claimed the slot — put-back fails;
 * orphan must clear listeners so SDK callbacks are not left outside the registry.
 */
- (void)testTakeIfIdle_putBackFails_clearsOrphanListeners {
  PutBackGatedDatabaseQuery *orphan = [[PutBackGatedDatabaseQuery alloc] init];
  orphan.listeners = NO;
  RNFBDatabaseQueryRegistry *registry = [[RNFBDatabaseQueryRegistry alloc] init];
  XCTAssertTrue([registry put:@"q" value:orphan error:nil]);

  FakeDatabaseQuery *replacement = [[FakeDatabaseQuery alloc] init];
  replacement.listeners = YES;

  dispatch_semaphore_t takeDone = dispatch_semaphore_create(0);
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    [registry takeIfIdle:@"q"];
    dispatch_semaphore_signal(takeDone);
  });

  XCTAssertEqual(dispatch_semaphore_wait(orphan.firstEntered,
                                         dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  dispatch_semaphore_signal(orphan.allowFirstReturn);
  XCTAssertEqual(dispatch_semaphore_wait(orphan.secondEntered,
                                         dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  XCTAssertTrue([registry put:@"q" value:replacement error:nil]);
  orphan.listeners = YES;
  dispatch_semaphore_signal(orphan.allowSecondReturn);
  XCTAssertEqual(
      dispatch_semaphore_wait(takeDone, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)), 0);

  XCTAssertEqual(replacement, [registry get:@"q"]);
  XCTAssertEqual(orphan.removeCount, 1);
  XCTAssertFalse(orphan.listeners);
  XCTAssertEqual(replacement.removeCount, 0);
}

- (void)testTakeIfIdle_concurrentOffOnRace_stressRetainsWhenListenersAlreadyActive {
  for (NSInteger attempt = 0; attempt < 200; attempt++) {
    RNFBDatabaseQueryRegistry *registry = [[RNFBDatabaseQueryRegistry alloc] init];
    FakeDatabaseQuery *query = [[FakeDatabaseQuery alloc] init];
    query.listeners = YES;
    XCTAssertTrue([registry put:@"q" value:query error:nil]);

    dispatch_semaphore_t start = dispatch_semaphore_create(0);
    dispatch_semaphore_t done = dispatch_semaphore_create(0);

    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
      dispatch_semaphore_wait(start, DISPATCH_TIME_FOREVER);
      [registry takeIfIdle:@"q"];
      dispatch_semaphore_signal(done);
    });
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
      dispatch_semaphore_wait(start, DISPATCH_TIME_FOREVER);
      query.listeners = YES;
      dispatch_semaphore_signal(done);
    });

    dispatch_semaphore_signal(start);
    dispatch_semaphore_signal(start);
    XCTAssertEqual(
        dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)), 0);
    XCTAssertEqual(
        dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)), 0);
    XCTAssertEqual(query, [registry get:@"q"]);
  }
}

- (void)testTakeIfIdle_concurrentTakeIfIdle_onIdleQuery_leavesMapEmpty {
  FakeDatabaseQuery *query = [[FakeDatabaseQuery alloc] init];
  query.listeners = NO;
  XCTAssertTrue([self.registry put:@"q" value:query error:nil]);

  dispatch_semaphore_t start = dispatch_semaphore_create(0);
  dispatch_semaphore_t done = dispatch_semaphore_create(0);

  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    dispatch_semaphore_wait(start, DISPATCH_TIME_FOREVER);
    [self.registry takeIfIdle:@"q"];
    dispatch_semaphore_signal(done);
  });
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    dispatch_semaphore_wait(start, DISPATCH_TIME_FOREVER);
    [self.registry takeIfIdle:@"q"];
    dispatch_semaphore_signal(done);
  });

  dispatch_semaphore_signal(start);
  dispatch_semaphore_signal(start);
  XCTAssertEqual(dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);
  XCTAssertEqual(dispatch_semaphore_wait(done, dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC)),
                 0);

  XCTAssertNil([self.registry get:@"q"]);
  XCTAssertEqual(query.removeCount, 0);
}

@end
