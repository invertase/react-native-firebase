/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

@interface RNFBJSON : NSObject
+ (RNFBJSON *)shared;
- (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue;
@end
