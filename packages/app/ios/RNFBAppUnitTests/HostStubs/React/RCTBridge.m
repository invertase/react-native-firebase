/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */
#import "RCTBridge.h"

@interface RCTBridge ()
@property(nonatomic, copy, readwrite, nullable) NSString *lastModule;
@property(nonatomic, copy, readwrite, nullable) NSString *lastMethod;
@property(nonatomic, strong, readwrite, nullable) NSArray *lastArgs;
@end

@implementation RCTBridge

- (void)enqueueJSCall:(NSString *)module
               method:(NSString *)method
                 args:(NSArray *)args
           completion:(void (^)(void))completion {
  self.lastModule = [module copy];
  self.lastMethod = [method copy];
  self.lastArgs = [args copy];
  if (completion) {
    completion();
  }
}

- (void)resetLastJSCallForTesting {
  self.lastModule = nil;
  self.lastMethod = nil;
  self.lastArgs = nil;
}

@end
