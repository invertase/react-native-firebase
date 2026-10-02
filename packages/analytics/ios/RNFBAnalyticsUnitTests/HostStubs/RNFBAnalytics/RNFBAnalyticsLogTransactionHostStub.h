/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Declares the ObjC surface of `RNFBAnalyticsLogTransaction` so
 * `RNFBAnalyticsHelper.m` compiles without StoreKit / FirebaseAnalytics.
 */
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RNFBAnalyticsLogTransaction : NSObject

@property(class, nonatomic, copy, nullable) NSString *lastTransactionId;
@property(class, nonatomic, assign) NSUInteger logCallCount;

+ (void)resetTestState;

- (void)logTransactionWithTransactionId:(NSString *)transactionId
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject;

@end
