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
#import "RNFBPreferences.h"

@interface RNFBPreferencesTests : XCTestCase
@property(nonatomic, strong) NSString *domainIdentifier;
@property(nonatomic, strong) NSUserDefaults *userDefaults;
@property(nonatomic, strong) RNFBPreferences *preferences;
@end

@implementation RNFBPreferencesTests

- (void)setUp {
  [super setUp];
  self.domainIdentifier =
      [@"io.invertase.firebase.tests." stringByAppendingString:NSUUID.UUID.UUIDString];
  self.userDefaults = [[NSUserDefaults alloc] initWithSuiteName:self.domainIdentifier];
  [self.userDefaults removePersistentDomainForName:self.domainIdentifier];
  RNFBPreferencesStorage *storage =
      [[RNFBPreferencesStorage alloc] initWithUserDefaults:self.userDefaults
                                          domainIdentifier:self.domainIdentifier];
  self.preferences = [[RNFBPreferences alloc] init];
  [self.preferences setValue:storage forKey:@"storage"];
}

- (void)tearDown {
  [self.userDefaults removePersistentDomainForName:self.domainIdentifier];
  self.preferences = nil;
  self.userDefaults = nil;
  self.domainIdentifier = nil;
  [super tearDown];
}

- (void)testSharedIsAvailableAndStable {
  XCTAssertNotNil(RNFBPreferences.shared);
  XCTAssertIdentical(RNFBPreferences.shared, RNFBPreferences.shared);
}

- (void)testPublicSelectorsAndIntegerWidthsAreUnchanged {
  NSArray<NSString *> *selectorNames = @[
    @"contains:",
    @"getBooleanValue:defaultValue:",
    @"setBooleanValue:boolValue:",
    @"setIntegerValue:integerValue:",
    @"setStringValue:stringValue:",
    @"getStringValue:defaultValue:",
    @"getIntegerValue:defaultValue:",
    @"getAll",
    @"clearAll",
    @"remove:",
  ];
  for (NSString *selectorName in selectorNames) {
    XCTAssertTrue([self.preferences respondsToSelector:NSSelectorFromString(selectorName)]);
  }

  NSMethodSignature *setter =
      [RNFBPreferences instanceMethodSignatureForSelector:@selector(setIntegerValue:integerValue:)];
  XCTAssertEqual(strcmp([setter getArgumentTypeAtIndex:3], @encode(NSInteger)), 0);

  NSMethodSignature *getter =
      [RNFBPreferences instanceMethodSignatureForSelector:@selector(getIntegerValue:defaultValue:)];
  XCTAssertEqual(strcmp(getter.methodReturnType, @encode(NSInteger)), 0);
  XCTAssertEqual(strcmp([getter getArgumentTypeAtIndex:3], @encode(NSInteger)), 0);
}

- (void)testFacadeForwardsEveryPreferenceOperation {
  XCTAssertFalse([self.preferences contains:@"missing"]);
  XCTAssertTrue([self.preferences getBooleanValue:@"missing" defaultValue:YES]);
  XCTAssertEqual([self.preferences getIntegerValue:@"missing" defaultValue:NSIntegerMax],
                 NSIntegerMax);
  XCTAssertEqualObjects([self.preferences getStringValue:@"missing" defaultValue:@"fallback"],
                        @"fallback");

  [self.preferences setBooleanValue:@"bool" boolValue:YES];
  [self.preferences setIntegerValue:@"integer" integerValue:NSIntegerMax];
  [self.preferences setStringValue:@"string" stringValue:@"value"];

  XCTAssertTrue([self.preferences contains:@"bool"]);
  XCTAssertTrue([self.preferences getBooleanValue:@"bool" defaultValue:NO]);
  XCTAssertEqual([self.preferences getIntegerValue:@"integer" defaultValue:0], NSIntegerMax);
  XCTAssertEqualObjects([self.preferences getStringValue:@"string" defaultValue:@"fallback"],
                        @"value");
  XCTAssertEqualObjects([self.preferences getAll][@"string"], @"value");

  [self.preferences remove:@"bool"];
  XCTAssertFalse([self.preferences contains:@"bool"]);

  [self.preferences clearAll];
  XCTAssertFalse([self.preferences contains:@"integer"]);
  XCTAssertFalse([self.preferences contains:@"string"]);
}

@end
