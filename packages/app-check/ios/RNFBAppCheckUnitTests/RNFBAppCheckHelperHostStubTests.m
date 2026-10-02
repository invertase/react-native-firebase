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
#import "RNFBAppCheckHelper.h"

@interface RNFBAppCheckHelperHostStubTests : XCTestCase
@end

@implementation RNFBAppCheckHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRAppCheck resetTestState];
  [RCTConvert resetTestState];
  [RCTConvert setFirAppFromStringHandler:^FIRApp *(NSString *appName) {
    return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
  }];
}

- (void)tearDown {
  [FIRAppCheck resetTestState];
  [RCTConvert resetTestState];
  [super tearDown];
}

- (void)testActivate_configuresDeviceCheckAndResolves {
  __block id resolved = @"unset";
  __block BOOL rejected = NO;

  [RNFBAppCheckHelper activate:@"helper-activate"
      siteKeyProvider:@"ignored"
      isTokenAutoRefreshEnabled:YES
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

  FIRApp *app = [RCTConvert firAppFromString:@"helper-activate"];
  FIRAppCheck *appCheck = [FIRAppCheck appCheckWithApp:app];
  XCTAssertTrue(appCheck.isTokenAutoRefreshEnabled);
}

- (void)testGetToken_nilToken_rejectsTokenNull {
  // activate installs a ready provider (HostStub sets delegateProvider).
  [RNFBAppCheckHelper activate:@"helper-nil-token"
      siteKeyProvider:nil
      isTokenAutoRefreshEnabled:NO
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
      }];

  FIRAppCheck.tokenForcingRefreshHandler =
      ^(BOOL forceRefresh, FIRAppCheckTokenCompletionBlock completion) {
        (void)forceRefresh;
        completion(nil, nil);
      };

  XCTestExpectation *expectation = [self expectationWithDescription:@"getToken nil rejects"];
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;

  [RNFBAppCheckHelper getToken:@"helper-nil-token"
      forceRefresh:NO
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject for nil token");
        [expectation fulfill];
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
        [expectation fulfill];
      }];

  [self waitForExpectationsWithTimeout:1.0 handler:nil];
  XCTAssertEqualObjects(rejectCode, @"token-null");
  XCTAssertEqualObjects(rejectMessage, @"no token fetched");
}

- (void)testGetLimitedUseToken_error_rejectsMappedCode {
  [RNFBAppCheckHelper activate:@"helper-limited-error"
      siteKeyProvider:nil
      isTokenAutoRefreshEnabled:NO
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
      }];

  NSError *fetchError = [NSError errorWithDomain:@"io.invertase.firebase.app-check.test"
                                            code:9
                                        userInfo:@{
                                          NSLocalizedDescriptionKey : @"limited use failed",
                                          @"code" : @"network",
                                        }];
  FIRAppCheck.limitedUseTokenHandler = ^(FIRAppCheckTokenCompletionBlock completion) {
    completion(nil, fetchError);
  };

  XCTestExpectation *expectation =
      [self expectationWithDescription:@"getLimitedUseToken error rejects"];
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;

  [RNFBAppCheckHelper getLimitedUseToken:@"helper-limited-error"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject for error");
        [expectation fulfill];
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
        [expectation fulfill];
      }];

  [self waitForExpectationsWithTimeout:1.0 handler:nil];
  XCTAssertEqualObjects(rejectCode, @"token-error");
  XCTAssertEqualObjects(rejectMessage, @"limited use failed");
}

- (void)testGetLimitedUseToken_nilToken_rejectsTokenNull {
  [RNFBAppCheckHelper activate:@"helper-limited-nil"
      siteKeyProvider:nil
      isTokenAutoRefreshEnabled:NO
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
      }];

  FIRAppCheck.limitedUseTokenHandler = ^(FIRAppCheckTokenCompletionBlock completion) {
    completion(nil, nil);
  };

  XCTestExpectation *expectation =
      [self expectationWithDescription:@"getLimitedUseToken nil rejects"];
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;

  [RNFBAppCheckHelper getLimitedUseToken:@"helper-limited-nil"
      resolve:^(id result) {
        (void)result;
        XCTFail(@"expected reject for nil token");
        [expectation fulfill];
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
        [expectation fulfill];
      }];

  [self waitForExpectationsWithTimeout:1.0 handler:nil];
  XCTAssertEqualObjects(rejectCode, @"token-null");
  XCTAssertEqualObjects(rejectMessage, @"no token fetched");
}

@end
