#import "RNFirebasePerformance.h"

#if __has_include(<FirebasePerformance/FIRPerformance.h>)
#import <FirebasePerformance/FIRPerformance.h>
#import <FirebasePerformance/FIRHTTPMetric.h>
@implementation RNFirebasePerformance
RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        _traces = [[NSMutableDictionary alloc] init];
        _httpMetrics = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (FIRHTTPMethod) mapStringToMethod:(NSString *) value {
    if ([value compare:@"get" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodGET;
    if ([value compare:@"put" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodPUT;
    if ([value compare:@"post" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodPUT;
    if ([value compare:@"delete" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodDELETE;
    if ([value compare:@"head" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodHEAD;
    if ([value compare:@"patch" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodPATCH;
    if ([value compare:@"options" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodOPTIONS;
    if ([value compare:@"trace" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodTRACE;
    if ([value compare:@"connect" options:NSCaseInsensitiveSearch] == NSOrderedSame) return FIRHTTPMethodCONNECT;
    return FIRHTTPMethodGET;
}


- (FIRTrace *)getOrCreateTrace:(NSString *)identifier {
    if (_traces[identifier]) {
        return _traces[identifier];
    }
    FIRTrace *trace = [[FIRPerformance sharedInstance] traceWithName:identifier];
    _traces[identifier] = trace;
    return trace;
}

- (FIRHTTPMetric *)getOrCreateHttpMetric:(NSString *)url httpMethod:(NSString *) httpMethod {
    NSString *identifier = [NSString stringWithFormat:@"%@%@", url, httpMethod];
    if (_httpMetrics[identifier]) {
        return _httpMetrics[identifier];
    }
    NSURL * toURL = [NSURL URLWithString:url];
    FIRHTTPMethod method = [self mapStringToMethod:httpMethod];
    FIRHTTPMetric *httpMetric = [[FIRHTTPMetric alloc] initWithURL:toURL HTTPMethod:method];
    _httpMetrics[identifier] = httpMetric;
    return httpMetric;
}

RCT_EXPORT_METHOD(setPerformanceCollectionEnabled:
    (BOOL *) enabled) {
    [FIRPerformance sharedInstance].dataCollectionEnabled = (BOOL) enabled;
}

/**
 * Trace
 */

RCT_EXPORT_METHOD(startTrace:
                  (NSString *) identifier
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateTrace:identifier] start];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(stopTrace:
                  (NSString *) identifier
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateTrace:identifier] stop];
    [_traces removeObjectForKey:identifier];

    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(getTraceAttribute:
                  (NSString *) identifier
                  attribute:(NSString *) attribute
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *value = [[self getOrCreateTrace:identifier] valueForAttribute:attribute];
    resolve(value ? value : [NSNull null]);
}

RCT_EXPORT_METHOD(getTraceAttributes:
                  (NSString *) identifier
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([[self getOrCreateTrace:identifier] attributes]);
}

RCT_EXPORT_METHOD(getTraceLongMetric:
                  (NSString *) identifier
                  metricName:(NSString *) metricName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    int64_t value = [[self getOrCreateTrace:identifier] valueForIntMetric:metricName];
    resolve(@(value));
}

RCT_EXPORT_METHOD(incrementTraceMetric:
                  (NSString *) identifier
                  metricName:(NSString *) metricName
                  incrementBy:(nonnull NSNumber *) incrementBy
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    int64_t byInt = [incrementBy intValue];
    [[self getOrCreateTrace:identifier] incrementMetric:metricName byInt:byInt];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(putTraceAttribute:
                  (NSString *) identifier
                  attribute:(NSString *) attribute
                  value:(NSString *) value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    FIRTrace * trace = [self getOrCreateTrace:identifier];
    [trace setValue:value forAttribute:attribute];
    
    if (trace.attributes[attribute] != nil) {
        resolve(@(YES));
    } else {
        resolve(@(NO));
    }
}

RCT_EXPORT_METHOD(putTraceMetric:
                  (NSString *) identifier
                  attribute:(NSString *) attribute
                  value:(nonnull NSNumber *) value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    int64_t byInt = [value intValue];
    [[self getOrCreateTrace:identifier] setIntValue:byInt forMetric:attribute];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(removeTraceAttribute:
                  (NSString *) identifier
                  attribute:(NSString *) attribute
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateTrace:identifier] removeAttribute:attribute];
    resolve([NSNull null]);
}

/**
 * HTTP Metric
 */

RCT_EXPORT_METHOD(startHttpMetric:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateHttpMetric:url httpMethod:httpMethod] start];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(stopHttpMetric:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateHttpMetric:url httpMethod:httpMethod] stop];
    [_httpMetrics removeObjectForKey:[NSString stringWithFormat:@"%@%@", url, httpMethod]];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(getHttpMetricAttribute:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  attribute:(NSString *) attribute
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *value = [[self getOrCreateHttpMetric:url httpMethod:httpMethod] valueForAttribute:attribute];
    resolve(value ? value : [NSNull null]);
}

RCT_EXPORT_METHOD(getHttpMetricAttributes:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([[self getOrCreateHttpMetric:url httpMethod:httpMethod] attributes]);
}

RCT_EXPORT_METHOD(putHttpMetricAttribute:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  attribute:(NSString *) attribute
                  value:(NSString *) value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    FIRHTTPMetric * httpMetric = [self getOrCreateHttpMetric:url httpMethod:httpMethod];
    [httpMetric setValue:value forAttribute:attribute];
    
    if (httpMetric.attributes[attribute] != nil) {
        resolve(@(YES));
    } else {
        resolve(@(NO));
    }
}

RCT_EXPORT_METHOD(removeHttpMetricAttribute:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  attribute:(NSString *) attribute
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateHttpMetric:url httpMethod:httpMethod] removeAttribute:attribute];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setHttpMetricResponseCode:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  code:(nonnull NSNumber *) code
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateHttpMetric:url httpMethod:httpMethod] setResponseCode:[code integerValue]];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setHttpMetricRequestPayloadSize:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  bytes:(nonnull NSNumber *) bytes
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateHttpMetric:url httpMethod:httpMethod] setRequestPayloadSize:[bytes longLongValue]];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setHttpMetricResponseContentType:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  type:(NSString *) type
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateHttpMetric:url httpMethod:httpMethod] setResponseContentType:type];
    resolve([NSNull null]);
}

RCT_EXPORT_METHOD(setHttpMetricResponsePayloadSize:
                  (NSString *) url
                  httpMethod:(NSString *) httpMethod
                  bytes:(nonnull NSNumber *) bytes
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getOrCreateHttpMetric:url httpMethod:httpMethod] setResponsePayloadSize:[bytes longLongValue]];
    resolve([NSNull null]);
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation RNFirebasePerformance
@end
#endif
