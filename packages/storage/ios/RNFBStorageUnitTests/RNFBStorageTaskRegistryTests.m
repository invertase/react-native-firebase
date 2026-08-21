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
#import "RNFBStorageTaskRegistry.h"

@interface FakeStorageHandle : NSObject
@property(nonatomic, assign) NSInteger pauseCount;
@property(nonatomic, assign) NSInteger resumeCount;
@property(nonatomic, assign) NSInteger cancelCount;
- (void)pause;
- (void)resume;
- (void)cancel;
@end

@implementation FakeStorageHandle
- (void)pause {
  self.pauseCount += 1;
}
- (void)resume {
  self.resumeCount += 1;
}
- (void)cancel {
  self.cancelCount += 1;
}
@end

@interface RNFBStorageTaskRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBStorageTaskRegistry *registry;
@end

@implementation RNFBStorageTaskRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBStorageTaskRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  FakeStorageHandle *handle = [[FakeStorageHandle alloc] init];
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@1 value:handle error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(handle, [self.registry get:@1]);
  XCTAssertEqual(handle, [self.registry take:@1]);
  XCTAssertNil([self.registry get:@1]);
  XCTAssertEqual(handle.cancelCount, 0);
}

- (void)testPut_occupiedId_returnsCollision {
  FakeStorageHandle *first = [[FakeStorageHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);

  NSError *error = nil;
  XCTAssertFalse([self.registry put:@1 value:[[FakeStorageHandle alloc] init] error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPut_occupiedId_nilErrorOut_returnsNo {
  FakeStorageHandle *first = [[FakeStorageHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  XCTAssertFalse([self.registry put:@1 value:[[FakeStorageHandle alloc] init] error:nil]);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPutOrDiscard_collision_cancelsIncoming {
  FakeStorageHandle *first = [[FakeStorageHandle alloc] init];
  FakeStorageHandle *duplicate = [[FakeStorageHandle alloc] init];
  XCTAssertTrue([self.registry put:@2 value:first error:nil]);
  XCTAssertFalse([self.registry putOrDiscard:@2 value:duplicate]);
  XCTAssertEqual(duplicate.cancelCount, 1);
  XCTAssertEqual(first.cancelCount, 0);
  XCTAssertEqual(first, [self.registry get:@2]);
}

- (void)testPutOrDiscard_storesWhenFree {
  FakeStorageHandle *handle = [[FakeStorageHandle alloc] init];
  XCTAssertTrue([self.registry putOrDiscard:@3 value:handle]);
  XCTAssertEqual(handle, [self.registry get:@3]);
  XCTAssertEqual(handle.cancelCount, 0);
}

- (void)testTakeAndCancel_cancelsAfterTake {
  FakeStorageHandle *handle = [[FakeStorageHandle alloc] init];
  XCTAssertTrue([self.registry put:@5 value:handle error:nil]);
  XCTAssertTrue([self.registry takeAndCancel:@5]);
  XCTAssertEqual(handle.cancelCount, 1);
  XCTAssertNil([self.registry get:@5]);
}

- (void)testTakeAndCancel_missingKey_returnsNo {
  XCTAssertFalse([self.registry takeAndCancel:@99]);
  XCTAssertNil([self.registry get:@99]);
}

- (void)testTakeAndCancel_objectWithoutCancel_doesNotCrash {
  NSObject *plain = [[NSObject alloc] init];
  XCTAssertTrue([self.registry put:@7 value:plain error:nil]);
  XCTAssertTrue([self.registry takeAndCancel:@7]);
  XCTAssertNil([self.registry get:@7]);
}

- (void)testCancelAll_cancelsSnapshotAndLeavesEmpty {
  FakeStorageHandle *a = [[FakeStorageHandle alloc] init];
  FakeStorageHandle *b = [[FakeStorageHandle alloc] init];
  XCTAssertTrue([self.registry put:@1 value:a error:nil]);
  XCTAssertTrue([self.registry put:@2 value:b error:nil]);
  [self.registry cancelAll];
  XCTAssertEqual(a.cancelCount, 1);
  XCTAssertEqual(b.cancelCount, 1);
  XCTAssertNil([self.registry get:@1]);
  XCTAssertNil([self.registry get:@2]);
}

- (void)testPut_afterTake_allowsReuse {
  FakeStorageHandle *first = [[FakeStorageHandle alloc] init];
  FakeStorageHandle *second = [[FakeStorageHandle alloc] init];
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
