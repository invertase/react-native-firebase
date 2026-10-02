/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBApp/RNFBSharedUtils.h"

@implementation RNFBSharedUtils

+ (void)rejectPromiseWithExceptionDict:(RCTPromiseRejectBlock)reject
                             exception:(NSException *)exception {
  if (reject == nil) {
    return;
  }
  reject(@"unknown", exception.reason ?: @"", nil);
}

+ (void)rejectPromiseWithNSError:(RCTPromiseRejectBlock)reject error:(NSError *)error {
  if (reject == nil) {
    return;
  }
  reject(@"unknown", error.localizedDescription ?: @"", error);
}

+ (void)rejectPromiseWithUserInfo:(RCTPromiseRejectBlock)reject
                         userInfo:(NSMutableDictionary *)userInfo {
  if (reject == nil) {
    return;
  }
  NSString *code = userInfo[@"code"] ?: @"unknown";
  NSString *message = userInfo[@"message"] ?: @"";
  reject(code, message, nil);
}

@end
