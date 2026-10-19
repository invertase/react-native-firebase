/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <GoogleUtilities/GULAppDelegateSwizzler.h>

@implementation GULAppDelegateSwizzler

+ (UIApplication *)sharedApplication {
  return [UIApplication sharedApplication];
}

@end
