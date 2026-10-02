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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#define RNFB_PERF_SDK_AVAILABLE 1
#elif __has_include(<FirebasePerformance/FirebasePerformance.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebasePerformance/FirebasePerformance.h>
#define RNFB_PERF_SDK_AVAILABLE 1
#elif !TARGET_OS_MACCATALYST
// SPM on iOS/tvOS when product headers are not visible as includes: use
// @import in this plain .m (needs -fmodules only). Do not move @import into
// the .mm TurboModule (that would require -fcxx-modules).
@import FirebaseCore;
@import FirebasePerformance;
#define RNFB_PERF_SDK_AVAILABLE 1
#else
// Product headers/modules absent under Mac Catalyst + SPM. Upstream
// Package.swift omits .macCatalyst from FirebasePerformanceTarget; CocoaPods
// historically masked this via the Firebase umbrella. Temporary stubs pending
// https://github.com/firebase/firebase-ios-sdk/pull/16468 (or permanent if
// upstream declines). When that PR lands, drop the TARGET_OS_MACCATALYST
// gate and use the @import path on Catalyst too.
#define RNFB_PERF_SDK_AVAILABLE 0
#endif

#if __has_include(<RNFBPerf/RNFBPerf-Swift.h>)
#import <RNFBPerf/RNFBPerf-Swift.h>
#elif __has_include("RNFBPerf-Swift.h")
#import "RNFBPerf-Swift.h"
#elif __has_include("RNFBHandleMapStorage-Swift.inc")
#import "RNFBHandleMapStorage-Swift.inc"
#else
#error "RNFBPerf Swift interface not found"
#endif

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBPerfHelper.h"

@implementation RNFBPerfHelper

#if !RNFB_PERF_SDK_AVAILABLE
+ (void)rejectUnavailable:(RCTPromiseRejectBlock)reject {
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                    userInfo:(NSMutableDictionary *)@{
                                      @"code" : @"unsupported",
                                      @"message" : @"Firebase Performance is not available on "
                                                   @"this platform or dependency configuration.",
                                    }];
}
#endif

+ (NSDictionary *)constantsDictionary {
  NSMutableDictionary *constants = [NSMutableDictionary new];
#if RNFB_PERF_SDK_AVAILABLE
  constants[@"isPerformanceCollectionEnabled"] =
      @([FIRPerformance sharedInstance].dataCollectionEnabled);
  constants[@"isInstrumentationEnabled"] =
      @([FIRPerformance sharedInstance].instrumentationEnabled);
#else
  constants[@"isPerformanceCollectionEnabled"] = @(NO);
  constants[@"isInstrumentationEnabled"] = @(NO);
#endif
  return constants;
}

+ (void)setPerformanceCollectionEnabled:(BOOL)enabled
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
#if RNFB_PERF_SDK_AVAILABLE
  [FIRPerformance sharedInstance].dataCollectionEnabled = enabled;
  resolve([NSNull null]);
#else
  (void)enabled;
  (void)resolve;
  [self rejectUnavailable:reject];
#endif
}

+ (void)setInstrumentationEnabled:(BOOL)enabled
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject {
#if RNFB_PERF_SDK_AVAILABLE
  [FIRPerformance sharedInstance].instrumentationEnabled = enabled;
  resolve([NSNull null]);
#else
  (void)enabled;
  (void)resolve;
  [self rejectUnavailable:reject];
#endif
}

+ (void)startTraceWithId:(NSNumber *)traceId
              identifier:(NSString *)identifier
              inRegistry:(RNFBPerfHandleRegistry *)registry {
#if RNFB_PERF_SDK_AVAILABLE
  FIRTrace *trace = [[FIRPerformance sharedInstance] traceWithName:identifier];
  [trace start];

  FIRTrace *displaced = [registry putReplacing:traceId value:trace];
  if (displaced != nil) {
    [displaced stop];
  }
#else
  (void)traceId;
  (void)identifier;
  (void)registry;
#endif
}

+ (void)stopTraceWithId:(NSNumber *)traceId
                metrics:(NSDictionary *)metrics
             attributes:(NSDictionary *)attributes
             inRegistry:(RNFBPerfHandleRegistry *)registry {
#if RNFB_PERF_SDK_AVAILABLE
  FIRTrace *trace = [registry get:traceId];
  if (trace == nil) {
    return;
  }

  id<RNFBPerfTraceApplying> traceTarget = (id<RNFBPerfTraceApplying>)trace;
  [RNFBPerfTraceStopApplier applyMetrics:metrics attributes:attributes to:traceTarget];

  FIRTrace *expected = trace;
  trace = [registry takeIf:traceId
                      when:^BOOL(NSObject *value) {
                        return value == expected;
                      }];
  if (trace != nil) {
    [trace stop];
  }
#else
  (void)traceId;
  (void)metrics;
  (void)attributes;
  (void)registry;
#endif
}

+ (void)startHttpMetricWithId:(NSNumber *)metricId
                          url:(NSString *)url
                   httpMethod:(NSString *)httpMethod
                   inRegistry:(RNFBPerfHandleRegistry *)registry {
#if RNFB_PERF_SDK_AVAILABLE
  FIRHTTPMethod method =
      (FIRHTTPMethod)[RNFBPerfHttpMethodMapper httpMethodRawValueForString:httpMethod];
  NSURL *toNSURL = [NSURL URLWithString:url];

  FIRHTTPMetric *httpMetric = [[FIRHTTPMetric alloc] initWithURL:toNSURL HTTPMethod:method];
  [httpMetric start];

  FIRHTTPMetric *displaced = [registry putReplacing:metricId value:httpMetric];
  if (displaced != nil) {
    [displaced stop];
  }
#else
  (void)metricId;
  (void)url;
  (void)httpMethod;
  (void)registry;
#endif
}

+ (void)stopHttpMetricWithId:(NSNumber *)metricId
                  attributes:(NSDictionary *)attributes
            httpResponseCode:(NSNumber *)httpResponseCode
          requestPayloadSize:(NSNumber *)requestPayloadSize
         responsePayloadSize:(NSNumber *)responsePayloadSize
         responseContentType:(NSString *)responseContentType
                  inRegistry:(RNFBPerfHandleRegistry *)registry {
#if RNFB_PERF_SDK_AVAILABLE
  FIRHTTPMetric *httpMetric = [registry get:metricId];
  if (httpMetric == nil) {
    return;
  }

  id<RNFBPerfHttpMetricApplying> httpMetricTarget = (id<RNFBPerfHttpMetricApplying>)httpMetric;
  [RNFBPerfHttpMetricStopApplier applyAttributes:attributes
                                httpResponseCode:httpResponseCode
                              requestPayloadSize:requestPayloadSize
                             responsePayloadSize:responsePayloadSize
                             responseContentType:responseContentType
                                              to:httpMetricTarget];

  FIRHTTPMetric *expected = httpMetric;
  httpMetric = [registry takeIf:metricId
                           when:^BOOL(NSObject *value) {
                             return value == expected;
                           }];
  if (httpMetric != nil) {
    [httpMetric stop];
  }
#else
  (void)metricId;
  (void)attributes;
  (void)httpResponseCode;
  (void)requestPayloadSize;
  (void)responsePayloadSize;
  (void)responseContentType;
  (void)registry;
#endif
}

@end
