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

#import "FirebaseCore/FirebaseCore.h"
#import "RCTConvert+FIROptions.h"

@interface RCTConvertFIROptionsFacadeTests : XCTestCase
@end

@implementation RCTConvertFIROptionsFacadeTests

- (void)testFacadeConvertRawOptionsMapsFieldsAndBundleID {
  NSDictionary *raw = @{
    @"appId" : @"app-id",
    @"messagingSenderId" : @"sender-id",
    @"apiKey" : @"api-key",
    @"projectId" : @"project-id",
    @"clientId" : @"client-id",
    @"databaseURL" : @"https://example.firebaseio.com",
    @"storageBucket" : @"example.appspot.com",
  };

  FIROptions *options = [RCTConvert convertRawOptions:raw];
  NSString *expectedBundleID =
      [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleIdentifier"];

  XCTAssertEqualObjects(options.googleAppID, @"app-id");
  XCTAssertEqualObjects(options.GCMSenderID, @"sender-id");
  XCTAssertEqualObjects(options.APIKey, @"api-key");
  XCTAssertEqualObjects(options.projectID, @"project-id");
  XCTAssertEqualObjects(options.clientID, @"client-id");
  XCTAssertEqualObjects(options.databaseURL, @"https://example.firebaseio.com");
  XCTAssertEqualObjects(options.storageBucket, @"example.appspot.com");
  XCTAssertEqualObjects(options.bundleID, expectedBundleID);
}

- (void)testFacadePublicSelectorsUnchanged {
  XCTAssertTrue([RCTConvert respondsToSelector:@selector(convertRawOptions:)]);
  XCTAssertTrue([RCTConvert respondsToSelector:@selector(FIROptions:)]);
}

@end
