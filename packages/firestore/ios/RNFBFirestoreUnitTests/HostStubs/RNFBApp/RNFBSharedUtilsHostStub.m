/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBApp/RNFBSharedUtils.h"

@implementation RNFBSharedUtils

+ (void)rejectPromiseWithUserInfo:(RCTPromiseRejectBlock)reject
                         userInfo:(NSMutableDictionary *)userInfo {
  if (reject == nil) {
    return;
  }
  NSString *code = userInfo[@"code"] ?: @"unknown";
  NSString *message = userInfo[@"message"] ?: @"";
  reject(code, message, nil);
}

+ (void)rejectPromiseWithExceptionDict:(RCTPromiseRejectBlock)reject
                             exception:(NSException *)exception {
  if (reject == nil) {
    return;
  }
  reject(@"exception", exception.reason ?: @"", nil);
}

+ (NSString *)getAppJavaScriptName:(NSString *)nativeAppName {
  return nativeAppName ?: @"[DEFAULT]";
}

@end
