/**
 * Host-only stand-in for the generated RNFBFunctions-Swift.h CallHandler /
 * StreamHandler surface. Used when compiling RNFBFunctionsHelper.m under
 * macOS XCTest without the real FirebaseFunctions Swift module.
 */
#import <Foundation/Foundation.h>

@class FIRApp;

@interface RNFBFunctionsCallHandler : NSObject

+ (id)createFunctionsForApp:(FIRApp *)app
          customUrlOrRegion:(NSString *)customUrlOrRegion
               emulatorHost:(NSString *_Nullable)emulatorHost
               emulatorPort:(int)emulatorPort;

- (void)callFunctionWithApp:(FIRApp *)app
                  functions:(id)functions
                       name:(NSString *)name
                       data:(id _Nullable)data
                    timeout:(double)timeout
    limitedUseAppCheckToken:(NSNumber *_Nullable)limitedUseAppCheckToken
                 completion:(void (^)(NSDictionary *_Nullable result,
                                      NSDictionary *_Nullable error))completion;

- (void)callFunctionWithURLWithApp:(FIRApp *)app
                         functions:(id)functions
                               url:(NSString *)url
                              data:(id _Nullable)data
                           timeout:(double)timeout
           limitedUseAppCheckToken:(NSNumber *_Nullable)limitedUseAppCheckToken
                        completion:(void (^)(NSDictionary *_Nullable result,
                                             NSDictionary *_Nullable error))completion;

/** Test seams */
@property(class, nonatomic, copy, nullable) NSString *lastCreateCustomUrlOrRegion;
@property(class, nonatomic, copy, nullable) NSString *lastCreateEmulatorHost;
@property(class, nonatomic, assign) int lastCreateEmulatorPort;
@property(class, nonatomic, copy, nullable) NSString *lastCallName;
@property(class, nonatomic, copy, nullable) NSString *lastCallURL;
@property(class, nonatomic, strong, nullable) id lastCallData;
@property(class, nonatomic, assign) double lastCallTimeout;
@property(class, nonatomic, strong, nullable) NSNumber *lastLimitedUseAppCheckToken;
@property(class, nonatomic, copy, nullable) NSDictionary *completionResult;
@property(class, nonatomic, copy, nullable) NSDictionary *completionError;

+ (void)resetTestState;

@end

@interface RNFBFunctionsStreamHandler : NSObject

- (void)startStreamWithApp:(FIRApp *)app
                 functions:(id)functions
              functionName:(NSString *)functionName
                parameters:(id _Nullable)parameters
                   timeout:(double)timeout
             eventCallback:(void (^)(NSDictionary *event))eventCallback;

- (void)startStreamWithApp:(FIRApp *)app
                 functions:(id)functions
               functionUrl:(NSString *)functionUrl
                parameters:(id _Nullable)parameters
                   timeout:(double)timeout
             eventCallback:(void (^)(NSDictionary *event))eventCallback;

- (void)cancel;

/** Test seams */
@property(class, nonatomic, copy, nullable) NSString *lastFunctionName;
@property(class, nonatomic, copy, nullable) NSString *lastFunctionUrl;
@property(class, nonatomic, strong, nullable) id lastParameters;
@property(class, nonatomic, assign) double lastTimeout;
@property(class, nonatomic, assign) NSUInteger cancelCallCount;
@property(class, nonatomic, copy, nullable) void (^lastEventCallback)(NSDictionary *event);

+ (void)resetTestState;

@end
