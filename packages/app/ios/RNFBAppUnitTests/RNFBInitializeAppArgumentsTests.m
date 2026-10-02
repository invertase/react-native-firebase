/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

#import "RNFBInitializeAppArguments.h"

@interface RNFBInitializeAppArgumentsTests : XCTestCase
@end

@implementation RNFBInitializeAppArgumentsTests

- (NSDictionary *)nullSentinel {
  return @{@"__rnfbNull" : @YES};
}

- (NSDictionary *)requiredOptions {
  return @{
    @"apiKey" : @"key",
    @"appId" : @"1:123:ios:abc",
    @"messagingSenderId" : @"123",
    @"projectId" : @"project",
  };
}

- (NSDictionary *)optionsByAdding:(NSDictionary *)extra {
  NSMutableDictionary *options = [[self requiredOptions] mutableCopy];
  [options addEntriesFromDictionary:extra];
  return options;
}

#pragma mark - normalizedOptions: optional string keys

- (void)testOptions_sentinelIosBundleId_isDropped {
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedOptions:[self optionsByAdding:@{@"iosBundleId" : [self nullSentinel]}]];
  XCTAssertNil(result[@"iosBundleId"]);
  XCTAssertFalse([result.allKeys containsObject:@"iosBundleId"]);
}

- (void)testOptions_sentinelIosClientId_isDropped {
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedOptions:[self optionsByAdding:@{@"iosClientId" : [self nullSentinel]}]];
  XCTAssertFalse([result.allKeys containsObject:@"iosClientId"]);
}

- (void)testOptions_sentinelAppGroupId_isDropped {
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedOptions:[self optionsByAdding:@{@"appGroupId" : [self nullSentinel]}]];
  XCTAssertFalse([result.allKeys containsObject:@"appGroupId"]);
}

- (void)testOptions_sentinelAuthDomain_isDropped {
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedOptions:[self optionsByAdding:@{@"authDomain" : [self nullSentinel]}]];
  XCTAssertNil(result[@"authDomain"]);
  XCTAssertFalse([result.allKeys containsObject:@"authDomain"]);
}

- (void)testOptions_sentinelDatabaseUrlAndStorageBucket_areDropped {
  NSDictionary *result = [RNFBInitializeAppArguments normalizedOptions:[self optionsByAdding:@{
                                                       @"databaseURL" : [self nullSentinel],
                                                       @"storageBucket" : [self nullSentinel]
                                                     }]];
  XCTAssertFalse([result.allKeys containsObject:@"databaseURL"]);
  XCTAssertFalse([result.allKeys containsObject:@"storageBucket"]);
}

- (void)testOptions_plainNSNullOptionalKey_isDropped {
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedOptions:[self optionsByAdding:@{@"iosBundleId" : [NSNull null]}]];
  XCTAssertFalse([result.allKeys containsObject:@"iosBundleId"]);
}

- (void)testOptions_allOptionalKeysNull_onlyRequiredKeysRemain {
  NSDictionary *result = [RNFBInitializeAppArguments normalizedOptions:[self optionsByAdding:@{
                                                       @"databaseURL" : [self nullSentinel],
                                                       @"storageBucket" : [self nullSentinel],
                                                       @"iosBundleId" : [self nullSentinel],
                                                       @"iosClientId" : [self nullSentinel],
                                                       @"appGroupId" : [self nullSentinel],
                                                       @"authDomain" : [self nullSentinel]
                                                     }]];
  XCTAssertEqualObjects(result, [self requiredOptions]);
}

#pragma mark - normalizedOptions: values that must survive

- (void)testOptions_realStrings_areUnchanged {
  NSDictionary *input = [self optionsByAdding:@{
    @"databaseURL" : @"https://db.firebaseio.com",
    @"storageBucket" : @"bucket.appspot.com",
    @"iosBundleId" : @"com.example.app",
    @"iosClientId" : @"client-id",
    @"appGroupId" : @"group.com.example",
    @"authDomain" : @"example.firebaseapp.com"
  }];
  XCTAssertEqualObjects([RNFBInitializeAppArguments normalizedOptions:input], input);
}

- (void)testOptions_nullOptionalKeyDoesNotAffectSiblingStrings {
  NSDictionary *result = [RNFBInitializeAppArguments normalizedOptions:[self optionsByAdding:@{
                                                       @"iosBundleId" : [self nullSentinel],
                                                       @"iosClientId" : @"client-id",
                                                       @"authDomain" : @"example.firebaseapp.com"
                                                     }]];
  XCTAssertFalse([result.allKeys containsObject:@"iosBundleId"]);
  XCTAssertEqualObjects(result[@"iosClientId"], @"client-id");
  XCTAssertEqualObjects(result[@"authDomain"], @"example.firebaseapp.com");
  XCTAssertEqualObjects(result[@"apiKey"], @"key");
}

// JS validates the required keys (apiKey, appId, projectId, ...) in registry/app.ts before
// calling native, so a null projectId never reaches here. This documents the normaliser contract
// only: required keys are not dropped.
- (void)testOptions_nonOptionalKeyWithNull_isLeftAsNSNull {
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedOptions:[self optionsByAdding:@{@"projectId" : [self nullSentinel]}]];
  XCTAssertEqualObjects(result[@"projectId"], [NSNull null]);
  XCTAssertEqualObjects(result[@"apiKey"], @"key");
}

- (void)testOptions_oneKeyDictionaryThatIsNotSentinel_isUnchanged {
  NSDictionary *input = @{@"apiKey" : @"key"};
  XCTAssertEqualObjects([RNFBInitializeAppArguments normalizedOptions:input], input);
}

- (void)testOptions_sentinelLookalikeValueForOptionalKey_isNotDropped {
  // {__rnfbNull: false} is not a sentinel, so the optional key keeps its (odd) value.
  NSDictionary *notSentinel = @{@"__rnfbNull" : @NO};
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedOptions:[self optionsByAdding:@{@"iosBundleId" : notSentinel}]];
  XCTAssertEqualObjects(result[@"iosBundleId"], notSentinel);
}

- (void)testOptions_nil_returnsNil {
  XCTAssertNil([RNFBInitializeAppArguments normalizedOptions:nil]);
}

- (void)testOptions_rootSentinel_returnsNil {
  XCTAssertNil([RNFBInitializeAppArguments normalizedOptions:[self nullSentinel]]);
}

- (void)testOptions_doesNotMutateInput {
  NSDictionary *input = [self optionsByAdding:@{@"iosBundleId" : [self nullSentinel]}];
  NSDictionary *copy = [input copy];
  (void)[RNFBInitializeAppArguments normalizedOptions:input];
  XCTAssertEqualObjects(input, copy);
}

#pragma mark - normalizedAppConfig:

- (void)testAppConfig_sentinelName_isDropped_andSentinelDataCollection_becomesNo {
  NSDictionary *result = [RNFBInitializeAppArguments normalizedAppConfig:@{
    @"name" : [self nullSentinel],
    @"automaticDataCollectionEnabled" : [self nullSentinel]
  }];
  XCTAssertEqual(result.count, 1u);
  XCTAssertNil(result[@"name"]);
  XCTAssertEqualObjects(result[@"automaticDataCollectionEnabled"], @NO);
}

- (void)testAppConfig_nsNullDataCollection_becomesNo {
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedAppConfig:@{@"automaticDataCollectionEnabled" : [NSNull null]}];
  XCTAssertEqualObjects(result[@"automaticDataCollectionEnabled"], @NO);
}

- (void)testAppConfig_omittedDataCollection_staysOmitted {
  NSDictionary *result = [RNFBInitializeAppArguments normalizedAppConfig:@{@"name" : @"secondary"}];
  XCTAssertNil(result[@"automaticDataCollectionEnabled"]);
}

- (void)testAppConfig_realValues_areUnchanged {
  NSDictionary *input = @{@"name" : @"secondary", @"automaticDataCollectionEnabled" : @YES};
  XCTAssertEqualObjects([RNFBInitializeAppArguments normalizedAppConfig:input], input);
}

- (void)testAppConfig_unknownKeyWithNull_isLeftAsNSNull {
  NSDictionary *result = [RNFBInitializeAppArguments
      normalizedAppConfig:@{@"name" : @"secondary", @"extra" : [self nullSentinel]}];
  XCTAssertEqualObjects(result[@"name"], @"secondary");
  XCTAssertEqualObjects(result[@"extra"], [NSNull null]);
}

- (void)testAppConfig_nil_returnsNil {
  XCTAssertNil([RNFBInitializeAppArguments normalizedAppConfig:nil]);
}

- (void)testAppConfig_rootSentinel_returnsNil {
  XCTAssertNil([RNFBInitializeAppArguments normalizedAppConfig:[self nullSentinel]]);
}

#pragma mark - automaticDataCollectionEnabledFromAppConfig:

- (void)testAutoDataCollection_yes_returnsYes {
  XCTAssertEqualObjects(
      [RNFBInitializeAppArguments
          automaticDataCollectionEnabledFromAppConfig:@{@"automaticDataCollectionEnabled" : @YES}],
      @YES);
}

- (void)testAutoDataCollection_explicitNo_returnsNo {
  // A pointer cast of @NO to BOOL was YES; the value must be read with boolValue.
  NSNumber *result = [RNFBInitializeAppArguments
      automaticDataCollectionEnabledFromAppConfig:@{@"automaticDataCollectionEnabled" : @NO}];
  XCTAssertNotNil(result);
  XCTAssertFalse([result boolValue]);
}

- (void)testAutoDataCollection_absentKey_returnsNil {
  XCTAssertNil([RNFBInitializeAppArguments
      automaticDataCollectionEnabledFromAppConfig:@{@"name" : @"secondary"}]);
}

- (void)testAutoDataCollection_nilAppConfig_returnsNil {
  XCTAssertNil([RNFBInitializeAppArguments automaticDataCollectionEnabledFromAppConfig:nil]);
}

- (void)testAutoDataCollection_NSNull_returnsNil {
  XCTAssertNil([RNFBInitializeAppArguments automaticDataCollectionEnabledFromAppConfig:@{
    @"automaticDataCollectionEnabled" : [NSNull null]
  }]);
}

- (void)testAutoDataCollection_sentinelNormalizedUpstream_returnsNo {
  NSDictionary *normalized = [RNFBInitializeAppArguments
      normalizedAppConfig:@{@"automaticDataCollectionEnabled" : [self nullSentinel]}];
  NSNumber *result =
      [RNFBInitializeAppArguments automaticDataCollectionEnabledFromAppConfig:normalized];
  XCTAssertNotNil(result);
  XCTAssertFalse([result boolValue]);
}

- (void)testAutoDataCollection_nonNumberValue_returnsNil {
  XCTAssertNil([RNFBInitializeAppArguments
      automaticDataCollectionEnabledFromAppConfig:@{@"automaticDataCollectionEnabled" : @"true"}]);
}

@end
