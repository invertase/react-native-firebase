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

// This module intentionally has no Firebase imports and no `*-Swift.h` —
// see RNFBPerfHelper.h. Every Firebase Performance touch (and the Swift
// stop appliers / HTTP method mapper) is routed through the plain
// Objective-C RNFBPerfHelper class instead, which can safely import Firebase
// and the generated Swift interface because it compiles as ObjC, not ObjC++.
#import "RNFBPerfModule.h"
#import "RNFBPerfHandleRegistry.h"
#import "RNFBPerfHelper.h"

static RNFBPerfHandleRegistry *traces;
static RNFBPerfHandleRegistry *httpMetrics;

@implementation RNFBPerfModule

RCT_EXPORT_MODULE(NativeRNFBTurboPerf)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (instancetype)init {
  self = [super init];

  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    traces = [[RNFBPerfHandleRegistry alloc] init];
    httpMetrics = [[RNFBPerfHandleRegistry alloc] init];
  });

  return self;
}

- (void)invalidate {
  [traces takeAll];
  [httpMetrics takeAll];
}

- (NSDictionary *)perfConstantsDictionary {
  return [RNFBPerfHelper constantsDictionary];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboPerf::Constants>)constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:[self perfConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboPerf::Constants>)getConstants {
  return [self constantsToExport];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboPerfSpecJSI>(params);
}

- (void)setPerformanceCollectionEnabled:(BOOL)enabled
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
  [RNFBPerfHelper setPerformanceCollectionEnabled:enabled resolve:resolve reject:reject];
}

- (void)instrumentationEnabled:(BOOL)enabled
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  [RNFBPerfHelper setInstrumentationEnabled:enabled resolve:resolve reject:reject];
}

- (void)startTrace:(double)id identifier:(NSString *)identifier {
  [RNFBPerfHelper startTraceWithId:@((int)id) identifier:identifier inRegistry:traces];
}

- (void)stopTrace:(double)id traceData:(JS::NativeRNFBTurboPerf::TraceData &)traceData {
  NSDictionary *metrics = (NSDictionary *)traceData.metrics();
  NSDictionary *attributes = (NSDictionary *)traceData.attributes();
  [RNFBPerfHelper stopTraceWithId:@((int)id)
                          metrics:metrics
                       attributes:attributes
                       inRegistry:traces];
}

- (void)startScreenTrace:(double)id identifier:(NSString *)identifier {
  // Custom screen traces are not supported on iOS.
  (void)id;
  (void)identifier;
}

- (void)stopScreenTrace:(double)id {
  // Custom screen traces are not supported on iOS.
  (void)id;
}

- (void)startHttpMetric:(double)id url:(NSString *)url httpMethod:(NSString *)httpMethod {
  [RNFBPerfHelper startHttpMetricWithId:@((int)id)
                                    url:url
                             httpMethod:httpMethod
                             inRegistry:httpMetrics];
}

- (void)stopHttpMetric:(double)id metricData:(JS::NativeRNFBTurboPerf::HttpMetricData &)metricData {
  NSDictionary *attributes = (NSDictionary *)metricData.attributes();
  NSNumber *httpResponseCode = metricData.httpResponseCode().has_value()
                                   ? @((NSInteger)metricData.httpResponseCode().value())
                                   : nil;
  NSNumber *requestPayloadSize = metricData.requestPayloadSize().has_value()
                                     ? @((NSInteger)metricData.requestPayloadSize().value())
                                     : nil;
  NSNumber *responsePayloadSize = metricData.responsePayloadSize().has_value()
                                      ? @((NSInteger)metricData.responsePayloadSize().value())
                                      : nil;
  [RNFBPerfHelper stopHttpMetricWithId:@((int)id)
                            attributes:attributes
                      httpResponseCode:httpResponseCode
                    requestPayloadSize:requestPayloadSize
                   responsePayloadSize:responsePayloadSize
                   responseContentType:metricData.responseContentType()
                            inRegistry:httpMetrics];
}

@end
