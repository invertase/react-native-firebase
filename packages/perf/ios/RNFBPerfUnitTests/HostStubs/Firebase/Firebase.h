/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Enough of Firebase Performance for compiling RNFBPerfHelper.m and
 * asserting SDK call wiring without linking the real SDK.
 */
#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, FIRHTTPMethod) {
  FIRHTTPMethodGET = 0,
  FIRHTTPMethodPUT = 1,
  FIRHTTPMethodPOST = 2,
  FIRHTTPMethodDELETE = 3,
  FIRHTTPMethodHEAD = 4,
  FIRHTTPMethodPATCH = 5,
  FIRHTTPMethodOPTIONS = 6,
  FIRHTTPMethodTRACE = 7,
  FIRHTTPMethodCONNECT = 8,
};

@interface FIRTrace : NSObject

@property(nonatomic, readonly, copy) NSString *name;
@property(nonatomic, assign) NSUInteger startCallCount;
@property(nonatomic, assign) NSUInteger stopCallCount;
@property(nonatomic, readonly, strong) NSMutableDictionary<NSString *, NSNumber *> *metrics;
@property(nonatomic, readonly, strong) NSMutableDictionary<NSString *, NSString *> *attributes;

- (instancetype)initWithName:(NSString *)name;
- (void)start;
- (void)stop;
- (void)setIntValue:(int64_t)value forMetric:(NSString *)metricName;
- (void)setValue:(NSString *)value forAttribute:(NSString *)attributeName;

@end

@interface FIRHTTPMetric : NSObject

@property(nonatomic, readonly, copy) NSURL *url;
@property(nonatomic, readonly, assign) FIRHTTPMethod HTTPMethod;
@property(nonatomic, assign) NSUInteger startCallCount;
@property(nonatomic, assign) NSUInteger stopCallCount;
@property(nonatomic, assign) NSInteger responseCode;
@property(nonatomic, assign) NSInteger requestPayloadSize;
@property(nonatomic, assign) NSInteger responsePayloadSize;
@property(nonatomic, copy, nullable) NSString *responseContentType;
@property(nonatomic, readonly, strong) NSMutableDictionary<NSString *, NSString *> *attributes;

- (instancetype)initWithURL:(NSURL *)url HTTPMethod:(FIRHTTPMethod)httpMethod;
- (void)start;
- (void)stop;
- (void)setValue:(NSString *)value forAttribute:(NSString *)attributeName;
- (void)setResponseCode:(NSInteger)responseCode;
- (void)setRequestPayloadSize:(NSInteger)bytes;
- (void)setResponsePayloadSize:(NSInteger)bytes;
- (void)setResponseContentType:(NSString *)contentType;

@end

@interface FIRPerformance : NSObject

@property(nonatomic, assign) BOOL dataCollectionEnabled;
@property(nonatomic, assign) BOOL instrumentationEnabled;

+ (instancetype)sharedInstance;

- (FIRTrace *)traceWithName:(NSString *)name;

/** Test seams */
@property(class, nonatomic, copy, nullable) NSArray<FIRTrace *> *createdTraces;
@property(class, nonatomic, copy, nullable) NSArray<FIRHTTPMetric *> *createdHttpMetrics;

+ (void)resetTestState;
+ (void)recordCreatedHttpMetric:(FIRHTTPMetric *)metric;

@end
