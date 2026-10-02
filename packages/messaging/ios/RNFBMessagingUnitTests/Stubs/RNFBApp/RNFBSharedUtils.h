/**
 * Host-test stand-in for RNFBApp's RNFBSharedUtils (reject helpers only).
 */

#ifndef RNFBSharedUtils_h
#define RNFBSharedUtils_h

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

#define DLog(...)
#define ELog(...)

@interface RNFBSharedUtils : NSObject

+ (void)rejectPromiseWithExceptionDict:(RCTPromiseRejectBlock)reject
                             exception:(NSException *)exception;

+ (void)rejectPromiseWithNSError:(RCTPromiseRejectBlock)reject error:(NSError *)error;

+ (void)rejectPromiseWithUserInfo:(RCTPromiseRejectBlock)reject
                         userInfo:(NSMutableDictionary *)userInfo;

@end

#endif
