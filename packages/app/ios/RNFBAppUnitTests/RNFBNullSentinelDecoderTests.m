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
 *
 */

#import <XCTest/XCTest.h>

#import "RNFBNullSentinelDecoder.h"

@interface RNFBNullSentinelDecoderTests : XCTestCase
@end

@implementation RNFBNullSentinelDecoderTests

- (NSDictionary *)nullSentinel {
  return @{@"__rnfbNull" : @YES};
}

- (NSDictionary *)serverTimestamp {
  return @{@".sv" : @"timestamp"};
}

#pragma mark - Non-container values

- (void)testDecode_nil_returnsNil {
  XCTAssertNil([RNFBNullSentinelDecoder decodeNullSentinels:nil]);
}

- (void)testDecode_string_returnedAsIs {
  NSString *value = @"hello";
  XCTAssertTrue([RNFBNullSentinelDecoder decodeNullSentinels:value] == value);
}

- (void)testDecode_number_returnedAsIs {
  NSNumber *value = @42;
  XCTAssertTrue([RNFBNullSentinelDecoder decodeNullSentinels:value] == value);
}

- (void)testDecode_NSNull_returnedAsIs {
  NSNull *value = [NSNull null];
  XCTAssertTrue([RNFBNullSentinelDecoder decodeNullSentinels:value] == value);
}

#pragma mark - Root dictionary

- (void)testDecode_rootSentinel_returnsNSNull {
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:[self nullSentinel]],
                        [NSNull null]);
}

- (void)testDecode_rootSentinelFalse_notTreatedAsSentinel {
  NSDictionary *input = @{@"__rnfbNull" : @NO};
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];

  XCTAssertEqualObjects(decoded, input);
  XCTAssertTrue([decoded isKindOfClass:[NSMutableDictionary class]]);
}

- (void)testDecode_rootSentinelKeyWithExtraKeys_notTreatedAsSentinel {
  NSDictionary *input = @{@"__rnfbNull" : @YES, @"other" : @1};

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_rootServerValue_unchanged {
  NSDictionary *input = [self serverTimestamp];

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_rootEmptyDictionary_returnsEmptyMutableDictionary {
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:@{}];

  XCTAssertEqualObjects(decoded, @{});
  XCTAssertTrue([decoded isKindOfClass:[NSMutableDictionary class]]);
}

- (void)testDecode_rootDictionary_returnsNewMutableCopy {
  NSDictionary *input = @{@"a" : @"b"};
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];

  XCTAssertEqualObjects(decoded, input);
  XCTAssertTrue(decoded != input);
  XCTAssertTrue([decoded isKindOfClass:[NSMutableDictionary class]]);
}

- (void)testDecode_dictionaryValues_sentinelBecomesNSNullAndPrimitivesPreserved {
  NSDictionary *input = @{
    @"nullValue" : [self nullSentinel],
    @"string" : @"text",
    @"number" : @7,
    @"existingNull" : [NSNull null],
    @"timestamp" : [self serverTimestamp]
  };
  NSDictionary *expected = @{
    @"nullValue" : [NSNull null],
    @"string" : @"text",
    @"number" : @7,
    @"existingNull" : [NSNull null],
    @"timestamp" : [self serverTimestamp]
  };

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], expected);
}

- (void)testDecode_nestedDictionary_sentinelDecodedAtDepth {
  NSDictionary *input = @{
    @"outer" : @{
      @"inner" : @{@"deep" : [self nullSentinel], @"keep" : @"value"},
      @"sibling" : [self nullSentinel]
    }
  };
  NSDictionary *expected = @{
    @"outer" :
        @{@"inner" : @{@"deep" : [NSNull null], @"keep" : @"value"}, @"sibling" : [NSNull null]}
  };
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];

  XCTAssertEqualObjects(decoded, expected);
  XCTAssertTrue([decoded[@"outer"] isKindOfClass:[NSMutableDictionary class]]);
  XCTAssertTrue([decoded[@"outer"][@"inner"] isKindOfClass:[NSMutableDictionary class]]);
}

- (void)testDecode_nestedDictionaryWithSentinelKeyAndExtraKeys_unchanged {
  NSDictionary *input = @{@"child" : @{@"__rnfbNull" : @YES, @"other" : @"x"}};

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_nestedSentinelFalse_unchanged {
  NSDictionary *input = @{@"child" : @{@"__rnfbNull" : @NO}};

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_nestedEmptyDictionary_preserved {
  NSDictionary *input = @{@"child" : @{}};

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

#pragma mark - Non-NSNumber sentinel flag

- (void)testDecode_rootSentinelNumberOne_decodedToNSNull {
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:@{@"__rnfbNull" : @(1)}],
                        [NSNull null]);
}

- (void)testDecode_rootSentinelFlagNSNull_unchangedWithoutCrash {
  NSDictionary *input = @{@"__rnfbNull" : [NSNull null]};
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];

  XCTAssertEqualObjects(decoded, input);
  XCTAssertTrue([decoded isKindOfClass:[NSMutableDictionary class]]);
}

- (void)testDecode_rootSentinelFlagDictionary_unchangedWithoutCrash {
  NSDictionary *input = @{@"__rnfbNull" : @{@"a" : @1}};

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_rootSentinelFlagArray_unchangedWithoutCrash {
  NSDictionary *input = @{@"__rnfbNull" : @[ @1 ]};

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_rootSentinelFlagString_unchanged {
  // JS only ever sends a boolean true; strings are not sentinels (strict NSNumber check).
  NSDictionary *input = @{@"__rnfbNull" : @"true"};

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_nestedSentinelFlagNonNumber_unchangedInDictionary {
  NSDictionary *input = @{
    @"nullFlag" : @{@"__rnfbNull" : [NSNull null]},
    @"dictFlag" : @{@"__rnfbNull" : @{@"a" : @1}},
    @"arrayFlag" : @{@"__rnfbNull" : @[ @1 ]},
    @"stringFlag" : @{@"__rnfbNull" : @"true"}
  };

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_nestedSentinelFlagNonNumber_unchangedInArray {
  NSArray *input = @[
    @{@"__rnfbNull" : [NSNull null]}, @{@"__rnfbNull" : @{@"a" : @1}}, @{@"__rnfbNull" : @[ @1 ]},
    @{@"__rnfbNull" : @"true"}
  ];
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];

  XCTAssertEqualObjects(decoded, input);
  XCTAssertTrue([decoded isKindOfClass:[NSMutableArray class]]);
}

- (void)testDecode_validSentinelSiblingDecodedWhileNonNumberFlagPassesThrough {
  NSDictionary *input = @{
    @"valid" : [self nullSentinel],
    @"guarded" : @{@"__rnfbNull" : [NSNull null]},
    @"list" : @[ [self nullSentinel], @{@"__rnfbNull" : @[ @1 ]} ]
  };
  NSDictionary *expected = @{
    @"valid" : [NSNull null],
    @"guarded" : @{@"__rnfbNull" : [NSNull null]},
    @"list" : @[ [NSNull null], @{@"__rnfbNull" : @[ @1 ]} ]
  };

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], expected);
}

#pragma mark - Arrays

- (void)testDecode_rootArray_decodesSentinelsAndPreservesOtherElements {
  NSArray *input = @[
    [self nullSentinel], [NSNull null], @"text", @3, [self serverTimestamp],
    @{@"key" : [self nullSentinel]}
  ];
  NSArray *expected = @[
    [NSNull null], [NSNull null], @"text", @3, [self serverTimestamp], @{@"key" : [NSNull null]}
  ];
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];

  XCTAssertEqualObjects(decoded, expected);
  XCTAssertTrue([decoded isKindOfClass:[NSMutableArray class]]);
  XCTAssertTrue(decoded != input);
}

- (void)testDecode_rootEmptyArray_returnsEmptyMutableArray {
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:@[]];

  XCTAssertEqualObjects(decoded, @[]);
  XCTAssertTrue([decoded isKindOfClass:[NSMutableArray class]]);
}

- (void)testDecode_nestedArrays_sentinelsDecodedAtEveryLevel {
  NSArray *input = @[ @[ [self nullSentinel], @[ [self nullSentinel], @"leaf" ] ], @[] ];
  NSArray *expected = @[ @[ [NSNull null], @[ [NSNull null], @"leaf" ] ], @[] ];
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];

  XCTAssertEqualObjects(decoded, expected);
  XCTAssertTrue([decoded[0] isKindOfClass:[NSMutableArray class]]);
  XCTAssertTrue([decoded[0][1] isKindOfClass:[NSMutableArray class]]);
}

- (void)testDecode_arrayInsideDictionary_sentinelsDecoded {
  NSDictionary *input = @{@"list" : @[ [self nullSentinel], @"x", @[ [self nullSentinel] ] ]};
  NSDictionary *expected = @{@"list" : @[ [NSNull null], @"x", @[ [NSNull null] ] ]};
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];

  XCTAssertEqualObjects(decoded, expected);
  XCTAssertTrue([decoded[@"list"] isKindOfClass:[NSMutableArray class]]);
}

- (void)testDecode_dictionariesInsideArraysInsideDictionaries_decoded {
  NSDictionary *input = @{
    @"items" : @[
      @{@"id" : @1, @"note" : [self nullSentinel]},
      @{@"id" : @2, @"tags" : @[ [self nullSentinel] ]}
    ]
  };
  NSDictionary *expected = @{
    @"items" :
        @[ @{@"id" : @1, @"note" : [NSNull null]}, @{@"id" : @2, @"tags" : @[ [NSNull null] ]} ]
  };

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], expected);
}

#pragma mark - BRDA matrix (compound / short-circuit arms)

// Line 41: `!isDict && !isArray` — both polarities of each operand.
- (void)testDecode_line41_notDictNotArray_returnsPrimitive {
  NSDate *date = [NSDate dateWithTimeIntervalSince1970:0];
  NSData *data = [NSData data];
  XCTAssertTrue([RNFBNullSentinelDecoder decodeNullSentinels:date] == date);
  XCTAssertTrue([RNFBNullSentinelDecoder decodeNullSentinels:data] == data);
}

- (void)testDecode_line41_notDictIsArray_doesNotEarlyReturn {
  NSArray *input = @[ @1 ];
  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:input];
  XCTAssertEqualObjects(decoded, input);
  XCTAssertTrue([decoded isKindOfClass:[NSMutableArray class]]);
  XCTAssertTrue(decoded != input);
}

- (void)testDecode_line41_isDict_shortCircuitsSecondCheck {
  NSDictionary *input = @{@"k" : @"v"};
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

// Line 49: `count == 1 && isNumber && boolValue` — each && operand true and false.
- (void)testDecode_line49_countNotOne_shortCircuits {
  NSDictionary *input = @{@"__rnfbNull" : @YES, @"extra" : @0};
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_line49_countOneNonNumber_shortCircuitsBoolValue {
  NSDictionary *input = @{@"__rnfbNull" : @"yes"};
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_line49_countOneNumberFalse_notSentinel {
  NSDictionary *nestedFalse = @{@"__rnfbNull" : @NO};
  NSDictionary *nestedZero = @{@"__rnfbNull" : @(0)};
  NSDictionary *input = @{@"a" : nestedFalse, @"b" : nestedZero};
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

- (void)testDecode_line49_countOneNumberTrue_isSentinel {
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:@{@"__rnfbNull" : @YES}],
                        [NSNull null]);
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:@{@"__rnfbNull" : @(1)}],
                        [NSNull null]);
}

// Line 93: `isDict && isNullSentinel(root)` — array skips sentinel check; dict takes both.
- (void)testDecode_line93_rootArray_skipsSentinelCheck {
  NSArray *input = @[ [self nullSentinel], @NO ];
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input],
                        (@[ [NSNull null], @NO ]));
}

- (void)testDecode_line93_rootDictSentinel_returnsNSNull {
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:[self nullSentinel]],
                        [NSNull null]);
}

- (void)testDecode_line93_rootDictNotSentinel_continues {
  NSDictionary *input = @{@"keep" : @1};
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], input);
}

// Line 100: root mutable is dict vs array (else).
- (void)testDecode_line100_rootMutableDictionaryAndArray {
  id dictDecoded = [RNFBNullSentinelDecoder decodeNullSentinels:@{@"a" : @1}];
  id arrayDecoded = [RNFBNullSentinelDecoder decodeNullSentinels:@[ @1, @2 ]];
  XCTAssertTrue([dictDecoded isKindOfClass:[NSMutableDictionary class]]);
  XCTAssertTrue([arrayDecoded isKindOfClass:[NSMutableArray class]]);
}

// Lines 70 / 83 / 120: child is-array vs primitive; parent dict vs array; frame dict vs array.
- (void)testDecode_lines70_83_120_childAndParentTypeMatrix {
  NSDictionary *input = @{
    @"dictChild" : @{@"k" : @1},
    @"arrayChild" : @[ @"leaf", @[ @2 ], [self nullSentinel], [NSNull null] ],
    @"primitiveChild" : @"text",
    @"nullChild" : [NSNull null]
  };
  NSArray *arrayRoot = @[
    @{@"inner" : [self nullSentinel]}, @[ @"nested" ], @3, [self nullSentinel], [NSNull null]
  ];

  NSDictionary *expectedDict = @{
    @"dictChild" : @{@"k" : @1},
    @"arrayChild" : @[ @"leaf", @[ @2 ], [NSNull null], [NSNull null] ],
    @"primitiveChild" : @"text",
    @"nullChild" : [NSNull null]
  };
  NSArray *expectedArray =
      @[ @{@"inner" : [NSNull null]}, @[ @"nested" ], @3, [NSNull null], [NSNull null] ];

  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:input], expectedDict);
  XCTAssertEqualObjects([RNFBNullSentinelDecoder decodeNullSentinels:arrayRoot], expectedArray);
}

#pragma mark - Depth

- (void)testDecode_deeplyNestedDictionaries_decodedWithoutRecursion {
  const NSUInteger depth = 1000;
  id leaf = @{@"value" : [self nullSentinel]};
  for (NSUInteger i = 0; i < depth; i++) {
    leaf = @{@"child" : leaf};
  }

  id decoded = [RNFBNullSentinelDecoder decodeNullSentinels:leaf];

  // Walk iteratively; recursive isEqual on this depth is what the decoder avoids.
  id cursor = decoded;
  for (NSUInteger i = 0; i < depth; i++) {
    XCTAssertTrue([cursor isKindOfClass:[NSMutableDictionary class]]);
    cursor = cursor[@"child"];
  }
  XCTAssertEqualObjects(cursor[@"value"], [NSNull null]);
}

@end
