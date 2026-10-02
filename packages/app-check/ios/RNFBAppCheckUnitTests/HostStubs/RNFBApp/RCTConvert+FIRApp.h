/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

@class FIRApp;

@interface RCTConvert : NSObject
+ (FIRApp *)firAppFromString:(NSString *)appName;
/** Test seam: map appName → FIRApp. Cleared via resetTestState. */
+ (void)setFirAppFromStringHandler:(FIRApp * (^)(NSString *appName))handler;
+ (void)resetTestState;
@end
