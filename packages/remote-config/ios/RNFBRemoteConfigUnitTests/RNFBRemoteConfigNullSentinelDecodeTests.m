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

#import "RNFBConfigNullSentinelDecoder.h"

@interface RNFBRemoteConfigNullSentinelDecodeTests : XCTestCase
@end

@implementation RNFBRemoteConfigNullSentinelDecodeTests

- (NSDictionary *)nullSentinel {
  return @{@"__rnfbNull" : @YES};
}

- (NSDictionary *)unrelatedOneKeyDictionary {
  return @{@".sv" : @"timestamp"};
}

- (void)testSetDefaults_childNullSentinel_becomesNSNull {
  NSDictionary *defaults = @{@"flag" : [self nullSentinel], @"title" : @"hello"};
  NSDictionary *decoded = [RNFBConfigNullSentinelDecoder decodedDefaults:defaults];
  XCTAssertEqualObjects(decoded[@"flag"], [NSNull null]);
  XCTAssertEqualObjects(decoded[@"title"], @"hello");
  XCTAssertFalse([decoded[@"flag"] isKindOfClass:[NSDictionary class]]);
}

- (void)testSetDefaults_unrelatedOneKeyDictionary_unchanged {
  NSDictionary *defaults = @{@"server" : [self unrelatedOneKeyDictionary]};
  NSDictionary *decoded = [RNFBConfigNullSentinelDecoder decodedDefaults:defaults];
  XCTAssertEqualObjects(decoded[@"server"], [self unrelatedOneKeyDictionary]);
}

@end
