/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RNFBSharedUtils : NSObject

+ (void)rejectPromiseWithUserInfo:(RCTPromiseRejectBlock)reject
                         userInfo:(NSMutableDictionary *)userInfo;

@end
