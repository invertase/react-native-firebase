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
#import "RNFBJSON.h"
#import "RNFBPreferences.h"
#import "RNFBSharedUtils.h"

@interface RNFBSharedUtilsConfigFacadeTests : XCTestCase
@end

@implementation RNFBSharedUtilsConfigFacadeTests

- (void)tearDown {
  [[RNFBPreferences shared] remove:@"__rnfb_config_facade_prefs__"];
  [[RNFBPreferences shared] remove:@"__rnfb_config_facade_bool__"];
  [[RNFBPreferences shared] remove:@"__rnfb_config_facade_json_lose__"];
  [super tearDown];
}

- (void)testFacadeConfigContainsViaPreferences {
  NSString *key = @"__rnfb_config_facade_prefs__";
  XCTAssertFalse([RNFBSharedUtils configContains:key]);

  [[RNFBPreferences shared] setBooleanValue:key boolValue:YES];
  XCTAssertTrue([RNFBSharedUtils configContains:key]);
}

- (void)testFacadeGetConfigBooleanValuePreferencesWins {
  NSString *key = @"__rnfb_config_facade_bool__";
  [[RNFBPreferences shared] setBooleanValue:key boolValue:YES];

  XCTAssertTrue([RNFBSharedUtils getConfigBooleanValue:@"ConfigFacadeTests"
                                                   key:key
                                          defaultValue:NO]);
}

- (void)testFacadeGetConfigBooleanValueMetaPathUsesDefault {
  NSString *key = @"__rnfb_config_facade_missing_everywhere__";
  // Absent from Preferences / JSON / Meta → Meta path with passed-in defaultValue.
  XCTAssertFalse([RNFBSharedUtils getConfigBooleanValue:@"ConfigFacadeTests"
                                                    key:key
                                           defaultValue:NO]);
  XCTAssertTrue([RNFBSharedUtils getConfigBooleanValue:@"ConfigFacadeTests"
                                                   key:key
                                          defaultValue:YES]);
  XCTAssertFalse([RNFBSharedUtils configContains:key]);
}

- (void)testFacadeGetConfigBooleanValueJsonOverMeta {
  NSString *key = @"__rnfb_config_facade_json_win__";
  RNFBJSONImplementation *implementation =
      [[RNFBJSONImplementation alloc] initWithJSONObject:@{key : @YES}];

  // Temporarily swap the shared JSON implementation so the façade resolves JSON before Meta.
  RNFBJSON *shared = [RNFBJSON shared];
  id previous = [shared valueForKey:@"implementation"];
  [shared setValue:implementation forKey:@"implementation"];

  @try {
    XCTAssertFalse([[RNFBPreferences shared] contains:key]);
    XCTAssertTrue([RNFBSharedUtils configContains:key]);
    XCTAssertTrue([RNFBSharedUtils getConfigBooleanValue:@"ConfigFacadeTests"
                                                     key:key
                                            defaultValue:NO]);
  } @finally {
    [shared setValue:previous forKey:@"implementation"];
  }
}

- (void)testFacadePublicSelectorsUnchanged {
  XCTAssertTrue([RNFBSharedUtils respondsToSelector:@selector(configContains:)]);
  XCTAssertTrue(
      [RNFBSharedUtils respondsToSelector:@selector(getConfigBooleanValue:key:defaultValue:)]);

  NSMethodSignature *contains =
      [RNFBSharedUtils methodSignatureForSelector:@selector(configContains:)];
  XCTAssertEqual(strcmp(contains.methodReturnType, @encode(BOOL)), 0);

  NSMethodSignature *boolean = [RNFBSharedUtils
      methodSignatureForSelector:@selector(getConfigBooleanValue:key:defaultValue:)];
  XCTAssertEqual(strcmp(boolean.methodReturnType, @encode(BOOL)), 0);
}

@end
