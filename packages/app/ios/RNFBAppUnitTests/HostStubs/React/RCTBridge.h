/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

@interface RCTBridge : NSObject

@property(nonatomic, readonly, nullable) NSString *lastModule;
@property(nonatomic, readonly, nullable) NSString *lastMethod;
@property(nonatomic, readonly, nullable) NSArray *lastArgs;

- (void)enqueueJSCall:(NSString *)module
               method:(NSString *)method
                 args:(NSArray *)args
           completion:(void (^)(void))completion;

- (void)resetLastJSCallForTesting;

@end
