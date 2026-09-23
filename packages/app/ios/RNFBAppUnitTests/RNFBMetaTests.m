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
#import "RNFBMeta.h"

@interface RNFBMetaTests : XCTestCase
@end

@implementation RNFBMetaTests

- (void)testPublicClassSelectorsAndReturnEncodingsAreUnchanged {
  NSArray<NSString *> *selectorNames = @[
    @"contains:",
    @"getBooleanValue:defaultValue:",
    @"getStringValue:defaultValue:",
    @"getAll",
  ];
  for (NSString *selectorName in selectorNames) {
    XCTAssertTrue([RNFBMeta respondsToSelector:NSSelectorFromString(selectorName)]);
  }

  NSMethodSignature *contains = [RNFBMeta methodSignatureForSelector:@selector(contains:)];
  XCTAssertEqual(strcmp(contains.methodReturnType, @encode(BOOL)), 0);

  NSMethodSignature *boolean = [RNFBMeta methodSignatureForSelector:@selector(getBooleanValue:
                                                                                 defaultValue:)];
  XCTAssertEqual(strcmp(boolean.methodReturnType, @encode(BOOL)), 0);
  XCTAssertEqual(strcmp([boolean getArgumentTypeAtIndex:3], @encode(BOOL)), 0);

  NSMethodSignature *string = [RNFBMeta methodSignatureForSelector:@selector(getStringValue:
                                                                               defaultValue:)];
  XCTAssertEqual(strcmp(string.methodReturnType, @encode(id)), 0);

  NSMethodSignature *getAll = [RNFBMeta methodSignatureForSelector:@selector(getAll)];
  XCTAssertEqual(strcmp(getAll.methodReturnType, @encode(id)), 0);
}

- (void)testFacadeForwardsToSharedMainBundleStorage {
  // Smoke: class methods are callable and getAll returns a dictionary (may be empty).
  XCTAssertNotNil([RNFBMeta getAll]);
  XCTAssertTrue([[RNFBMeta getAll] isKindOfClass:[NSDictionary class]]);
  XCTAssertFalse([RNFBMeta contains:@"__rnfb_meta_unit_test_missing_key__"]);
  XCTAssertTrue([RNFBMeta getBooleanValue:@"__rnfb_meta_unit_test_missing_key__" defaultValue:YES]);
  XCTAssertEqualObjects([RNFBMeta getStringValue:@"__rnfb_meta_unit_test_missing_key__"
                                    defaultValue:@"fallback"],
                        @"fallback");
}

@end
