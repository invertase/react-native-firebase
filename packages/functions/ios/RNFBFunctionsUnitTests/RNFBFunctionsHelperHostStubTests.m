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
#import "RNFBFunctionsCallHandler-Swift.inc"
#import "RNFBFunctionsHelper.h"

@interface RNFBFunctionsHelperHostStubTests : XCTestCase
@end

@implementation RNFBFunctionsHelperHostStubTests

- (void)setUp {
  [super setUp];
  [RNFBFunctionsCallHandler resetTestState];
  [RNFBFunctionsStreamHandler resetTestState];
  [RCTConvert resetTestState];
  [RCTConvert setFirAppFromStringHandler:^FIRApp *(NSString *appName) {
    return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
  }];
}

- (void)tearDown {
  [RNFBFunctionsCallHandler resetTestState];
  [RNFBFunctionsStreamHandler resetTestState];
  [RCTConvert resetTestState];
  [super tearDown];
}

- (void)testHttpsCallable_nilData_becomesNSNullAndResolves {
  RNFBFunctionsCallHandler.completionResult = @{@"data" : @"ok"};
  __block id resolved = @"unset";
  __block BOOL rejected = NO;

  [RNFBFunctionsHelper httpsCallableWithAppName:@"app-a"
      customUrlOrRegion:@"us-central1"
      emulatorHost:@"127.0.0.1"
      emulatorPort:5001
      name:@"ping"
      data:nil
      timeout:12.5
      limitedUseAppCheckToken:YES
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
  XCTAssertEqualObjects(resolved[@"data"], @"ok");
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCreateCustomUrlOrRegion, @"us-central1");
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCreateEmulatorHost, @"127.0.0.1");
  XCTAssertEqual(RNFBFunctionsCallHandler.lastCreateEmulatorPort, 5001);
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCallName, @"ping");
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCallData, [NSNull null]);
  XCTAssertEqual(RNFBFunctionsCallHandler.lastCallTimeout, 12.5);
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastLimitedUseAppCheckToken, @YES);
}

- (void)testHttpsCallable_error_rejectsWithUserInfo {
  RNFBFunctionsCallHandler.completionError =
      @{@"code" : @"NOT_FOUND", @"message" : @"missing", @"details" : [NSNull null]};
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  __block BOOL resolved = NO;

  [RNFBFunctionsHelper httpsCallableWithAppName:@"app-b"
      customUrlOrRegion:@"europe-west1"
      emulatorHost:nil
      emulatorPort:0
      name:@"gone"
      data:@{@"x" : @1}
      timeout:0
      limitedUseAppCheckToken:NO
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
  XCTAssertEqualObjects(rejectCode, @"NOT_FOUND");
  XCTAssertEqualObjects(rejectMessage, @"missing");
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCallData, @{@"x" : @1});
}

- (void)testHttpsCallableFromUrl_forwardsURLAndResolves {
  RNFBFunctionsCallHandler.completionResult = @{@"data" : @42};
  __block id resolved = @"unset";

  [RNFBFunctionsHelper httpsCallableFromUrlWithAppName:@"app-c"
      customUrlOrRegion:@"https://example.com"
      emulatorHost:nil
      emulatorPort:0
      url:@"https://example.com/fn"
      data:@"payload"
      timeout:3
      limitedUseAppCheckToken:NO
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved[@"data"], @42);
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCallURL, @"https://example.com/fn");
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCallData, @"payload");
  XCTAssertNil(RNFBFunctionsCallHandler.lastCallName);
}

- (void)testHttpsCallableFromUrl_error_rejectsWithUserInfo {
  RNFBFunctionsCallHandler.completionError =
      @{@"code" : @"INVALID_ARGUMENT", @"message" : @"bad url", @"details" : [NSNull null]};
  __block NSString *rejectCode = nil;
  __block NSString *rejectMessage = nil;
  __block BOOL resolved = NO;

  [RNFBFunctionsHelper httpsCallableFromUrlWithAppName:@"app-c2"
      customUrlOrRegion:@"us-central1"
      emulatorHost:nil
      emulatorPort:0
      url:@"https://example.com/bad"
      data:nil
      timeout:0
      limitedUseAppCheckToken:NO
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
  XCTAssertEqualObjects(rejectCode, @"INVALID_ARGUMENT");
  XCTAssertEqualObjects(rejectMessage, @"bad url");
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCallData, [NSNull null]);
}

- (void)testCreateStreamHandler_returnsCancellableObject {
  id handler = [RNFBFunctionsHelper createStreamHandler];
  XCTAssertTrue([handler respondsToSelector:@selector(cancel)]);
  [handler cancel];
  XCTAssertEqual(RNFBFunctionsStreamHandler.cancelCallCount, 1u);
}

- (void)testStartStreamOnHandler_byName_normalizesNilParameters {
  id handler = [RNFBFunctionsHelper createStreamHandler];
  __block NSDictionary *seenEvent = nil;

  [RNFBFunctionsHelper startStreamOnHandler:handler
                                    appName:@"app-d"
                          customUrlOrRegion:@"us-central1"
                               emulatorHost:nil
                               emulatorPort:0
                               functionName:@"streamFn"
                                functionUrl:nil
                                 parameters:nil
                                    timeout:9
                              eventCallback:^(NSDictionary *event) {
                                seenEvent = event;
                              }];

  XCTAssertEqualObjects(RNFBFunctionsStreamHandler.lastFunctionName, @"streamFn");
  XCTAssertNil(RNFBFunctionsStreamHandler.lastFunctionUrl);
  XCTAssertEqualObjects(RNFBFunctionsStreamHandler.lastParameters, [NSNull null]);
  XCTAssertEqual(RNFBFunctionsStreamHandler.lastTimeout, 9);
  XCTAssertNotNil(RNFBFunctionsStreamHandler.lastEventCallback);

  RNFBFunctionsStreamHandler.lastEventCallback(@{@"done" : @YES});
  XCTAssertEqualObjects(seenEvent[@"done"], @YES);
}

- (void)testStartStreamOnHandler_byUrl_forwardsUrl {
  id handler = [RNFBFunctionsHelper createStreamHandler];

  [RNFBFunctionsHelper startStreamOnHandler:handler
                                    appName:@"app-e"
                          customUrlOrRegion:@"us-central1"
                               emulatorHost:@"localhost"
                               emulatorPort:5001
                               functionName:nil
                                functionUrl:@"https://example.com/stream"
                                 parameters:@[ @"a" ]
                                    timeout:1
                              eventCallback:^(NSDictionary *event) {
                                (void)event;
                              }];

  XCTAssertNil(RNFBFunctionsStreamHandler.lastFunctionName);
  XCTAssertEqualObjects(RNFBFunctionsStreamHandler.lastFunctionUrl, @"https://example.com/stream");
  XCTAssertEqualObjects(RNFBFunctionsStreamHandler.lastParameters, @[ @"a" ]);
  XCTAssertEqualObjects(RNFBFunctionsCallHandler.lastCreateEmulatorHost, @"localhost");
  XCTAssertEqual(RNFBFunctionsCallHandler.lastCreateEmulatorPort, 5001);
}

@end
