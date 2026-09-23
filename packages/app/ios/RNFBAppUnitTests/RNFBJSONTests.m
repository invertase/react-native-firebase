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

@interface RNFBJSONTests : XCTestCase
@end

@implementation RNFBJSONTests

- (RNFBJSON *)jsonWithObject:(NSObject *)object {
  RNFBJSON *json = [[RNFBJSON alloc] init];
  RNFBJSONImplementation *implementation =
      [[RNFBJSONImplementation alloc] initWithJSONObject:object];
  [json setValue:implementation forKey:@"implementation"];
  return json;
}

- (void)testSharedUsesStableDispatchOnceIdentity {
  RNFBJSON *first = RNFBJSON.shared;
  XCTAssertNotNil(first);
  XCTAssertIdentical(first, RNFBJSON.shared);
}

- (void)testPublicSelectorsAndReturnEncodingsAreUnchanged {
  NSArray<NSString *> *selectorNames = @[
    @"contains:",
    @"getBooleanValue:defaultValue:",
    @"getStringValue:defaultValue:",
    @"getArrayValue:defaultValue:",
    @"getAll",
    @"getRawJSON",
  ];
  for (NSString *selectorName in selectorNames) {
    XCTAssertTrue([[RNFBJSON shared] respondsToSelector:NSSelectorFromString(selectorName)]);
  }
  XCTAssertTrue([RNFBJSON respondsToSelector:@selector(shared)]);

  NSMethodSignature *contains = [RNFBJSON instanceMethodSignatureForSelector:@selector(contains:)];
  XCTAssertEqual(strcmp(contains.methodReturnType, @encode(BOOL)), 0);
  NSMethodSignature *boolean =
      [RNFBJSON instanceMethodSignatureForSelector:@selector(getBooleanValue:defaultValue:)];
  XCTAssertEqual(strcmp(boolean.methodReturnType, @encode(BOOL)), 0);
  XCTAssertEqual(strcmp([boolean getArgumentTypeAtIndex:3], @encode(BOOL)), 0);

  NSArray<NSString *> *objectReturnSelectors = @[
    @"getStringValue:defaultValue:", @"getArrayValue:defaultValue:", @"getAll", @"getRawJSON"
  ];
  for (NSString *selectorName in objectReturnSelectors) {
    NSMethodSignature *signature =
        [RNFBJSON instanceMethodSignatureForSelector:NSSelectorFromString(selectorName)];
    XCTAssertEqual(strcmp(signature.methodReturnType, @encode(id)), 0);
  }
  NSMethodSignature *shared = [RNFBJSON methodSignatureForSelector:@selector(shared)];
  XCTAssertEqual(strcmp(shared.methodReturnType, @encode(id)), 0);
}

- (void)testFacadePreservesKVCContainsDefaultsAndUncheckedObjectReturns {
  NSDictionary *dictionary = @{
    @"boolean" : @YES,
    @"booleanFalse" : @NO,
    @"numericZero" : @0,
    @"booleanString" : @"YES",
    @"string" : @"value",
    @"array" : @[ @"one" ],
    @"numberAsString" : @42,
    @"stringAsArray" : @"unchecked",
    @"null" : NSNull.null,
    @"count" : @"count value",
    @"@count" : @"at-count value",
  };
  RNFBJSON *json = [self jsonWithObject:dictionary];

  XCTAssertTrue([json contains:@"boolean"]);
  XCTAssertTrue([json contains:@"booleanFalse"]);
  XCTAssertTrue([json contains:@"numericZero"]);
  XCTAssertTrue([json contains:@"null"]);
  XCTAssertFalse([json contains:@"missing"]);
  XCTAssertTrue([json getBooleanValue:@"boolean" defaultValue:NO]);
  XCTAssertFalse([json getBooleanValue:@"booleanFalse" defaultValue:YES]);
  XCTAssertFalse([json getBooleanValue:@"numericZero" defaultValue:YES]);
  XCTAssertTrue([json getBooleanValue:@"booleanString" defaultValue:NO]);
  XCTAssertTrue([json getBooleanValue:@"missing" defaultValue:YES]);
  XCTAssertEqualObjects([json getStringValue:@"missing" defaultValue:@"fallback"], @"fallback");
  XCTAssertEqualObjects([json getArrayValue:@"missing" defaultValue:@[ @"fallback" ]],
                        (@[ @"fallback" ]));
  XCTAssertEqualObjects([json getStringValue:@"string" defaultValue:@"fallback"], @"value");
  XCTAssertEqualObjects([json getArrayValue:@"array" defaultValue:@[]], (@[ @"one" ]));

  id uncheckedString = [json getStringValue:@"numberAsString" defaultValue:@"fallback"];
  id uncheckedArray = [json getArrayValue:@"stringAsArray" defaultValue:@[]];
  XCTAssertEqualObjects(uncheckedString, @42);
  XCTAssertEqualObjects(uncheckedArray, @"unchecked");
  XCTAssertIdentical([json getStringValue:@"null" defaultValue:@"fallback"], NSNull.null);

  for (NSString *key in @[ @"count", @"@count" ]) {
    XCTAssertEqualObjects([json getStringValue:key defaultValue:@"fallback"],
                          [dictionary valueForKey:key]);
    XCTAssertEqual([json contains:key], [dictionary valueForKey:key] != nil);
  }
}

- (void)testGetBooleanValueThrowsForNSNullArrayAndDictionaryReceivers {
  NSDictionary *dictionary = @{
    @"null" : NSNull.null,
    @"array" : @[ @"one" ],
    @"object" : @{@"nested" : @"value"},
  };
  RNFBJSON *json = [self jsonWithObject:dictionary];

  XCTAssertThrowsSpecificNamed([json getBooleanValue:@"null" defaultValue:YES], NSException,
                               NSInvalidArgumentException);
  XCTAssertThrowsSpecificNamed([json getBooleanValue:@"array" defaultValue:YES], NSException,
                               NSInvalidArgumentException);
  XCTAssertThrowsSpecificNamed([json getBooleanValue:@"object" defaultValue:YES], NSException,
                               NSInvalidArgumentException);

  @try {
    [json getBooleanValue:@"null" defaultValue:YES];
    XCTFail(@"expected NSNull boolValue to throw");
  } @catch (NSException *exception) {
    XCTAssertEqualObjects(exception.name, NSInvalidArgumentException);
    XCTAssertTrue([exception.reason containsString:@"boolValue"]);
  }
}

- (void)testGetAllCopiesItemsAndReturnsIndependentImmutableSnapshot {
  NSMutableString *mutableString = [NSMutableString stringWithString:@"before"];
  NSMutableArray *mutableArray = [NSMutableArray arrayWithObject:@"first"];
  NSDictionary *source = @{@"string" : mutableString, @"array" : mutableArray};
  RNFBJSON *json = [self jsonWithObject:source];

  NSDictionary *snapshot = [json getAll];

  XCTAssertNotIdentical(snapshot, source);
  XCTAssertNotIdentical(snapshot[@"string"], mutableString);
  XCTAssertNotIdentical(snapshot[@"array"], mutableArray);
  [mutableString appendString:@"-after"];
  [mutableArray addObject:@"second"];
  XCTAssertEqualObjects(snapshot[@"string"], @"before");
  XCTAssertEqualObjects(snapshot[@"array"], (@[ @"first" ]));
}

- (void)testGetAllPreservesNonDictionaryExceptionBehavior {
  RNFBJSON *json = [self jsonWithObject:@[ @"valid", @"JSON", @"array" ]];

  XCTAssertThrowsSpecificNamed([json getAll], NSException, NSInvalidArgumentException);
}

- (void)testRawFacadeUsesCurrentBundleValueAndSwiftDecoder {
  NSString *raw = [[NSBundle mainBundle].infoDictionary valueForKey:@"firebase_json_raw"];
  XCTAssertEqualObjects([RNFBJSON.shared getRawJSON],
                        [RNFBJSONImplementation rawJSONFromRawValue:raw]);
}

@end
