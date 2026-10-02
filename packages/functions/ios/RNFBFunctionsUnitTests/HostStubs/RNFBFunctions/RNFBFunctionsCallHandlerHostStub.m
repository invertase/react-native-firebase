/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBFunctionsCallHandler-Swift.inc"

#import <Firebase/Firebase.h>

@implementation RNFBFunctionsCallHandler

static NSString *sLastCreateCustomUrlOrRegion;
static NSString *sLastCreateEmulatorHost;
static int sLastCreateEmulatorPort;
static NSString *sLastCallName;
static NSString *sLastCallURL;
static id sLastCallData;
static double sLastCallTimeout;
static NSNumber *sLastLimitedUseAppCheckToken;
static NSDictionary *sCompletionResult;
static NSDictionary *sCompletionError;

+ (NSString *)lastCreateCustomUrlOrRegion {
  return sLastCreateCustomUrlOrRegion;
}
+ (void)setLastCreateCustomUrlOrRegion:(NSString *)value {
  sLastCreateCustomUrlOrRegion = [value copy];
}
+ (NSString *)lastCreateEmulatorHost {
  return sLastCreateEmulatorHost;
}
+ (void)setLastCreateEmulatorHost:(NSString *)value {
  sLastCreateEmulatorHost = [value copy];
}
+ (int)lastCreateEmulatorPort {
  return sLastCreateEmulatorPort;
}
+ (void)setLastCreateEmulatorPort:(int)value {
  sLastCreateEmulatorPort = value;
}
+ (NSString *)lastCallName {
  return sLastCallName;
}
+ (void)setLastCallName:(NSString *)value {
  sLastCallName = [value copy];
}
+ (NSString *)lastCallURL {
  return sLastCallURL;
}
+ (void)setLastCallURL:(NSString *)value {
  sLastCallURL = [value copy];
}
+ (id)lastCallData {
  return sLastCallData;
}
+ (void)setLastCallData:(id)value {
  sLastCallData = value;
}
+ (double)lastCallTimeout {
  return sLastCallTimeout;
}
+ (void)setLastCallTimeout:(double)value {
  sLastCallTimeout = value;
}
+ (NSNumber *)lastLimitedUseAppCheckToken {
  return sLastLimitedUseAppCheckToken;
}
+ (void)setLastLimitedUseAppCheckToken:(NSNumber *)value {
  sLastLimitedUseAppCheckToken = value;
}
+ (NSDictionary *)completionResult {
  return sCompletionResult;
}
+ (void)setCompletionResult:(NSDictionary *)value {
  sCompletionResult = [value copy];
}
+ (NSDictionary *)completionError {
  return sCompletionError;
}
+ (void)setCompletionError:(NSDictionary *)value {
  sCompletionError = [value copy];
}

+ (void)resetTestState {
  sLastCreateCustomUrlOrRegion = nil;
  sLastCreateEmulatorHost = nil;
  sLastCreateEmulatorPort = 0;
  sLastCallName = nil;
  sLastCallURL = nil;
  sLastCallData = nil;
  sLastCallTimeout = 0;
  sLastLimitedUseAppCheckToken = nil;
  sCompletionResult = nil;
  sCompletionError = nil;
}

+ (id)createFunctionsForApp:(FIRApp *)app
          customUrlOrRegion:(NSString *)customUrlOrRegion
               emulatorHost:(NSString *)emulatorHost
               emulatorPort:(int)emulatorPort {
  (void)app;
  sLastCreateCustomUrlOrRegion = [customUrlOrRegion copy];
  sLastCreateEmulatorHost = [emulatorHost copy];
  sLastCreateEmulatorPort = emulatorPort;
  return @{@"stubFunctions" : @YES};
}

- (void)callFunctionWithApp:(FIRApp *)app
                  functions:(id)functions
                       name:(NSString *)name
                       data:(id)data
                    timeout:(double)timeout
    limitedUseAppCheckToken:(NSNumber *)limitedUseAppCheckToken
                 completion:(void (^)(NSDictionary *, NSDictionary *))completion {
  (void)app;
  (void)functions;
  sLastCallName = [name copy];
  sLastCallURL = nil;
  sLastCallData = data;
  sLastCallTimeout = timeout;
  sLastLimitedUseAppCheckToken = limitedUseAppCheckToken;
  if (completion != nil) {
    completion(sCompletionResult, sCompletionError);
  }
}

- (void)callFunctionWithURLWithApp:(FIRApp *)app
                         functions:(id)functions
                               url:(NSString *)url
                              data:(id)data
                           timeout:(double)timeout
           limitedUseAppCheckToken:(NSNumber *)limitedUseAppCheckToken
                        completion:(void (^)(NSDictionary *, NSDictionary *))completion {
  (void)app;
  (void)functions;
  sLastCallName = nil;
  sLastCallURL = [url copy];
  sLastCallData = data;
  sLastCallTimeout = timeout;
  sLastLimitedUseAppCheckToken = limitedUseAppCheckToken;
  if (completion != nil) {
    completion(sCompletionResult, sCompletionError);
  }
}

@end

@implementation RNFBFunctionsStreamHandler

static NSString *sLastFunctionName;
static NSString *sLastFunctionUrl;
static id sLastParameters;
static double sLastTimeout;
static NSUInteger sCancelCallCount;
static void (^sLastEventCallback)(NSDictionary *event);

+ (NSString *)lastFunctionName {
  return sLastFunctionName;
}
+ (void)setLastFunctionName:(NSString *)value {
  sLastFunctionName = [value copy];
}
+ (NSString *)lastFunctionUrl {
  return sLastFunctionUrl;
}
+ (void)setLastFunctionUrl:(NSString *)value {
  sLastFunctionUrl = [value copy];
}
+ (id)lastParameters {
  return sLastParameters;
}
+ (void)setLastParameters:(id)value {
  sLastParameters = value;
}
+ (double)lastTimeout {
  return sLastTimeout;
}
+ (void)setLastTimeout:(double)value {
  sLastTimeout = value;
}
+ (NSUInteger)cancelCallCount {
  return sCancelCallCount;
}
+ (void)setCancelCallCount:(NSUInteger)value {
  sCancelCallCount = value;
}
+ (void (^)(NSDictionary *))lastEventCallback {
  return sLastEventCallback;
}
+ (void)setLastEventCallback:(void (^)(NSDictionary *))value {
  sLastEventCallback = [value copy];
}

+ (void)resetTestState {
  sLastFunctionName = nil;
  sLastFunctionUrl = nil;
  sLastParameters = nil;
  sLastTimeout = 0;
  sCancelCallCount = 0;
  sLastEventCallback = nil;
}

- (void)startStreamWithApp:(FIRApp *)app
                 functions:(id)functions
              functionName:(NSString *)functionName
                parameters:(id)parameters
                   timeout:(double)timeout
             eventCallback:(void (^)(NSDictionary *))eventCallback {
  (void)app;
  (void)functions;
  sLastFunctionName = [functionName copy];
  sLastFunctionUrl = nil;
  sLastParameters = parameters;
  sLastTimeout = timeout;
  sLastEventCallback = [eventCallback copy];
}

- (void)startStreamWithApp:(FIRApp *)app
                 functions:(id)functions
               functionUrl:(NSString *)functionUrl
                parameters:(id)parameters
                   timeout:(double)timeout
             eventCallback:(void (^)(NSDictionary *))eventCallback {
  (void)app;
  (void)functions;
  sLastFunctionName = nil;
  sLastFunctionUrl = [functionUrl copy];
  sLastParameters = parameters;
  sLastTimeout = timeout;
  sLastEventCallback = [eventCallback copy];
}

- (void)cancel {
  sCancelCallCount += 1;
}

@end
