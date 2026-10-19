/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <React/RCTConvert.h>

@implementation RCTConvert

+ (BOOL)BOOL:(id)json {
  if ([json isKindOfClass:[NSNumber class]]) {
    return [(NSNumber *)json boolValue];
  }
  return NO;
}

@end
