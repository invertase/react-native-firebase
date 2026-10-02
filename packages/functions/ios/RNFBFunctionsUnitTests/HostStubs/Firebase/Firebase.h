/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Enough of Firebase Core for compiling RNFBFunctionsHelper.m without the SDK.
 */
#import <Foundation/Foundation.h>

@interface FIRApp : NSObject
@property(nonatomic, copy) NSString *name;
- (instancetype)initWithName:(NSString *)name;
@end
