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

#import "RNFBAnalyticsHelper.h"

@interface RNFBAnalyticsNullSentinelDecodeTests : XCTestCase
@end

@implementation RNFBAnalyticsNullSentinelDecodeTests

- (NSDictionary *)nullSentinel {
  return @{@"__rnfbNull" : @YES};
}

- (NSDictionary *)unrelatedOneKeyDictionary {
  return @{@".sv" : @"timestamp"};
}

- (void)testLogEventParams_childNullSentinel_isOmitted {
  NSDictionary *params = @{@"item" : [self nullSentinel], @"value" : @1};
  NSDictionary *decoded = [RNFBAnalyticsHelper logEventParams:params];
  XCTAssertNil(decoded[@"item"]);
  XCTAssertFalse([decoded[@"item"] isKindOfClass:[NSDictionary class]]);
  XCTAssertNotEqualObjects(decoded[@"item"], [NSNull null]);
  XCTAssertEqualObjects(decoded[@"value"], @1);
}

- (void)testSetUserProperties_childNullSentinel_becomesNil {
  NSDictionary *properties = @{@"favorite_food" : [self nullSentinel]};
  NSDictionary *decoded = [RNFBAnalyticsHelper decodedUserProperties:properties];
  // Omitted key → subscript nil, same value setUserPropertyString:forName: uses to clear.
  XCTAssertNil(decoded[@"favorite_food"]);
  XCTAssertFalse([decoded[@"favorite_food"] isKindOfClass:[NSDictionary class]]);
  XCTAssertNotEqualObjects(decoded[@"favorite_food"], [NSNull null]);
}

- (void)testSetDefaultEventParameters_childNullSentinel_becomesNSNull {
  NSDictionary *params = @{@"campaign" : [self nullSentinel]};
  NSDictionary *decoded = [RNFBAnalyticsHelper decodedParams:params];
  XCTAssertEqualObjects(decoded[@"campaign"], [NSNull null]);
}

- (void)testDecodedParams_unrelatedOneKeyDictionary_unchanged {
  NSDictionary *params = @{@"custom" : [self unrelatedOneKeyDictionary]};
  NSDictionary *decoded = [RNFBAnalyticsHelper decodedParams:params];
  XCTAssertEqualObjects(decoded[@"custom"], [self unrelatedOneKeyDictionary]);
  NSDictionary *logEventDecoded = [RNFBAnalyticsHelper logEventParams:params];
  XCTAssertEqualObjects(logEventDecoded[@"custom"], [self unrelatedOneKeyDictionary]);
  NSDictionary *userPropsDecoded = [RNFBAnalyticsHelper decodedUserProperties:params];
  XCTAssertEqualObjects(userPropsDecoded[@"custom"], [self unrelatedOneKeyDictionary]);
}

- (void)testLogEventParams_arrayWithNSNullElement_dropsNullElement {
  NSDictionary *params = @{@"a" : @[ @1, [NSNull null] ]};
  NSDictionary *decoded = [RNFBAnalyticsHelper logEventParams:params];
  XCTAssertEqualObjects(decoded, (@{@"a" : @[ @1 ]}));
}

- (void)testLogEventParams_nestedContainers_dropNullsAtEveryLevel {
  NSDictionary *params = @{
    @"items" : @[
      @{@"id" : @"x", @"gone" : [self nullSentinel]}, @[ [NSNull null], @"y" ], @"z", [NSNull null]
    ],
    @"only_null" : [NSNull null]
  };
  NSDictionary *decoded = [RNFBAnalyticsHelper logEventParams:params];
  NSDictionary *expected = @{@"items" : @[ @{@"id" : @"x"}, @[ @"y" ], @"z" ]};
  XCTAssertEqualObjects(decoded, expected);
}

- (void)testLogEventParams_nilInput_returnsNil {
  XCTAssertNil([RNFBAnalyticsHelper logEventParams:nil]);
}

- (void)testLogEventParams_NSNullInput_returnsNil {
  XCTAssertNil([RNFBAnalyticsHelper logEventParams:(id)[NSNull null]]);
}

- (void)testLogEventParams_nonDictionaryInput_returnsNil {
  XCTAssertNil([RNFBAnalyticsHelper logEventParams:(id) @"not-a-dictionary"]);
}

- (void)testDecodedUserProperties_nilInput_returnsNil {
  XCTAssertNil([RNFBAnalyticsHelper decodedUserProperties:nil]);
}

- (void)testDecodedUserProperties_NSNullInput_returnsNil {
  XCTAssertNil([RNFBAnalyticsHelper decodedUserProperties:(id)[NSNull null]]);
}

- (void)testDecodedUserProperties_nonDictionaryInput_returnsNil {
  XCTAssertNil([RNFBAnalyticsHelper decodedUserProperties:(id) @42]);
}

@end
