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
#import "RNFBAppModule.h"
#import "RNFBHandleMapStorage-Swift.inc"

@interface RNFBAppLogLevelFacadeTests : XCTestCase
@end

@implementation RNFBAppLogLevelFacadeTests

- (void)tearDown {
  [FIRConfiguration resetForTesting];
  [super tearDown];
}

- (void)testSetLogLevelAppliesVerboseAsDebug {
  RNFBAppModule *module = [[RNFBAppModule alloc] init];
  [module setLogLevel:@"verbose"];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelDebug);
}

- (void)testSetLogLevelAppliesDebug {
  RNFBAppModule *module = [[RNFBAppModule alloc] init];
  [module setLogLevel:@"debug"];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelDebug);
}

- (void)testSetLogLevelAppliesInfo {
  RNFBAppModule *module = [[RNFBAppModule alloc] init];
  [module setLogLevel:@"info"];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelInfo);
}

- (void)testSetLogLevelAppliesWarn {
  RNFBAppModule *module = [[RNFBAppModule alloc] init];
  [module setLogLevel:@"warn"];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelWarning);
}

- (void)testSetLogLevelAppliesUnknownAsError {
  RNFBAppModule *module = [[RNFBAppModule alloc] init];
  [module setLogLevel:@"silent"];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelError);
}

- (void)testSetLogLevelAppliesNilAsError {
  RNFBAppModule *module = [[RNFBAppModule alloc] init];
  [module setLogLevel:nil];
  XCTAssertEqual([FIRConfiguration sharedInstance].loggerLevel, FIRLoggerLevelError);
}

- (void)testFacadePublicSelectorUnchanged {
  XCTAssertTrue([RNFBAppModule instancesRespondToSelector:@selector(setLogLevel:)]);
  NSMethodSignature *signature =
      [RNFBAppModule instanceMethodSignatureForSelector:@selector(setLogLevel:)];
  XCTAssertEqual(strcmp(signature.methodReturnType, @encode(void)), 0);
}

@end
