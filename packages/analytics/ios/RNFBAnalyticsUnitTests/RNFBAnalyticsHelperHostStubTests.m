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
#import "RNFBAnalytics/RNFBAnalyticsLogTransactionHostStub.h"
#import "RNFBAnalyticsHelper.h"

@interface RNFBAnalyticsHelperHostStubTests : XCTestCase
@end

@implementation RNFBAnalyticsHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRAnalytics resetTestState];
  [RNFBAnalyticsLogTransaction resetTestState];
}

- (void)tearDown {
  [FIRAnalytics resetTestState];
  [RNFBAnalyticsLogTransaction resetTestState];
  [super tearDown];
}

- (void)testLogEvent_cleansJavascriptParamsBeforeForwarding {
  __block id resolved = @"unset";
  [RNFBAnalyticsHelper logEvent:@"purchase"
      params:@{@"quantity" : @"2", @"success" : @"true"}
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved, [NSNull null]);
  XCTAssertEqualObjects(FIRAnalytics.lastLogEventName, @"purchase");
  XCTAssertEqualObjects(FIRAnalytics.lastLogEventParameters[@"quantity"], @2);
  XCTAssertEqualObjects(FIRAnalytics.lastLogEventParameters[@"success"], @1);
}

- (void)testSetUserId_convertsNSNullToNil {
  [RNFBAnalyticsHelper setUserId:(NSString *)[NSNull null]
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertNil(FIRAnalytics.userIDValue);
}

- (void)testSetUserProperties_appliesEachEntryWithNSNullCoercion {
  [RNFBAnalyticsHelper setUserProperties:@{@"a" : @"1", @"b" : [NSNull null]}
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(FIRAnalytics.userProperties[@"a"], @"1");
  XCTAssertNil(FIRAnalytics.userProperties[@"b"]);
}

- (void)testSetSessionTimeoutDuration_convertsMillisecondsToSeconds {
  [RNFBAnalyticsHelper setSessionTimeoutDuration:1500
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualWithAccuracy(FIRAnalytics.sessionTimeoutIntervalValue, 1.5, 0.0001);
}

- (void)testGetAppInstanceId_forwardsStubValue {
  FIRAnalytics.appInstanceIDValue = @"instance-42";
  __block id resolved = @"unset";
  [RNFBAnalyticsHelper
      getAppInstanceId:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved, @"instance-42");
}

- (void)testGetSessionId_success_resolvesNumber {
  FIRAnalytics.sessionIDCompletionValue = 99;
  __block id resolved = @"unset";
  XCTestExpectation *expectation = [self expectationWithDescription:@"session id"];

  [RNFBAnalyticsHelper
      getSessionId:^(id result) {
        resolved = result;
        [expectation fulfill];
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  [self waitForExpectationsWithTimeout:1.0 handler:nil];
  XCTAssertEqualObjects(resolved, @99);
}

- (void)testGetSessionId_zeroWithoutError_resolvesNull {
  FIRAnalytics.sessionIDCompletionValue = 0;
  __block id resolved = @"unset";
  XCTestExpectation *expectation = [self expectationWithDescription:@"session id zero"];

  [RNFBAnalyticsHelper
      getSessionId:^(id result) {
        resolved = result;
        [expectation fulfill];
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  [self waitForExpectationsWithTimeout:1.0 handler:nil];
  XCTAssertEqualObjects(resolved, [NSNull null]);
}

- (void)testGetSessionId_error_resolvesNull {
  FIRAnalytics.sessionIDCompletionError =
      [NSError errorWithDomain:@"test" code:1 userInfo:@{NSLocalizedDescriptionKey : @"boom"}];
  __block id resolved = @"unset";
  XCTestExpectation *expectation = [self expectationWithDescription:@"session id error"];

  [RNFBAnalyticsHelper
      getSessionId:^(id result) {
        resolved = result;
        [expectation fulfill];
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  [self waitForExpectationsWithTimeout:1.0 handler:nil];
  XCTAssertEqualObjects(resolved, [NSNull null]);
}

- (void)testHashedEmail_invalidHex_rejects {
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  __block BOOL resolved = NO;

  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithHashedEmailAddress:@"deadbeef"
      resolve:^(id result) {
        (void)result;
        resolved = YES;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertFalse(resolved);
  XCTAssertEqualObjects(rejectCode, @"firebase_analytics");
  XCTAssertEqualObjects(rejectMessage, @"Expected a 64-character SHA-256 hex string");
  XCTAssertNil(FIRAnalytics.lastHashedEmail);
}

- (void)testHashedEmail_validHex_forwardsData {
  NSString *hex = [@"" stringByPaddingToLength:64 withString:@"ab" startingAtIndex:0];
  __block BOOL resolved = NO;

  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithHashedEmailAddress:hex
      resolve:^(id result) {
        (void)result;
        resolved = YES;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertTrue(resolved);
  XCTAssertEqual(FIRAnalytics.lastHashedEmail.length, 32u);
}

- (void)testHashedPhone_invalidHex_rejects {
  __block NSString *rejectCode = nil;
  __block BOOL resolved = NO;

  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:@"short"
      resolve:^(id result) {
        (void)result;
        resolved = YES;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)message;
        (void)error;
        rejectCode = code;
      }];

  XCTAssertFalse(resolved);
  XCTAssertEqualObjects(rejectCode, @"firebase_analytics");
  XCTAssertNil(FIRAnalytics.lastHashedPhone);
}

- (void)testSetConsent_mapsSettingsAndForwards {
  [RNFBAnalyticsHelper setConsent:@{@"analytics_storage" : @YES, @"ad_storage" : @NO}
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(FIRAnalytics.lastConsent[@"analytics_storage"], @"granted");
  XCTAssertEqualObjects(FIRAnalytics.lastConsent[@"ad_storage"], @"denied");
}

- (void)testLogTransaction_forwardsToSwiftFacade {
  [RNFBAnalyticsHelper logTransaction:@"12345"
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqual(RNFBAnalyticsLogTransaction.logCallCount, 1u);
  XCTAssertEqualObjects(RNFBAnalyticsLogTransaction.lastTransactionId, @"12345");
}

- (void)testSetAnalyticsCollectionEnabled_andReset {
  [RNFBAnalyticsHelper setAnalyticsCollectionEnabled:YES
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  [RNFBAnalyticsHelper
      resetAnalyticsData:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertTrue(FIRAnalytics.analyticsCollectionEnabledValue);
  XCTAssertEqual(FIRAnalytics.resetAnalyticsDataCallCount, 1u);
}

- (void)testSetUserProperty_forwardsValue {
  [RNFBAnalyticsHelper setUserProperty:@"tier"
      value:@"gold"
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(FIRAnalytics.userProperties[@"tier"], @"gold");
}

- (void)testSetDefaultEventParameters_cleansBeforeForwarding {
  [RNFBAnalyticsHelper setDefaultEventParameters:@{@"quantity" : @"3"}
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(FIRAnalytics.lastDefaultEventParameters[@"quantity"], @3);
}

- (void)testConversionEmailAndPhone_forwardPlainValues {
  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithEmailAddress:@"a@b.c"
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];
  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithPhoneNumber:@"+15551212"
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(FIRAnalytics.lastConversionEmail, @"a@b.c");
  XCTAssertEqualObjects(FIRAnalytics.lastConversionPhone, @"+15551212");
}

- (void)testHashedPhone_validHex_forwardsData {
  NSString *hex = [@"" stringByPaddingToLength:64 withString:@"cd" startingAtIndex:0];
  [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:hex
      resolve:^(id result) {
        (void)result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqual(FIRAnalytics.lastHashedPhone.length, 32u);
}

- (void)testLogEvent_sdkException_rejects {
  FIRAnalytics.shouldThrowOnNextCall = YES;
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  __block BOOL resolved = NO;

  [RNFBAnalyticsHelper logEvent:@"x"
      params:@{}
      resolve:^(id result) {
        (void)result;
        resolved = YES;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)error;
        rejectCode = code;
        rejectMessage = message;
      }];

  XCTAssertFalse(resolved);
  XCTAssertEqualObjects(rejectCode, @"unknown");
  XCTAssertEqualObjects(rejectMessage, @"stub throw");
}

- (void)testSetConsent_sdkException_rejects {
  FIRAnalytics.shouldThrowOnNextCall = YES;
  __block NSString *rejectMessage = nil;

  [RNFBAnalyticsHelper setConsent:@{@"analytics_storage" : @YES}
      resolve:^(id result) {
        (void)result;
        XCTFail(@"unexpected resolve");
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)error;
        rejectMessage = message;
      }];

  XCTAssertEqualObjects(rejectMessage, @"stub throw");
}

- (void)testRemainingSdkExceptionPaths_reject {
  NSArray<void (^)(void)> *calls = @[
    ^{
      [RNFBAnalyticsHelper setUserId:@"u"
          resolve:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
    ^{
      [RNFBAnalyticsHelper setUserProperty:@"k"
          value:@"v"
          resolve:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
    ^{
      [RNFBAnalyticsHelper setUserProperties:@{@"k" : @"v"}
          resolve:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
    ^{
      [RNFBAnalyticsHelper
          resetAnalyticsData:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
    ^{
      [RNFBAnalyticsHelper setDefaultEventParameters:@{}
          resolve:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
    ^{
      [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithEmailAddress:@"a@b.c"
          resolve:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
    ^{
      [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithPhoneNumber:@"+1"
          resolve:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
    ^{
      NSString *hex = [@"" stringByPaddingToLength:64 withString:@"ab" startingAtIndex:0];
      [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithHashedEmailAddress:hex
          resolve:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
    ^{
      NSString *hex = [@"" stringByPaddingToLength:64 withString:@"ab" startingAtIndex:0];
      [RNFBAnalyticsHelper initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:hex
          resolve:^(id r) {
            (void)r;
            XCTFail(@"resolve");
          }
          reject:^(NSString *c, NSString *m, NSError *e) {
            (void)c;
            (void)e;
            XCTAssertEqualObjects(m, @"stub throw");
          }];
    },
  ];

  for (void (^call)(void) in calls) {
    FIRAnalytics.shouldThrowOnNextCall = YES;
    call();
  }
}

@end
