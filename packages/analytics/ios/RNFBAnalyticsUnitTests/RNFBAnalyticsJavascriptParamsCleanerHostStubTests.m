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

#if __has_include("RNFBAnalyticsJavascriptParamsCleaner-Swift.inc")
#import "RNFBAnalyticsJavascriptParamsCleaner-Swift.inc"
#elif __has_include("RNFBAnalyticsUnitTests-Swift.h")
#import "RNFBAnalyticsUnitTests-Swift.h"
#else
#error "RNFBAnalyticsJavascriptParamsCleaner Swift interface not found"
#endif

@interface RNFBAnalyticsJavascriptParamsCleanerHostStubTests : XCTestCase
@end

@implementation RNFBAnalyticsJavascriptParamsCleanerHostStubTests

- (void)testLongNumericKeys_matchHostStubFirebaseConstants {
  NSArray<NSString *> *expected = @[
    kFIRParameterQuantity,
    kFIRParameterIndex,
    kFIRParameterLevel,
    kFIRParameterNumberOfNights,
    kFIRParameterNumberOfPassengers,
    kFIRParameterNumberOfRooms,
    kFIRParameterScore,
  ];
  XCTAssertEqualObjects(RNFBAnalyticsJavascriptParamsCleaner.longNumericParameterKeys, expected);
}

- (void)testCleanJavascriptParams_usesHostStubItemsSuccessExtendSessionKeys {
  NSDictionary *cleaned = [RNFBAnalyticsJavascriptParamsCleaner cleanJavascriptParams:@{
    kFIRParameterItems : @[ @{kFIRParameterQuantity : @2.7} ],
    kFIRParameterSuccess : @"yes",
    kFIRParameterExtendSession : @1,
  }];
  XCTAssertEqualObjects(cleaned[kFIRParameterSuccess], @1);
  XCTAssertEqualObjects(cleaned[kFIRParameterExtendSession], @YES);
  NSArray *items = cleaned[kFIRParameterItems];
  XCTAssertEqualObjects(items[0][kFIRParameterQuantity], @2);
}

@end
