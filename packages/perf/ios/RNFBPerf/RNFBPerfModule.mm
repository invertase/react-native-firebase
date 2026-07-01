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

- (NSDictionary *)perfConstantsDictionary {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isPerformanceCollectionEnabled"] =
      @([RCTConvert BOOL:@([FIRPerformance sharedInstance].dataCollectionEnabled)]);
  constants[@"isInstrumentationEnabled"] =
      @([RCTConvert BOOL:@([FIRPerformance sharedInstance].instrumentationEnabled)]);
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
  [FIRPerformance sharedInstance].dataCollectionEnabled = (BOOL)enabled;
  resolve([NSNull null]);
}

- (void)instrumentationEnabled:(BOOL)enabled
                       resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  [FIRPerformance sharedInstance].instrumentationEnabled = (BOOL)enabled;
  resolve([NSNull null]);
}

- (void)startTrace:(double)id
        identifier:(NSString *)identifier
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject {
  FIRTrace *trace = [[FIRPerformance sharedInstance] traceWithName:identifier];
  [trace start];

  @synchronized([self class]) {
    traces[@((int)id)] = trace;
  }

  resolve([NSNull null]);
}

- (void)stopTrace:(double)id
        traceData:(JS::NativeRNFBTurboPerf::TraceData &)traceData
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
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

  resolve([NSNull null]);
}

- (void)startScreenTrace:(double)id
              identifier:(NSString *)identifier
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  resolve([NSNull null]);
}

- (void)stopScreenTrace:(double)id
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  resolve([NSNull null]);
}

- (void)startHttpMetric:(double)id
                    url:(NSString *)url
             httpMethod:(NSString *)httpMethod
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
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

  resolve([NSNull null]);
}

- (void)stopHttpMetric:(double)id
            metricData:(JS::NativeRNFBTurboPerf::HttpMetricData &)metricData
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject {
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

  resolve([NSNull null]);
}

@end
