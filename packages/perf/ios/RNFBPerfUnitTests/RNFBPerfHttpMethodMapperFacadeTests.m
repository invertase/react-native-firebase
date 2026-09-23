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

#import "RNFBHandleMapStorage-Swift.inc"

@interface RNFBPerfHttpMethodMapperFacadeTests : XCTestCase
@end

@implementation RNFBPerfHttpMethodMapperFacadeTests

- (void)testObjCSelectorMapsKnownMethods {
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"put"], 1);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"POST"], 2);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"delete"], 3);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"HEAD"], 4);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"patch"], 5);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"OPTIONS"], 6);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"trace"], 7);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"CONNECT"], 8);
}

- (void)testObjCSelectorDefaultsUnknownNilEmptyGetToGet {
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"get"], 0);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@"bogus"], 0);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:@""], 0);
  XCTAssertEqual([RNFBPerfHttpMethodMapper httpMethodRawValueForString:nil], 0);
}

- (void)testFacadePublicSelectorUnchanged {
  XCTAssertTrue(
      [RNFBPerfHttpMethodMapper respondsToSelector:@selector(httpMethodRawValueForString:)]);
  NSMethodSignature *signature =
      [RNFBPerfHttpMethodMapper methodSignatureForSelector:@selector(httpMethodRawValueForString:)];
  XCTAssertEqual(strcmp(signature.methodReturnType, @encode(NSInteger)), 0);
}

@end
