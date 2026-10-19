/**
 * Host-test stand-in for React's RCTUtils (IosTest-AD-1). Not shipped in the
 * production pod.
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

static inline BOOL RCTRunningInAppExtension(void) { return NO; }

static inline UIApplication *RCTSharedApplication(void) {
  return [UIApplication sharedApplication];
}

static inline void RCTUnsafeExecuteOnMainQueueSync(dispatch_block_t block) { block(); }
