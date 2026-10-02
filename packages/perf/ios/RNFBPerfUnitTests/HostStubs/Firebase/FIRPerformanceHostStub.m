/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Firebase/Firebase.h>

@implementation FIRTrace {
  NSString *_name;
  NSMutableDictionary<NSString *, NSNumber *> *_metrics;
  NSMutableDictionary<NSString *, NSString *> *_attributes;
}

- (instancetype)initWithName:(NSString *)name {
  self = [super init];
  if (self) {
    _name = [name copy];
    _metrics = [NSMutableDictionary new];
    _attributes = [NSMutableDictionary new];
  }
  return self;
}

- (NSString *)name {
  return _name;
}

- (NSMutableDictionary<NSString *, NSNumber *> *)metrics {
  return _metrics;
}

- (NSMutableDictionary<NSString *, NSString *> *)attributes {
  return _attributes;
}

- (void)start {
  self.startCallCount += 1;
}

- (void)stop {
  self.stopCallCount += 1;
}

- (void)setIntValue:(int64_t)value forMetric:(NSString *)metricName {
  _metrics[metricName] = @(value);
}

- (void)setValue:(NSString *)value forAttribute:(NSString *)attributeName {
  _attributes[attributeName] = value;
}

@end

@implementation FIRHTTPMetric {
  NSURL *_url;
  FIRHTTPMethod _HTTPMethod;
  NSMutableDictionary<NSString *, NSString *> *_attributes;
}

- (instancetype)initWithURL:(NSURL *)url HTTPMethod:(FIRHTTPMethod)httpMethod {
  self = [super init];
  if (self) {
    _url = url;
    _HTTPMethod = httpMethod;
    _attributes = [NSMutableDictionary new];
    _responseCode = 0;
    _requestPayloadSize = 0;
    _responsePayloadSize = 0;
    [FIRPerformance recordCreatedHttpMetric:self];
  }
  return self;
}

- (NSURL *)url {
  return _url;
}

- (FIRHTTPMethod)HTTPMethod {
  return _HTTPMethod;
}

- (NSMutableDictionary<NSString *, NSString *> *)attributes {
  return _attributes;
}

- (void)start {
  self.startCallCount += 1;
}

- (void)stop {
  self.stopCallCount += 1;
}

- (void)setValue:(NSString *)value forAttribute:(NSString *)attributeName {
  _attributes[attributeName] = value;
}

- (void)setResponseCode:(NSInteger)responseCode {
  _responseCode = responseCode;
}

- (void)setRequestPayloadSize:(NSInteger)bytes {
  _requestPayloadSize = bytes;
}

- (void)setResponsePayloadSize:(NSInteger)bytes {
  _responsePayloadSize = bytes;
}

- (void)setResponseContentType:(NSString *)contentType {
  _responseContentType = [contentType copy];
}

@end

@implementation FIRPerformance

static FIRPerformance *sShared;
static NSMutableArray<FIRTrace *> *sCreatedTraces;
static NSMutableArray<FIRHTTPMetric *> *sCreatedHttpMetrics;

+ (void)initialize {
  if (self == [FIRPerformance class]) {
    sCreatedTraces = [NSMutableArray new];
    sCreatedHttpMetrics = [NSMutableArray new];
  }
}

+ (instancetype)sharedInstance {
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    sShared = [[FIRPerformance alloc] init];
  });
  return sShared;
}

- (FIRTrace *)traceWithName:(NSString *)name {
  FIRTrace *trace = [[FIRTrace alloc] initWithName:name];
  [sCreatedTraces addObject:trace];
  return trace;
}

+ (NSArray<FIRTrace *> *)createdTraces {
  return [sCreatedTraces copy];
}

+ (void)setCreatedTraces:(NSArray<FIRTrace *> *)createdTraces {
  sCreatedTraces = createdTraces ? [createdTraces mutableCopy] : [NSMutableArray new];
}

+ (NSArray<FIRHTTPMetric *> *)createdHttpMetrics {
  return [sCreatedHttpMetrics copy];
}

+ (void)setCreatedHttpMetrics:(NSArray<FIRHTTPMetric *> *)createdHttpMetrics {
  sCreatedHttpMetrics =
      createdHttpMetrics ? [createdHttpMetrics mutableCopy] : [NSMutableArray new];
}

+ (void)recordCreatedHttpMetric:(FIRHTTPMetric *)metric {
  [sCreatedHttpMetrics addObject:metric];
}

+ (void)resetTestState {
  FIRPerformance *shared = [self sharedInstance];
  shared.dataCollectionEnabled = NO;
  shared.instrumentationEnabled = NO;
  [sCreatedTraces removeAllObjects];
  [sCreatedHttpMetrics removeAllObjects];
}

@end
