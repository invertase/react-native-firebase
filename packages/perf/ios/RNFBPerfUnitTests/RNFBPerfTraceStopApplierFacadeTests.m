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

@interface RNFBPerfTraceStopApplierFacadeStub : NSObject <RNFBPerfTraceApplying>
@property(nonatomic, strong) NSMutableArray<NSDictionary *> *calls;
@end

@implementation RNFBPerfTraceStopApplierFacadeStub
- (instancetype)init {
  self = [super init];
  if (self) {
    _calls = [NSMutableArray array];
  }
  return self;
}

- (void)setIntValue:(int64_t)value forMetric:(NSString *)metricName {
  [self.calls addObject:@{@"kind" : @"metric", @"name" : metricName, @"value" : @(value)}];
}

- (void)setValue:(NSString *)value forAttribute:(NSString *)attributeName {
  [self.calls addObject:@{@"kind" : @"attribute", @"name" : attributeName, @"value" : value}];
}
@end

@interface RNFBPerfTraceStopApplierFacadeTests : XCTestCase
@end

@implementation RNFBPerfTraceStopApplierFacadeTests

- (void)testObjCSelectorAppliesMetricsThenAttributes {
  RNFBPerfTraceStopApplierFacadeStub *stub = [[RNFBPerfTraceStopApplierFacadeStub alloc] init];
  NSDictionary *metrics = @{@"m1" : @11};
  NSDictionary *attributes = @{@"a1" : @"v1"};

  [RNFBPerfTraceStopApplier applyMetrics:metrics attributes:attributes to:stub];

  XCTAssertEqual(stub.calls.count, 2u);
  XCTAssertEqualObjects(stub.calls[0][@"kind"], @"metric");
  XCTAssertEqualObjects(stub.calls[0][@"name"], @"m1");
  XCTAssertEqualObjects(stub.calls[0][@"value"], @11);
  XCTAssertEqualObjects(stub.calls[1][@"kind"], @"attribute");
  XCTAssertEqualObjects(stub.calls[1][@"name"], @"a1");
  XCTAssertEqualObjects(stub.calls[1][@"value"], @"v1");
}

- (void)testObjCSelectorNilDictionariesAreNoOps {
  RNFBPerfTraceStopApplierFacadeStub *stub = [[RNFBPerfTraceStopApplierFacadeStub alloc] init];
  [RNFBPerfTraceStopApplier applyMetrics:nil attributes:nil to:stub];
  XCTAssertEqual(stub.calls.count, 0u);
}

- (void)testFacadePublicSelectorUnchanged {
  XCTAssertTrue([RNFBPerfTraceStopApplier respondsToSelector:@selector(applyMetrics:
                                                                         attributes:to:)]);
}

@end
