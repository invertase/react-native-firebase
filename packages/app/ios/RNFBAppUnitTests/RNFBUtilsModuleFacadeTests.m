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
#import "RNFBUtilsModule.h"

@interface RNFBUtilsModuleFacadeTests : XCTestCase
@end

@implementation RNFBUtilsModuleFacadeTests

- (void)testFacadePathForDirectoryMatchesSearchPath {
  NSString *path = [RNFBUtilsHelpers pathForDirectory:(int)NSCachesDirectory];
  NSString *expected =
      [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) firstObject];
  XCTAssertEqualObjects(path, expected);
}

- (void)testFacadeUtilsConstantsDictionaryKeys {
  NSDictionary *constants = [RNFBUtilsHelpers
      utilsConstantsDictionaryWithBundlePath:@"/Bundle.app"
                                  appVersion:@"9.9.9"
                                pathProvider:^NSString *(int directory) {
                                  return [NSString stringWithFormat:@"dir-%d", directory];
                                }
                          temporaryDirectory:@"/tmp/facade"];

  XCTAssertEqualObjects(constants[@"isRunningInTestLab"], @NO);
  XCTAssertEqualObjects(constants[@"MAIN_BUNDLE"], @"/Bundle.app");
  XCTAssertEqualObjects(constants[@"TEMP_DIRECTORY"], @"/tmp/facade");
  XCTAssertEqualObjects(constants[@"appVersion"], @"9.9.9");
  XCTAssertEqualObjects(constants[@"CACHES_DIRECTORY"],
                        ([NSString stringWithFormat:@"dir-%d", (int)NSCachesDirectory]));
}

- (void)testFacadeIsRemoteAsset {
  XCTAssertTrue([RNFBUtilsModule isRemoteAsset:@"assets-library://x"]);
  XCTAssertTrue([RNFBUtilsModule isRemoteAsset:@"ph://y"]);
  XCTAssertFalse([RNFBUtilsModule isRemoteAsset:@"/local/file.jpg"]);
}

- (void)testFacadeUnusedIsHeic {
  XCTAssertTrue([RNFBUtilsModule unused_isHeic:@"a.HEIC"]);
  XCTAssertFalse([RNFBUtilsModule unused_isHeic:@"a.png"]);
}

- (void)testFacadeValueForKeyFromQueryItems {
  NSArray *items = @[
    [NSURLQueryItem queryItemWithName:@"id" value:@"asset-1"],
    [NSURLQueryItem queryItemWithName:@"w" value:@"100"],
  ];
  XCTAssertEqualObjects([RNFBUtilsModule valueForKey:@"id" fromQueryItems:items], @"asset-1");
  XCTAssertEqualObjects([RNFBUtilsModule valueForKey:@"w" fromQueryItems:items], @"100");
  XCTAssertNil([RNFBUtilsModule valueForKey:@"missing" fromQueryItems:items]);
}

@end
