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

#import <Firebase/Firebase.h>
#import "RNFBPerfHandleRegistry.h"
#import "RNFBPerfHelper.h"

@interface RNFBPerfHelperHostStubTests : XCTestCase
@property(nonatomic, strong) RNFBPerfHandleRegistry *traces;
@property(nonatomic, strong) RNFBPerfHandleRegistry *httpMetrics;
@end

@implementation RNFBPerfHelperHostStubTests

- (void)setUp {
  [super setUp];
  [FIRPerformance resetTestState];
  self.traces = [[RNFBPerfHandleRegistry alloc] init];
  self.httpMetrics = [[RNFBPerfHandleRegistry alloc] init];
}

- (void)tearDown {
  [FIRPerformance resetTestState];
  self.traces = nil;
  self.httpMetrics = nil;
  [super tearDown];
}

- (void)testConstantsDictionary_reflectsSharedInstanceFlags {
  [FIRPerformance sharedInstance].dataCollectionEnabled = YES;
  [FIRPerformance sharedInstance].instrumentationEnabled = YES;

  NSDictionary *constants = [RNFBPerfHelper constantsDictionary];
  XCTAssertEqualObjects(constants[@"isPerformanceCollectionEnabled"], @YES);
  XCTAssertEqualObjects(constants[@"isInstrumentationEnabled"], @YES);
}

- (void)testSetPerformanceCollectionEnabled_setsFlagAndResolves {
  __block id resolved = @"unset";
  __block BOOL rejected = NO;

  [RNFBPerfHelper setPerformanceCollectionEnabled:YES
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        rejected = YES;
      }];

  XCTAssertFalse(rejected);
  XCTAssertEqualObjects(resolved, [NSNull null]);
  XCTAssertTrue([FIRPerformance sharedInstance].dataCollectionEnabled);
}

- (void)testSetInstrumentationEnabled_setsFlagAndResolves {
  __block id resolved = @"unset";

  [RNFBPerfHelper setInstrumentationEnabled:YES
      resolve:^(id result) {
        resolved = result;
      }
      reject:^(NSString *code, NSString *message, NSError *error) {
        (void)code;
        (void)message;
        (void)error;
        XCTFail(@"unexpected reject");
      }];

  XCTAssertEqualObjects(resolved, [NSNull null]);
  XCTAssertTrue([FIRPerformance sharedInstance].instrumentationEnabled);
}

- (void)testStartTrace_startsAndStoresHandle {
  [RNFBPerfHelper startTraceWithId:@1 identifier:@"trace-a" inRegistry:self.traces];

  FIRTrace *trace = [self.traces get:@1];
  XCTAssertNotNil(trace);
  XCTAssertEqualObjects(trace.name, @"trace-a");
  XCTAssertEqual(trace.startCallCount, 1u);
  XCTAssertEqual(FIRPerformance.createdTraces.count, 1u);
}

- (void)testStartTrace_displacesPreviousAndStopsIt {
  [RNFBPerfHelper startTraceWithId:@1 identifier:@"first" inRegistry:self.traces];
  FIRTrace *first = [self.traces get:@1];

  [RNFBPerfHelper startTraceWithId:@1 identifier:@"second" inRegistry:self.traces];
  FIRTrace *second = [self.traces get:@1];

  XCTAssertNotEqual(first, second);
  XCTAssertEqual(first.stopCallCount, 1u);
  XCTAssertEqual(second.startCallCount, 1u);
  XCTAssertEqualObjects(second.name, @"second");
}

- (void)testStopTrace_appliesMetricsAttributesAndStops {
  [RNFBPerfHelper startTraceWithId:@7 identifier:@"stop-me" inRegistry:self.traces];
  FIRTrace *trace = [self.traces get:@7];

  [RNFBPerfHelper stopTraceWithId:@7
                          metrics:@{@"bytes" : @42}
                       attributes:@{@"screen" : @"home"}
                       inRegistry:self.traces];

  XCTAssertNil([self.traces get:@7]);
  XCTAssertEqualObjects(trace.metrics[@"bytes"], @42);
  XCTAssertEqualObjects(trace.attributes[@"screen"], @"home");
  XCTAssertEqual(trace.stopCallCount, 1u);
}

- (void)testStopTrace_missingHandle_isNoOp {
  [RNFBPerfHelper stopTraceWithId:@99 metrics:@{@"m" : @1} attributes:nil inRegistry:self.traces];
  XCTAssertEqual(FIRPerformance.createdTraces.count, 0u);
}

- (void)testStartHttpMetric_mapsMethodStartsAndStores {
  [RNFBPerfHelper startHttpMetricWithId:@3
                                    url:@"https://example.com/api"
                             httpMethod:@"POST"
                             inRegistry:self.httpMetrics];

  FIRHTTPMetric *metric = [self.httpMetrics get:@3];
  XCTAssertNotNil(metric);
  XCTAssertEqualObjects(metric.url.absoluteString, @"https://example.com/api");
  XCTAssertEqual(metric.HTTPMethod, FIRHTTPMethodPOST);
  XCTAssertEqual(metric.startCallCount, 1u);
}

- (void)testStartHttpMetric_displacesPreviousAndStopsIt {
  [RNFBPerfHelper startHttpMetricWithId:@3
                                    url:@"https://example.com/a"
                             httpMethod:@"GET"
                             inRegistry:self.httpMetrics];
  FIRHTTPMetric *first = [self.httpMetrics get:@3];

  [RNFBPerfHelper startHttpMetricWithId:@3
                                    url:@"https://example.com/b"
                             httpMethod:@"PUT"
                             inRegistry:self.httpMetrics];
  FIRHTTPMetric *second = [self.httpMetrics get:@3];

  XCTAssertNotEqual(first, second);
  XCTAssertEqual(first.stopCallCount, 1u);
  XCTAssertEqual(second.HTTPMethod, FIRHTTPMethodPUT);
}

- (void)testStopHttpMetric_appliesFieldsAndStops {
  [RNFBPerfHelper startHttpMetricWithId:@4
                                    url:@"https://example.com"
                             httpMethod:@"GET"
                             inRegistry:self.httpMetrics];
  FIRHTTPMetric *metric = [self.httpMetrics get:@4];

  [RNFBPerfHelper stopHttpMetricWithId:@4
                            attributes:@{@"route" : @"/v1"}
                      httpResponseCode:@204
                    requestPayloadSize:@10
                   responsePayloadSize:@20
                   responseContentType:@"application/json"
                            inRegistry:self.httpMetrics];

  XCTAssertNil([self.httpMetrics get:@4]);
  XCTAssertEqualObjects(metric.attributes[@"route"], @"/v1");
  XCTAssertEqual(metric.responseCode, 204);
  XCTAssertEqual(metric.requestPayloadSize, 10);
  XCTAssertEqual(metric.responsePayloadSize, 20);
  XCTAssertEqualObjects(metric.responseContentType, @"application/json");
  XCTAssertEqual(metric.stopCallCount, 1u);
}

- (void)testStopHttpMetric_missingHandle_isNoOp {
  [RNFBPerfHelper stopHttpMetricWithId:@88
                            attributes:nil
                      httpResponseCode:@200
                    requestPayloadSize:nil
                   responsePayloadSize:nil
                   responseContentType:nil
                            inRegistry:self.httpMetrics];
  XCTAssertEqual(FIRPerformance.createdHttpMetrics.count, 0u);
}

@end
