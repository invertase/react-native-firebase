/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <RNFBApp/RNFBJSON.h>

@implementation RNFBJSON

+ (RNFBJSON *)shared {
  static RNFBJSON *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBJSON alloc] init];
  });
  return shared;
}

- (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue {
  (void)key;
  return defaultValue;
}

@end
