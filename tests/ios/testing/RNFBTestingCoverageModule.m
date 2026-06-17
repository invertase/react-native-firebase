#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

#import "RNFBTestingCoverageProfile.h"

@interface RNFBTestingCoverageModule : NSObject <RCTBridgeModule>
@end

@implementation RNFBTestingCoverageModule

RCT_EXPORT_MODULE(RNFBTestingCoverage);

RCT_EXPORT_METHOD(flush : (RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject)
{
  int status = RNFBTestingFlushCoverageProfile();
  if (status == 0) {
    resolve(@(YES));
  } else {
    reject(@"coverage_flush_failed", @"Failed to write LLVM profile data", nil);
  }
}

@end
