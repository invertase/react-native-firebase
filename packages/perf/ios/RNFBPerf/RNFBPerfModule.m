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

#import <Firebase/Firebase.h>
#import "RNFBPerfModule.h"

static __strong NSMutableDictionary *traces;
static __strong NSMutableDictionary *httpMetrics;

@implementation RNFBPerfModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (instancetype)init {
  self = [super init];

  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    traces = [[NSMutableDictionary alloc] init];
    httpMetrics = [[NSMutableDictionary alloc] init];
  });

  return self;
}

- (void)dealloc {
  @synchronized([self class]) {
    for (NSString *key in [traces allKeys]) {
      [traces removeObjectForKey:key];
    }

    for (NSString *key in [httpMetrics allKeys]) {
      [httpMetrics removeObjectForKey:key];
    }
  }
}

- (NSDictionary *)constantsToExport {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isPerformanceCollectionEnabled"] =
      @([RCTConvert BOOL:@([FIRPerformance sharedInstance].dataCollectionEnabled)]);
  return constants;
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark -
#pragma mark Firebase Perf Methods

RCT_EXPORT_METHOD(setPerformanceCollectionEnabled
                  : (BOOL)enabled resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  [FIRPerformance sharedInstance].dataCollectionEnabled = (BOOL)enabled;
  [FIRPerformance sharedInstance].instrumentationEnabled = (BOOL)enabled;
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(startTrace
                  : (nonnull NSNumber *)id identifier
                  : (NSString *)identifier resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  FIRTrace *trace = [[FIRPerformance sharedInstance] traceWithName:identifier];
  [trace start];

  @synchronized([self class]) {
    traces[id] = trace;
  }

  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(stopTrace
                  : (nonnull NSNumber *)id traceData
                  : (NSDictionary *)traceData resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  FIRTrace *trace;
  @synchronized([self class]) {
    trace = traces[id];
  }

  NSDictionary *metrics = traceData[@"metrics"];
  NSDictionary *attributes = traceData[@"attributes"];

  [metrics enumerateKeysAndObjectsUsingBlock:^(NSString *metricName, NSNumber *value, BOOL *stop) {
    [trace setIntValue:[value longLongValue] forMetric:metricName];
  }];

  [attributes
      enumerateKeysAndObjectsUsingBlock:^(NSString *attributeName, NSString *value, BOOL *stop) {
        [trace setValue:value forAttribute:attributeName];
      }];

  [trace stop];

  @synchronized([self class]) {
    [traces removeObjectForKey:id];
  }

  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(startHttpMetric
                  : (nonnull NSNumber *)id url
                  : (NSString *)url httpMethod
                  : (NSString *)httpMethod resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  FIRHTTPMethod method = FIRHTTPMethodGET;
  NSURL *toNSURL = [NSURL URLWithString:url];
  if ([httpMethod compare:@"put" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodPUT;
  if ([httpMethod compare:@"post" options:NSCaseInsensitiveSearch] == NSOrderedSame)
    method = FIRHTTPMethodPUT;
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
    httpMetrics[id] = httpMetric;
  }

  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(stopHttpMetric
                  : (nonnull NSNumber *)id metricData
                  : (NSDictionary *)metricData resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  FIRHTTPMetric *httpMetric;
  @synchronized([self class]) {
    httpMetric = httpMetrics[id];
  }

  NSDictionary *attributes = metricData[@"attributes"];
  [attributes
      enumerateKeysAndObjectsUsingBlock:^(NSString *attributeName, NSString *value, BOOL *stop) {
        [httpMetric setValue:value forAttribute:attributeName];
      }];

  if (metricData[@"httpResponseCode"]) {
    NSNumber *responseCode = (NSNumber *)metricData[@"httpResponseCode"];
    [httpMetric setResponseCode:[responseCode integerValue]];
  }

  if (metricData[@"requestPayloadSize"]) {
    NSNumber *requestPayloadSize = (NSNumber *)metricData[@"requestPayloadSize"];
    [httpMetric setRequestPayloadSize:[requestPayloadSize longValue]];
  }

  if (metricData[@"responsePayloadSize"]) {
    NSNumber *responsePayloadSize = (NSNumber *)metricData[@"responsePayloadSize"];
    [httpMetric setResponsePayloadSize:[responsePayloadSize longValue]];
  }

  if (metricData[@"responseContentType"]) {
    NSString *responseContentType = (NSString *)metricData[@"responseContentType"];
    [httpMetric setResponseContentType:responseContentType];
  }

  [httpMetric stop];

  @synchronized([self class]) {
    [httpMetrics removeObjectForKey:id];
  }

  resolve([NSNull null]);
}

@end
