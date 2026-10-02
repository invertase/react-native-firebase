/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBAnalytics/RNFBAnalyticsLogTransactionHostStub.h"

@implementation RNFBAnalyticsLogTransaction

static NSString *sLastTransactionId;
static NSUInteger sLogCallCount;

+ (NSString *)lastTransactionId {
  return sLastTransactionId;
}

+ (void)setLastTransactionId:(NSString *)lastTransactionId {
  sLastTransactionId = [lastTransactionId copy];
}

+ (NSUInteger)logCallCount {
  return sLogCallCount;
}

+ (void)setLogCallCount:(NSUInteger)logCallCount {
  sLogCallCount = logCallCount;
}

+ (void)resetTestState {
  sLastTransactionId = nil;
  sLogCallCount = 0;
}

- (void)logTransactionWithTransactionId:(NSString *)transactionId
                                resolve:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
  (void)reject;
  sLastTransactionId = [transactionId copy];
  sLogCallCount += 1;
  if (resolve != nil) {
    resolve([NSNull null]);
  }
}

@end
