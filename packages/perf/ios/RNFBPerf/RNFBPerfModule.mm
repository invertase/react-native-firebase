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

#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#define RNFB_PERF_SDK_AVAILABLE 1
#elif __has_include(<FirebasePerformance/FirebasePerformance.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebasePerformance/FirebasePerformance.h>
#define RNFB_PERF_SDK_AVAILABLE 1
#else
// Product headers absent (typical Mac Catalyst + SPM). Upstream Package.swift
// omits .macCatalyst from FirebasePerformanceTarget; CocoaPods historically
// masked this via the Firebase umbrella. Temporary stubs pending
// https://github.com/firebase/firebase-ios-sdk/pull/16468 (or permanent if
// upstream declines). Never fall through to @import in this .mm — that
// requires -fcxx-modules and breaks RN C++/JSI.
#define RNFB_PERF_SDK_AVAILABLE 0
#endif
#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBPerfModule.h"

static __strong NSMutableDictionary *traces;
static __strong NSMutableDictionary *httpMetrics;

@implementation RNFBPerfModule

RCT_EXPORT_MODULE(NativeRNFBTurboPerf)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (instancetype)init {
  self = [super init];

  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    traces = [[NSMutableDictionary alloc] init];
    httpMetrics = [[NSMutableDictionary alloc] init];
  });

  return self;
}

- (void)invalidate {
  @synchronized([self class]) {
    for (NSString *key in [traces allKeys]) {
      [traces removeObjectForKey:key];
    }

    for (NSString *key in [httpMetrics allKeys]) {
      [httpMetrics removeObjectForKey:key];
    }
  }
}

#if !RNFB_PERF_SDK_AVAILABLE
- (void)rejectUnavailable:(RCTPromiseRejectBlock)reject {
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                    userInfo:(NSMutableDictionary *)@{
                                      @"code" : @"unsupported",
                                      @"message" : @"Firebase Performance is not available on "
                                                   @"this platform or dependency configuration.",
                                    }];
}
#endif

- (NSDictionary *)perfConstantsDictionary {
  NSMutableDictionary *constants = [NSMutableDictionary new];
#if RNFB_PERF_SDK_AVAILABLE
  constants[@"isPerformanceCollectionEnabled"] =
      @([RCTConvert BOOL:@([FIRPerformance sharedInstance].dataCollectionEnabled)]);
  constants[@"isInstrumentationEnabled"] =
      @([RCTConvert BOOL:@([FIRPerformance sharedInstance].instrumentationEnabled)]);
#else
  constants[@"isPerformanceCollectionEnabled"] = @(NO);
  constants[@"isInstrumentationEnabled"] = @(NO);
#endif
  return constants;
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboPerf::Constants::Builder>)constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:[self perfConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboPerf::Constants::Builder>)getConstants {
  return [self constantsToExport];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboPerfSpecJSI>(params);
}

- (void)setPerformanceCollectionEnabled:(BOOL)enabled
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
#if RNFB_PERF_SDK_AVAILABLE
  [FIRPerformance sharedInstance].dataCollectionEnabled = (BOOL)enabled;
  resolve([NSNull null]);
#else
  (void)enabled;
  (void)resolve;
  [self rejectUnavailable:reject];
#endif
}

- (void)instrumentationEnabled:(BOOL)enabled
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
#if RNFB_PERF_SDK_AVAILABLE
  [FIRPerformance sharedInstance].instrumentationEnabled = (BOOL)enabled;
  resolve([NSNull null]);
#else
  (void)enabled;
  (void)resolve;
  [self rejectUnavailable:reject];
#endif
}

- (void)startTrace:(double)id identifier:(NSString *)identifier {
#if RNFB_PERF_SDK_AVAILABLE
  FIRTrace *trace = [[FIRPerformance sharedInstance] traceWithName:identifier];
  [trace start];

  @synchronized([self class]) {
    traces[@((int)id)] = trace;
  }
#else
  (void)id;
  (void)identifier;
#endif
}

- (void)stopTrace:(double)id traceData:(JS::NativeRNFBTurboPerf::TraceData &)traceData {
#if RNFB_PERF_SDK_AVAILABLE
  FIRTrace *trace;
  @synchronized([self class]) {
    trace = traces[@((int)id)];
  }

  NSDictionary *metrics = (NSDictionary *)traceData.metrics();
  NSDictionary *attributes = (NSDictionary *)traceData.attributes();

  [metrics enumerateKeysAndObjectsUsingBlock:^(NSString *metricName, NSNumber *value, BOOL *stop) {
    [trace setIntValue:[value longLongValue] forMetric:metricName];
  }];

  [attributes
      enumerateKeysAndObjectsUsingBlock:^(NSString *attributeName, NSString *value, BOOL *stop) {
        [trace setValue:value forAttribute:attributeName];
      }];

  [trace stop];

  @synchronized([self class]) {
    [traces removeObjectForKey:@((int)id)];
  }
#else
  (void)id;
  (void)traceData;
#endif
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
#if RNFB_PERF_SDK_AVAILABLE
  FIRHTTPMethod method = FIRHTTPMethodGET;
  NSURL *toNSURL = [NSURL URLWithString:url];
  if ([httpMethod compare:@"put" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodPUT;
  if ([httpMethod compare:@"post" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodPOST;
  if ([httpMethod compare:@"head" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodHEAD;
  if ([httpMethod compare:@"trace" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodTRACE;
  if ([httpMethod compare:@"patch" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodPATCH;
  if ([httpMethod compare:@"delete" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodDELETE;
  if ([httpMethod compare:@"options" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodOPTIONS;
  if ([httpMethod compare:@"connect" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodCONNECT;

  FIRHTTPMetric *httpMetric = [[FIRHTTPMetric alloc] initWithURL:toNSURL HTTPMethod:method];
  [httpMetric start];

  @synchronized([self class]) {
    httpMetrics[@((int)id)] = httpMetric;
  }
#else
  (void)id;
  (void)url;
  (void)httpMethod;
#endif
}

- (void)stopHttpMetric:(double)id metricData:(JS::NativeRNFBTurboPerf::HttpMetricData &)metricData {
#if RNFB_PERF_SDK_AVAILABLE
  FIRHTTPMetric *httpMetric;
  @synchronized([self class]) {
    httpMetric = httpMetrics[@((int)id)];
  }

  NSDictionary *attributes = (NSDictionary *)metricData.attributes();
  [attributes
      enumerateKeysAndObjectsUsingBlock:^(NSString *attributeName, NSString *value, BOOL *stop) {
        [httpMetric setValue:value forAttribute:attributeName];
      }];

  if (metricData.httpResponseCode().has_value()) {
    [httpMetric setResponseCode:(NSInteger)metricData.httpResponseCode().value()];
  }

  if (metricData.requestPayloadSize().has_value()) {
    [httpMetric setRequestPayloadSize:(NSInteger)metricData.requestPayloadSize().value()];
  }

  if (metricData.responsePayloadSize().has_value()) {
    [httpMetric setResponsePayloadSize:(NSInteger)metricData.responsePayloadSize().value()];
  }

  if (metricData.responseContentType() != nil) {
    [httpMetric setResponseContentType:metricData.responseContentType()];
  }

  [httpMetric stop];

  @synchronized([self class]) {
    [httpMetrics removeObjectForKey:@((int)id)];
  }
#else
  (void)id;
  (void)metricData;
#endif
}

@end
