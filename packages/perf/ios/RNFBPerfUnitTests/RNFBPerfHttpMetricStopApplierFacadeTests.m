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

@interface RNFBPerfHttpMetricStopApplierFacadeStub : NSObject <RNFBPerfHttpMetricApplying>
@property(nonatomic, strong) NSMutableArray<NSDictionary *> *calls;
@end

@implementation RNFBPerfHttpMetricStopApplierFacadeStub
- (instancetype)init {
  self = [super init];
  if (self) {
    _calls = [NSMutableArray array];
  }
  return self;
}

- (void)setValue:(NSString *)value forAttribute:(NSString *)attributeName {
  [self.calls addObject:@{@"kind" : @"attribute", @"name" : attributeName, @"value" : value}];
}

- (void)setResponseCode:(NSInteger)responseCode {
  [self.calls addObject:@{@"kind" : @"responseCode", @"value" : @(responseCode)}];
}

- (void)setRequestPayloadSize:(NSInteger)bytes {
  [self.calls addObject:@{@"kind" : @"requestPayloadSize", @"value" : @(bytes)}];
}

- (void)setResponsePayloadSize:(NSInteger)bytes {
  [self.calls addObject:@{@"kind" : @"responsePayloadSize", @"value" : @(bytes)}];
}

- (void)setResponseContentType:(NSString *)contentType {
  [self.calls addObject:@{@"kind" : @"responseContentType", @"value" : contentType}];
}
@end

@interface RNFBPerfHttpMetricStopApplierFacadeTests : XCTestCase
@end

@implementation RNFBPerfHttpMetricStopApplierFacadeTests

- (void)testObjCSelectorAppliesAttributesThenOptionals {
  RNFBPerfHttpMetricStopApplierFacadeStub *stub =
      [[RNFBPerfHttpMetricStopApplierFacadeStub alloc] init];
  NSDictionary *attributes = @{@"a1" : @"v1"};

  [RNFBPerfHttpMetricStopApplier applyAttributes:attributes
                                httpResponseCode:@200
                              requestPayloadSize:@11
                             responsePayloadSize:@22
                             responseContentType:@"application/json"
                                              to:stub];

  XCTAssertEqual(stub.calls.count, 5u);
  XCTAssertEqualObjects(stub.calls[0][@"kind"], @"attribute");
  XCTAssertEqualObjects(stub.calls[0][@"name"], @"a1");
  XCTAssertEqualObjects(stub.calls[0][@"value"], @"v1");
  XCTAssertEqualObjects(stub.calls[1][@"kind"], @"responseCode");
  XCTAssertEqualObjects(stub.calls[1][@"value"], @200);
  XCTAssertEqualObjects(stub.calls[2][@"kind"], @"requestPayloadSize");
  XCTAssertEqualObjects(stub.calls[2][@"value"], @11);
  XCTAssertEqualObjects(stub.calls[3][@"kind"], @"responsePayloadSize");
  XCTAssertEqualObjects(stub.calls[3][@"value"], @22);
  XCTAssertEqualObjects(stub.calls[4][@"kind"], @"responseContentType");
  XCTAssertEqualObjects(stub.calls[4][@"value"], @"application/json");
}

- (void)testObjCSelectorNilFieldsAreNoOps {
  RNFBPerfHttpMetricStopApplierFacadeStub *stub =
      [[RNFBPerfHttpMetricStopApplierFacadeStub alloc] init];
  [RNFBPerfHttpMetricStopApplier applyAttributes:nil
                                httpResponseCode:nil
                              requestPayloadSize:nil
                             responsePayloadSize:nil
                             responseContentType:nil
                                              to:stub];
  XCTAssertEqual(stub.calls.count, 0u);
}

- (void)testFacadePublicSelectorUnchanged {
  XCTAssertTrue([RNFBPerfHttpMetricStopApplier
      respondsToSelector:@selector
      (applyAttributes:
          httpResponseCode:requestPayloadSize:responsePayloadSize:responseContentType:to:)]);
}

@end
