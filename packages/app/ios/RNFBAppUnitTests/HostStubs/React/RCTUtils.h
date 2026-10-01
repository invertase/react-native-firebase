/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production
 * pod.
 */
#import <Foundation/Foundation.h>

static inline void RCTUnsafeExecuteOnMainQueueSync(dispatch_block_t block) {
  block();
}
