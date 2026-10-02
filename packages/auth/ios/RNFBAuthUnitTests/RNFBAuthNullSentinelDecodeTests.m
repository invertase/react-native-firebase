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

#import "RNFBAuthNullSentinelDecoder.h"

@interface RNFBAuthNullSentinelDecodeTests : XCTestCase
@end

@implementation RNFBAuthNullSentinelDecodeTests

- (NSDictionary *)nullSentinel {
  return @{@"__rnfbNull" : @YES};
}

- (NSDictionary *)unrelatedOneKeyDictionary {
  return @{@".sv" : @"timestamp"};
}

- (void)testUpdateProfile_displayNameNullSentinel_becomesNil {
  NSDictionary *props = @{@"displayName" : [self nullSentinel]};
  NSDictionary *decoded = [RNFBAuthNullSentinelDecoder decodedProfileProps:props];
  XCTAssertNil(decoded[@"displayName"]);
  XCTAssertFalse([decoded[@"displayName"] isKindOfClass:[NSDictionary class]]);
}

- (void)testUpdateProfile_photoURLNullSentinel_becomesNil {
  NSDictionary *props = @{@"photoURL" : [self nullSentinel]};
  NSDictionary *decoded = [RNFBAuthNullSentinelDecoder decodedProfileProps:props];
  XCTAssertNil(decoded[@"photoURL"]);
  XCTAssertFalse([decoded[@"photoURL"] isKindOfClass:[NSDictionary class]]);
  // Same path updateProfile uses: seam omit → subscript nil → clear arm (nil, not URLWithString:).
  XCTAssertNil([RNFBAuthNullSentinelDecoder photoURLFromDecodedValue:decoded[@"photoURL"]]);
}

- (void)testUpdateProfile_photoURLFromDecodedValue_nilClearsWithoutURLWithString {
  XCTAssertNil([RNFBAuthNullSentinelDecoder photoURLFromDecodedValue:nil]);
}

- (void)testUpdateProfile_photoURLFromDecodedValue_stringBecomesNSURL {
  NSURL *url = [RNFBAuthNullSentinelDecoder photoURLFromDecodedValue:@"https://example.com/a.jpg"];
  XCTAssertEqualObjects(url.absoluteString, @"https://example.com/a.jpg");
}

- (void)testUpdateProfile_displayNameNSNull_becomesNil {
  NSDictionary *props = @{@"displayName" : [NSNull null]};
  NSDictionary *decoded = [RNFBAuthNullSentinelDecoder decodedProfileProps:props];
  XCTAssertNil(decoded[@"displayName"]);
}

- (void)testUpdateProfile_photoURLNSNull_becomesNil {
  NSDictionary *props = @{@"photoURL" : [NSNull null]};
  NSDictionary *decoded = [RNFBAuthNullSentinelDecoder decodedProfileProps:props];
  XCTAssertNil(decoded[@"photoURL"]);
}

- (void)testUpdateProfile_unrelatedOneKeyDictionary_unchanged {
  NSDictionary *props = @{@"displayName" : [self unrelatedOneKeyDictionary]};
  NSDictionary *decoded = [RNFBAuthNullSentinelDecoder decodedProfileProps:props];
  XCTAssertEqualObjects(decoded[@"displayName"], [self unrelatedOneKeyDictionary]);
}

@end
