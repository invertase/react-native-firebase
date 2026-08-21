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

#import "RNFBFirestoreTransactionRegistry.h"
#import "RNFBHandleMap.h"

@interface RNFBFirestoreTransactionRegistryTests : XCTestCase
@property(nonatomic, strong) RNFBFirestoreTransactionRegistry *registry;
@end

@implementation RNFBFirestoreTransactionRegistryTests

- (void)setUp {
  [super setUp];
  self.registry = [[RNFBFirestoreTransactionRegistry alloc] init];
}

- (void)testPutGetTake_happyPath {
  NSMutableDictionary *state = [NSMutableDictionary dictionary];
  NSError *error = nil;
  XCTAssertTrue([self.registry put:@1 value:state error:&error]);
  XCTAssertNil(error);
  XCTAssertEqual(state, [self.registry get:@1]);
  XCTAssertEqual(state, [self.registry take:@1]);
  XCTAssertNil([self.registry get:@1]);
  XCTAssertNil(state[@"aborted"]);
}

- (void)testPut_occupiedId_returnsCollision {
  NSMutableDictionary *first = [NSMutableDictionary dictionary];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  NSError *error = nil;
  XCTAssertFalse([self.registry put:@1 value:[NSMutableDictionary dictionary] error:&error]);
  XCTAssertNotNil(error);
  XCTAssertEqualObjects(error.domain, RNFBHandleMapErrorDomain);
  XCTAssertEqual(error.code, RNFBHandleMapErrorCollision);
  XCTAssertEqual(first, [self.registry get:@1]);
}

- (void)testPutOrSkip_uniqueId_putsValue {
  NSMutableDictionary *state = [NSMutableDictionary dictionary];
  XCTAssertTrue([self.registry putOrSkip:@1 value:state]);
  XCTAssertEqual(state, [self.registry get:@1]);
  XCTAssertNil(state[@"aborted"]);
}

- (void)testPutOrSkip_retryGet_sameValue_shortCircuits {
  NSMutableDictionary *state = [NSMutableDictionary dictionary];
  XCTAssertTrue([self.registry put:@1 value:state error:nil]);
  XCTAssertTrue([self.registry putOrSkip:@1 value:state]);
  XCTAssertEqual(state, [self.registry get:@1]);
  XCTAssertNil(state[@"aborted"]);
}

- (void)testPutOrSkip_occupiedId_skipsAndLeavesExisting {
  NSMutableDictionary *first = [NSMutableDictionary dictionary];
  NSMutableDictionary *duplicate = [NSMutableDictionary dictionary];
  XCTAssertTrue([self.registry put:@2 value:first error:nil]);
  XCTAssertFalse([self.registry putOrSkip:@2 value:duplicate]);
  XCTAssertEqual(first, [self.registry get:@2]);
  XCTAssertNil(first[@"aborted"]);
  XCTAssertNil(duplicate[@"aborted"]);
}

- (void)testAbortAll_signalsSemaphoreAndSetsAborted {
  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
  NSMutableDictionary *state = [NSMutableDictionary dictionary];
  state[@"semaphore"] = semaphore;
  XCTAssertTrue([self.registry put:@7 value:state error:nil]);

  [self.registry abortAll];

  XCTAssertEqual([state[@"aborted"] boolValue], YES);
  XCTAssertEqual(dispatch_semaphore_wait(semaphore, DISPATCH_TIME_NOW), 0);
  XCTAssertNil([self.registry get:@7]);
}

- (void)testAbortAll_dictionaryWithoutSemaphore_setsAborted {
  NSMutableDictionary *state = [NSMutableDictionary dictionary];
  XCTAssertTrue([self.registry put:@8 value:state error:nil]);
  [self.registry abortAll];
  XCTAssertEqual([state[@"aborted"] boolValue], YES);
  XCTAssertNil([self.registry get:@8]);
}

- (void)testAbortAll_nonDictionary_doesNotCrash {
  NSObject *plain = [[NSObject alloc] init];
  XCTAssertTrue([self.registry put:@9 value:plain error:nil]);
  [self.registry abortAll];
  XCTAssertNil([self.registry get:@9]);
}

- (void)testAbortAll_empty_isNoOp {
  [self.registry abortAll];
  XCTAssertNil([self.registry get:@1]);
}

- (void)testPut_afterTake_allowsReuse {
  NSMutableDictionary *first = [NSMutableDictionary dictionary];
  NSMutableDictionary *second = [NSMutableDictionary dictionary];
  XCTAssertTrue([self.registry put:@1 value:first error:nil]);
  XCTAssertEqual(first, [self.registry take:@1]);
  XCTAssertTrue([self.registry put:@1 value:second error:nil]);
  XCTAssertEqual(second, [self.registry get:@1]);
}

@end
