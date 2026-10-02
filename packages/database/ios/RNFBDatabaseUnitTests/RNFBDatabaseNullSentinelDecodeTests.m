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

#import "RNFBDatabaseNullSentinelDecoder.h"

@interface RNFBDatabaseNullSentinelDecodeTests : XCTestCase
@end

@implementation RNFBDatabaseNullSentinelDecodeTests

- (NSDictionary *)nullSentinel {
  return @{@"__rnfbNull" : @YES};
}

- (NSDictionary *)serverTimestamp {
  return @{@".sv" : @"timestamp"};
}

#pragma mark - Reference helper seams

- (void)testReferenceSet_topLevelNullSentinel_becomesNSNull {
  NSDictionary *props = @{@"value" : [self nullSentinel]};
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedValueFromProps:props],
                        [NSNull null]);
}

- (void)testReferenceUpdate_childNullSentinel_becomesNSNull {
  NSDictionary *props = @{@"values" : @{@"a" : [self nullSentinel], @"b" : @1}};
  NSDictionary *decoded = [RNFBDatabaseNullSentinelDecoder decodedValuesFromProps:props];
  XCTAssertEqualObjects(decoded[@"a"], [NSNull null]);
  XCTAssertEqualObjects(decoded[@"b"], @1);
}

- (void)testReferenceSetWithPriority_valueAndPrioritySentinels_becomeNSNull {
  NSDictionary *props = @{
    @"value" : [self nullSentinel],
    @"priority" : [self nullSentinel],
  };
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedValueFromProps:props],
                        [NSNull null]);
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedPriorityFromProps:props],
                        [NSNull null]);
}

- (void)testReferenceSetPriority_sentinel_becomesNSNull {
  NSDictionary *props = @{@"priority" : [self nullSentinel]};
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedPriorityFromProps:props],
                        [NSNull null]);
}

- (void)testReference_serverTimestampDictionary_unchanged {
  NSDictionary *props = @{@"value" : [self serverTimestamp]};
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedValueFromProps:props],
                        [self serverTimestamp]);
}

#pragma mark - OnDisconnect helper seams

- (void)testOnDisconnectSet_topLevelNullSentinel_becomesNSNull {
  NSDictionary *props = @{@"value" : [self nullSentinel]};
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedValueFromProps:props],
                        [NSNull null]);
}

- (void)testOnDisconnectSetWithPriority_valueAndPrioritySentinels_becomeNSNull {
  NSDictionary *props = @{
    @"value" : [self nullSentinel],
    @"priority" : [self nullSentinel],
  };
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedValueFromProps:props],
                        [NSNull null]);
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedPriorityFromProps:props],
                        [NSNull null]);
}

- (void)testOnDisconnectUpdate_childNullSentinel_becomesNSNull {
  NSDictionary *props = @{@"values" : @{@"gone" : [self nullSentinel]}};
  NSDictionary *decoded = [RNFBDatabaseNullSentinelDecoder decodedValuesFromProps:props];
  XCTAssertEqualObjects(decoded[@"gone"], [NSNull null]);
}

- (void)testOnDisconnect_serverTimestampDictionary_unchanged {
  NSDictionary *props = @{@"value" : [self serverTimestamp]};
  XCTAssertEqualObjects([RNFBDatabaseNullSentinelDecoder decodedValueFromProps:props],
                        [self serverTimestamp]);
}

#pragma mark - Transaction helper seam

- (void)testTransactionTryCommit_valueSentinel_becomesNSNull {
  id decoded = [RNFBDatabaseNullSentinelDecoder decodedTransactionValue:[self nullSentinel]];
  XCTAssertEqualObjects(decoded, [NSNull null]);
  XCTAssertFalse([decoded isKindOfClass:[NSDictionary class]]);
}

- (void)testTransactionTryCommit_serverTimestamp_unchanged {
  XCTAssertEqualObjects(
      [RNFBDatabaseNullSentinelDecoder decodedTransactionValue:[self serverTimestamp]],
      [self serverTimestamp]);
}

@end
