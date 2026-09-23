/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */

#import "RCTConvert.h"

@implementation RCTConvert

+ (NSString *)NSString:(id)json {
  if ([json isKindOfClass:[NSString class]]) {
    return json;
  }
  return [json description];
}

+ (NSDictionary *)NSDictionary:(id)json {
  if ([json isKindOfClass:[NSDictionary class]]) {
    return json;
  }
  return nil;
}

@end
