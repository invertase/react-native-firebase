/**
 * Host-test stand-in for React's RCTUtils (IosTest-AD-1). Not shipped in the
 * production pod.
 */

#import <Foundation/Foundation.h>

static inline BOOL RCTRunningInAppExtension(void) { return NO; }

static inline void RCTUnsafeExecuteOnMainQueueSync(dispatch_block_t block) {
  block();
}
