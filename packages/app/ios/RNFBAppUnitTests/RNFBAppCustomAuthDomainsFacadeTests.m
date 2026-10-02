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

#import "RNFBAppModule.h"
#import "RNFBHandleMapStorage-Swift.inc"

@interface RNFBAppModule (Testing)
+ (void)setCustomDomain:(nullable NSString *)authDomain forAppName:(NSString *)appName;
+ (void)setCustomDomainForTesting:(NSString *)domain forAppName:(NSString *)appName;
+ (void)resetCustomDomainsForTesting;
@end

@interface RNFBAppCustomAuthDomainsFacadeTests : XCTestCase
@end

@implementation RNFBAppCustomAuthDomainsFacadeTests

- (void)tearDown {
  [RNFBAppModule resetCustomDomainsForTesting];
  [super tearDown];
}

- (void)testFacadeGetMissingReturnsNil {
  XCTAssertNil([RNFBAppModule getCustomDomain:@"missing"]);
}

- (void)testFacadeSetGetViaTestingHelper {
  [RNFBAppModule setCustomDomainForTesting:@"custom.example.com" forAppName:@"secondary"];
  XCTAssertEqualObjects([RNFBAppModule getCustomDomain:@"secondary"], @"custom.example.com");
}

- (void)testFacadeSetViaProductionSelector {
  [RNFBAppModule setCustomDomain:@"prod.example.com" forAppName:@"app"];
  XCTAssertEqualObjects([RNFBAppModule getCustomDomain:@"app"], @"prod.example.com");
}

- (void)testFacadeSetNilRemovesKey {
  [RNFBAppModule setCustomDomain:@"auth.example.com" forAppName:@"app"];
  [RNFBAppModule setCustomDomain:nil forAppName:@"app"];
  XCTAssertNil([RNFBAppModule getCustomDomain:@"app"]);
}

- (void)testFacadeResetClearsAll {
  [RNFBAppModule setCustomDomainForTesting:@"a.example.com" forAppName:@"a"];
  [RNFBAppModule setCustomDomainForTesting:@"b.example.com" forAppName:@"b"];
  [RNFBAppModule resetCustomDomainsForTesting];
  XCTAssertNil([RNFBAppModule getCustomDomain:@"a"]);
  XCTAssertNil([RNFBAppModule getCustomDomain:@"b"]);
}

- (void)testFacadePublicGetSelectorUnchanged {
  XCTAssertTrue([RNFBAppModule respondsToSelector:@selector(getCustomDomain:)]);
  NSMethodSignature *signature =
      [RNFBAppModule methodSignatureForSelector:@selector(getCustomDomain:)];
  XCTAssertEqual(strcmp(signature.methodReturnType, @encode(id)), 0);
}

@end
