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
#import "RNFBAppDistributionHelper.h"

@interface RNFBAppDistributionHelperHostStubTests : XCTestCase
@end

@implementation RNFBAppDistributionHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRAppDistribution resetTestState];
  [RNFBAppDistributionHelper setForceUnavailableForTests:NO];
}

- (void)tearDown {
  [RNFBAppDistributionHelper setForceUnavailableForTests:NO];
  [FIRAppDistribution resetTestState];
  [super tearDown];
}

- (void)testIsTesterSignedIn_reflectsStubFlag {
  [FIRAppDistribution appDistribution].isTesterSignedIn = YES;

  __block id resolved = @"unset";
  __block BOOL rejected = NO;
  [RNFBAppDistributionHelper
      isTesterSignedIn:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];

  XCTAssertFalse(rejected);
  XCTAssertEqualObjects(resolved, @YES);
}

- (void)testSignInTester_success_resolvesNull {
  __block id resolved = @"unset";
  __block BOOL rejected = NO;

  [RNFBAppDistributionHelper
      signInTester:^(id result) {
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
  XCTAssertTrue([FIRAppDistribution appDistribution].isTesterSignedIn);
}

- (void)testSignInTester_error_rejectsTesterSignInError {
  FIRAppDistribution.signInTesterHandler = ^(FIRAppDistributionSignInTesterCompletion completion) {
    completion([NSError errorWithDomain:@"io.invertase.firebase.app-distribution.test"
                                   code:1
                               userInfo:@{NSLocalizedDescriptionKey : @"sign-in failed"}]);
  };

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBAppDistributionHelper
      signInTester:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"tester-sign-in-error");
  XCTAssertEqualObjects(rejectMessage, @"sign-in failed");
}

- (void)testSignOutTester_clearsFlagAndResolvesNull {
  [FIRAppDistribution appDistribution].isTesterSignedIn = YES;

  __block id resolved = @"unset";
  [RNFBAppDistributionHelper
      signOutTester:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved, [NSNull null]);
  XCTAssertFalse([FIRAppDistribution appDistribution].isTesterSignedIn);
}

- (void)testCheckForUpdate_success_resolvesReleaseDictionary {
  __block id resolved = @"unset";
  __block BOOL rejected = NO;

  [RNFBAppDistributionHelper
      checkForUpdate:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];

  XCTAssertFalse(rejected);
  XCTAssertTrue([resolved isKindOfClass:[NSDictionary class]]);
  NSDictionary *payload = (NSDictionary *)resolved;
  XCTAssertEqualObjects(payload[@"displayVersion"], @"1.0.0");
  XCTAssertEqualObjects(payload[@"buildVersion"], @"1");
  XCTAssertEqualObjects(payload[@"releaseNotes"], @"notes");
  XCTAssertEqualObjects(payload[@"isExpired"], @NO);
  XCTAssertEqualObjects(payload[@"downloadURL"], @"https://example.com/app.ipa");
}

- (void)testCheckForUpdate_nilReleaseNotes_mapsToNSNull {
  FIRAppDistribution.checkForUpdateHandler =
      ^(FIRAppDistributionCheckForUpdateCompletion completion) {
        FIRAppDistributionRelease *release = [[FIRAppDistributionRelease alloc] init];
        release.displayVersion = @"2.0.0";
        release.buildVersion = @"2";
        release.releaseNotes = nil;
        release.isExpired = YES;
        release.downloadURL = [NSURL URLWithString:@"https://example.com/v2.ipa"];
        completion(release, nil);
      };

  __block id resolved = @"unset";
  [RNFBAppDistributionHelper
      checkForUpdate:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  NSDictionary *payload = (NSDictionary *)resolved;
  XCTAssertEqualObjects(payload[@"releaseNotes"], [NSNull null]);
  XCTAssertEqualObjects(payload[@"isExpired"], @YES);
}

- (void)testCheckForUpdate_error_rejectsCheckUpdateError {
  FIRAppDistribution.checkForUpdateHandler =
      ^(FIRAppDistributionCheckForUpdateCompletion completion) {
        completion(nil, [NSError errorWithDomain:@"io.invertase.firebase.app-distribution.test"
                                            code:2
                                        userInfo:@{NSLocalizedDescriptionKey : @"check failed"}]);
      };

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBAppDistributionHelper
      checkForUpdate:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"check-update-error");
  XCTAssertEqualObjects(rejectMessage, @"check failed");
}

- (void)testCheckForUpdate_nilRelease_rejectsCheckupdateNull {
  FIRAppDistribution.checkForUpdateHandler =
      ^(FIRAppDistributionCheckForUpdateCompletion completion) {
        completion(nil, nil);
      };

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBAppDistributionHelper
      checkForUpdate:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"checkupdate-null");
  XCTAssertEqualObjects(rejectMessage, @"no update checked");
}

- (void)testForceUnavailable_isTesterSignedIn_rejectsUnsupported {
  [RNFBAppDistributionHelper setForceUnavailableForTests:YES];

  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBAppDistributionHelper
      isTesterSignedIn:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"unsupported");
  XCTAssertTrue([rejectMessage containsString:@"not available"]);
}

- (void)testForceUnavailable_signInTester_rejectsUnsupported {
  [RNFBAppDistributionHelper setForceUnavailableForTests:YES];

  __block NSString *rejectCode = nil;
  [RNFBAppDistributionHelper
      signInTester:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];

  XCTAssertEqualObjects(rejectCode, @"unsupported");
}

- (void)testForceUnavailable_signOutTester_rejectsUnsupported {
  [RNFBAppDistributionHelper setForceUnavailableForTests:YES];

  __block NSString *rejectCode = nil;
  [RNFBAppDistributionHelper
      signOutTester:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];

  XCTAssertEqualObjects(rejectCode, @"unsupported");
}

- (void)testForceUnavailable_checkForUpdate_rejectsUnsupported {
  [RNFBAppDistributionHelper setForceUnavailableForTests:YES];

  __block NSString *rejectCode = nil;
  [RNFBAppDistributionHelper
      checkForUpdate:^(id result) {
        (void)result;
        XCTFail(@"expected reject");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];

  XCTAssertEqualObjects(rejectCode, @"unsupported");
}

- (void)testRejectUnavailable_rejectsUnsupportedPayload {
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  [RNFBAppDistributionHelper
      rejectUnavailable:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectCode, @"unsupported");
  XCTAssertTrue([rejectMessage containsString:@"App Distribution"]);
}

@end
