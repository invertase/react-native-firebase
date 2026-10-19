/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Enough of Firebase Core / App Check for compiling RNFBAppCheckHelper.m
 * and driving token completion branches without linking the SDK.
 */
#import <Foundation/Foundation.h>

@interface FIRApp : NSObject
@property(nonatomic, copy) NSString *name;
- (instancetype)initWithName:(NSString *)name;
@end

@interface FIRAppCheckToken : NSObject
@property(nonatomic, readonly, copy) NSString *token;
- (instancetype)initWithToken:(NSString *)token;
@end

@protocol FIRAppCheckProvider <NSObject>
@end

@protocol FIRAppCheckProviderFactory <NSObject>
- (nullable id<FIRAppCheckProvider>)createProviderWithApp:(FIRApp *)app;
@end

typedef void (^FIRAppCheckTokenCompletionBlock)(FIRAppCheckToken *_Nullable token,
                                                NSError *_Nullable error);

@interface FIRAppCheck : NSObject

@property(nonatomic, assign) BOOL isTokenAutoRefreshEnabled;

+ (void)setAppCheckProviderFactory:(nullable id<FIRAppCheckProviderFactory>)factory;
+ (instancetype)appCheckWithApp:(FIRApp *)app;

- (void)tokenForcingRefresh:(BOOL)forceRefresh
                 completion:(FIRAppCheckTokenCompletionBlock)completion;
- (void)limitedUseTokenWithCompletion:(FIRAppCheckTokenCompletionBlock)completion;

/** Test seam: when set, invoked instead of a network/token fetch. */
@property(class, nonatomic, copy, nullable) void (^tokenForcingRefreshHandler)
    (BOOL forceRefresh, FIRAppCheckTokenCompletionBlock completion);
@property(class, nonatomic, copy, nullable) void (^limitedUseTokenHandler)
    (FIRAppCheckTokenCompletionBlock completion);

+ (void)resetTestState;

@end
