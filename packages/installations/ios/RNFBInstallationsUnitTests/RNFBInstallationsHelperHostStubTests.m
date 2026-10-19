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

#import <Firebase/Firebase.h>
#import "RNFBApp/RCTConvert+FIRApp.h"
#import "RNFBInstallationsHelper.h"

@interface RNFBInstallationsHelperHostStubTests : XCTestCase
@end

@implementation RNFBInstallationsHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRInstallations resetTestState];
  [RCTConvert resetTestState];
  [RCTConvert setFirAppFromStringHandler:^FIRApp *(NSString *appName) {
    return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
  }];
}

- (void)tearDown {
  [FIRInstallations resetTestState];
  [RCTConvert resetTestState];
  [super tearDown];
}

- (void)testDeleteInstallations_success_resolvesNull {
  __block id resolved = @"unset";
  __block BOOL rejected = NO;

  [RNFBInstallationsHelper deleteInstallations:@"helper-delete-ok"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];

  XCTAssertFalse(rejected);
  XCTAssertEqualObjects(resolved, [NSNull null]);
}

- (void)testDeleteInstallations_error_rejectsDeleteError {
  FIRInstallations.deleteHandler = ^(FIRInstallationsDeleteCompletion completion) {
    completion([NSError errorWithDomain:@"io.invertase.firebase.installations.test"
                                   code:1
                               userInfo:@{NSLocalizedDescriptionKey : @"delete failed"}]);
  };

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBInstallationsHelper deleteInstallations:@"helper-delete-err"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"delete-error");
  XCTAssertEqualObjects(rejectMessage, @"delete failed");
}

- (void)testGetId_success_resolvesId {
  FIRInstallations.installationIDHandler = ^(FIRInstallationsIDHandler completion) {
    completion(@"installation-123", nil);
  };

  __block id resolved = @"unset";
  __block BOOL rejected = NO;
  [RNFBInstallationsHelper getId:@"helper-id-ok"
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];

  XCTAssertFalse(rejected);
  XCTAssertEqualObjects(resolved, @"installation-123");
}

- (void)testGetId_error_rejectsIdError {
  FIRInstallations.installationIDHandler = ^(FIRInstallationsIDHandler completion) {
    completion(nil, [NSError errorWithDomain:@"io.invertase.firebase.installations.test"
                                        code:2
                                    userInfo:@{NSLocalizedDescriptionKey : @"id failed"}]);
  };

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBInstallationsHelper getId:@"helper-id-err"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"id-error");
  XCTAssertEqualObjects(rejectMessage, @"id failed");
}

- (void)testGetId_nilId_rejectsIdNull {
  FIRInstallations.installationIDHandler = ^(FIRInstallationsIDHandler completion) {
    completion(nil, nil);
  };

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBInstallationsHelper getId:@"helper-id-nil"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"id-null");
  XCTAssertEqualObjects(rejectMessage, @"no id fetched");
}

- (void)testGetToken_success_resolvesAuthToken {
  __block BOOL sawForceRefresh = NO;
  FIRInstallations.authTokenHandler = ^(BOOL forceRefresh,
                                        FIRInstallationsTokenHandler completion) {
    sawForceRefresh = forceRefresh;
    completion([[FIRInstallationsAuthTokenResult alloc] initWithAuthToken:@"auth-token-xyz"], nil);
  };

  __block id resolved = @"unset";
  __block BOOL rejected = NO;
  [RNFBInstallationsHelper getToken:@"helper-token-ok"
      forceRefresh:YES
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];

  XCTAssertFalse(rejected);
  XCTAssertTrue(sawForceRefresh);
  XCTAssertEqualObjects(resolved, @"auth-token-xyz");
}

- (void)testGetToken_error_rejectsTokenError {
  FIRInstallations.authTokenHandler =
      ^(BOOL forceRefresh, FIRInstallationsTokenHandler completion) {
        (void)forceRefresh;
        completion(nil, [NSError errorWithDomain:@"io.invertase.firebase.installations.test"
                                            code:3
                                        userInfo:@{NSLocalizedDescriptionKey : @"token failed"}]);
      };

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBInstallationsHelper getToken:@"helper-token-err"
      forceRefresh:NO
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"token-error");
  XCTAssertEqualObjects(rejectMessage, @"token failed");
}

- (void)testGetToken_nilToken_rejectsTokenNull {
  FIRInstallations.authTokenHandler =
      ^(BOOL forceRefresh, FIRInstallationsTokenHandler completion) {
        (void)forceRefresh;
        completion(nil, nil);
      };

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBInstallationsHelper getToken:@"helper-token-nil"
      forceRefresh:NO
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"token-null");
  XCTAssertEqualObjects(rejectMessage, @"no token fetched");
}

@end
