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
 */

#import <XCTest/XCTest.h>

#import "RNFBHandleMapStorage-Swift.inc"

@interface RNFBStorageTaskStatusMapperFacadeTests : XCTestCase
@end

@implementation RNFBStorageTaskStatusMapperFacadeTests

- (void)testObjCSelectorMapsKnownStatuses {
  // FIRStorageTaskStatusResume / Progress → running
  XCTAssertEqualObjects([RNFBStorageTaskStatusMapper stringForTaskStatus:1], @"running");
  XCTAssertEqualObjects([RNFBStorageTaskStatusMapper stringForTaskStatus:2], @"running");
  // FIRStorageTaskStatusPause → paused
  XCTAssertEqualObjects([RNFBStorageTaskStatusMapper stringForTaskStatus:3], @"paused");
  // FIRStorageTaskStatusSuccess → success
  XCTAssertEqualObjects([RNFBStorageTaskStatusMapper stringForTaskStatus:4], @"success");
  // FIRStorageTaskStatusFailure → error
  XCTAssertEqualObjects([RNFBStorageTaskStatusMapper stringForTaskStatus:5], @"error");
}

- (void)testObjCSelectorMapsUnknownToUnknown {
  // FIRStorageTaskStatusUnknown and out-of-range
  XCTAssertEqualObjects([RNFBStorageTaskStatusMapper stringForTaskStatus:0], @"unknown");
  XCTAssertEqualObjects([RNFBStorageTaskStatusMapper stringForTaskStatus:-1], @"unknown");
  XCTAssertEqualObjects([RNFBStorageTaskStatusMapper stringForTaskStatus:99], @"unknown");
}

- (void)testFacadePublicSelectorUnchanged {
  XCTAssertTrue([RNFBStorageTaskStatusMapper respondsToSelector:@selector(stringForTaskStatus:)]);
  NSMethodSignature *signature =
      [RNFBStorageTaskStatusMapper methodSignatureForSelector:@selector(stringForTaskStatus:)];
  XCTAssertEqual(strcmp(signature.methodReturnType, @encode(id)), 0);
}

@end
