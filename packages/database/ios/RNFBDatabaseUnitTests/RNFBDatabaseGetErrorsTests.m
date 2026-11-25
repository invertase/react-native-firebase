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

#import "RNFBDatabaseGetErrors.h"

@interface RNFBDatabaseGetErrorsTests : XCTestCase
@end

@implementation RNFBDatabaseGetErrorsTests

// getData's failures: domain and code are the same for all of them (FRepo getData:).
static NSError *GetDataError(id reason) {
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  if (reason != nil) {
    userInfo[NSLocalizedFailureReasonErrorKey] = reason;
  }
  return [NSError errorWithDomain:@"com.firebase.core" code:1 userInfo:userInfo];
}

- (void)testServerReason_isDenial {
  XCTAssertTrue([RNFBDatabaseGetErrors isPermissionDenied:GetDataError(@"Permission denied")]);
}

- (void)testServerStatus_isDenial {
  XCTAssertTrue([RNFBDatabaseGetErrors isPermissionDenied:GetDataError(@"permission_denied")]);
}

- (void)testOffline_isNotDenial {
  XCTAssertFalse([RNFBDatabaseGetErrors isPermissionDenied:GetDataError(@"Client is offline.")]);
}

- (void)testOtherStatus_isNotDenial {
  XCTAssertFalse([RNFBDatabaseGetErrors isPermissionDenied:GetDataError(@"failed")]);
}

- (void)testMissingOrNonStringReason_isNotDenial {
  XCTAssertFalse([RNFBDatabaseGetErrors isPermissionDenied:GetDataError(nil)]);
  XCTAssertFalse([RNFBDatabaseGetErrors isPermissionDenied:GetDataError(@1)]);
  XCTAssertFalse([RNFBDatabaseGetErrors isPermissionDenied:nil]);
}

@end
