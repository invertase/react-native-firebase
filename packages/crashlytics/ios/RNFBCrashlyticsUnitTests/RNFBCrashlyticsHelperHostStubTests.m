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
#import "RNFBCrashlyticsHelper.h"

@interface RNFBCrashlyticsHelperHostStubTests : XCTestCase
@end

@implementation RNFBCrashlyticsHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRCrashlytics resetTestState];
}

- (void)tearDown {
  [FIRCrashlytics resetTestState];
  [super tearDown];
}

- (void)testIsDebuggerAttached_returnsBoolWithoutCrash {
  // Thin ObjC facade over Swift probe (already covered by DebuggerProbeTests).
  BOOL attached = [RNFBCrashlyticsHelper isDebuggerAttached];
  XCTAssertTrue(attached == YES || attached == NO);
}

- (void)testLog_forwardsMessage {
  [RNFBCrashlyticsHelper log:@"hello-helper"];
  XCTAssertEqualObjects(FIRCrashlytics.loggedMessages, @[ @"hello-helper" ]);
}

- (void)testSetCustomValue_andUserID {
  [RNFBCrashlyticsHelper setCustomValue:@"v1" forKey:@"k1"];
  [RNFBCrashlyticsHelper setUserID:@"user-42"];
  XCTAssertEqualObjects(FIRCrashlytics.customValues[@"k1"], @"v1");
  XCTAssertEqualObjects(FIRCrashlytics.userIDValue, @"user-42");
}

- (void)testSetCustomKeysAndValues_appliesEachEntry {
  [RNFBCrashlyticsHelper setCustomKeysAndValues:@{@"a" : @"1", @"b" : @"2"}];
  XCTAssertEqualObjects(FIRCrashlytics.customValues[@"a"], @"1");
  XCTAssertEqualObjects(FIRCrashlytics.customValues[@"b"], @"2");
}

- (void)testCheckForUnsentReports_forwardsCompletionValue {
  FIRCrashlytics.checkForUnsentReportsValue = YES;
  __block NSNumber *seen = nil;
  [RNFBCrashlyticsHelper checkForUnsentReportsWithCompletion:^(BOOL unsentReports) {
    seen = @(unsentReports);
  }];
  XCTAssertEqualObjects(seen, @YES);
}

- (void)testCheckForUnsentReports_nilCompletion_doesNotCrash {
  FIRCrashlytics.checkForUnsentReportsValue = NO;
  [RNFBCrashlyticsHelper checkForUnsentReportsWithCompletion:nil];
}

- (void)testDidCrashDuringPreviousExecution_forwardsStubValue {
  FIRCrashlytics.didCrashDuringPreviousExecutionValue = YES;
  XCTAssertTrue([RNFBCrashlyticsHelper didCrashDuringPreviousExecution]);
}

- (void)testDeleteAndSendUnsentReports_incrementCallCounts {
  [RNFBCrashlyticsHelper deleteUnsentReports];
  [RNFBCrashlyticsHelper sendUnsentReports];
  XCTAssertEqual(FIRCrashlytics.deleteUnsentReportsCallCount, 1u);
  XCTAssertEqual(FIRCrashlytics.sendUnsentReportsCallCount, 1u);
}

- (void)testRecordJavaScriptError_buildsExceptionModelWithFrames {
  NSArray *frames = @[
    @{@"fn" : @"doThing", @"file" : @"app.js", @"line" : @12},
    @{@"fn" : @"main", @"file" : @"index.js", @"line" : @3},
  ];

  [RNFBCrashlyticsHelper recordJavaScriptErrorWithMessage:@"boom"
                                                   frames:frames
                              isUnhandledPromiseRejection:NO];

  FIRExceptionModel *model = FIRCrashlytics.lastRecordedExceptionModel;
  XCTAssertNotNil(model);
  XCTAssertEqualObjects(model.name, @"JavaScriptError");
  XCTAssertEqualObjects(model.reason, @"boom");
  XCTAssertEqual(model.stackTrace.count, 2u);
  XCTAssertEqualObjects(model.stackTrace[0].symbol, @"doThing");
  XCTAssertEqualObjects(model.stackTrace[0].file, @"app.js");
  XCTAssertEqual(model.stackTrace[0].line, 12u);
  XCTAssertEqualObjects(model.stackTrace[1].symbol, @"main");
}

- (void)testRecordJavaScriptError_unhandledRejection_usesRejectionName {
  [RNFBCrashlyticsHelper recordJavaScriptErrorWithMessage:@"rejected"
                                                   frames:@[]
                              isUnhandledPromiseRejection:YES];

  FIRExceptionModel *model = FIRCrashlytics.lastRecordedExceptionModel;
  XCTAssertEqualObjects(model.name, @"UnhandledPromiseRejection");
  XCTAssertEqualObjects(model.reason, @"rejected");
  XCTAssertEqual(model.stackTrace.count, 0u);
}

@end
