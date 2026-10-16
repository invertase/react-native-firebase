/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBApp/RCTConvert+FIRApp.h"

#import <Firebase/Firebase.h>

@implementation RCTConvert

static FIRApp * (^sFirAppFromStringHandler)(NSString *appName);

+ (FIRApp *)firAppFromString:(NSString *)appName {
  if (sFirAppFromStringHandler != nil) {
    return sFirAppFromStringHandler(appName);
  }
  return [[FIRApp alloc] initWithName:appName ?: @"[DEFAULT]"];
}

+ (void)setFirAppFromStringHandler:(FIRApp * (^)(NSString *appName))handler {
  sFirAppFromStringHandler = [handler copy];
}

+ (void)resetTestState {
  sFirAppFromStringHandler = nil;
}

@end
