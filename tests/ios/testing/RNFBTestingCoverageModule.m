#import <Foundation/Foundation.h>
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <React/RCTBridgeModule.h>
#import <RNFBMessaging/RNFBMessaging+AppDelegate.h>
#import <UIKit/UIKit.h>

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

RCT_EXPORT_METHOD(messagingPreservesExistingDelegate
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)
{
  NSString *probeKey = @"rnfb_testing_messaging_delegate_called";
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  [defaults removeObjectForKey:probeKey];

  id<FIRMessagingDelegate> delegate = [FIRMessaging messaging].delegate;
  [delegate messaging:[FIRMessaging messaging] didReceiveRegistrationToken:@"rnfb-delegate-test"];

  resolve(@([defaults boolForKey:probeKey]));
  [defaults removeObjectForKey:probeKey];
}

RCT_EXPORT_METHOD(completesNonFCMRemoteNotification
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)
{
  __block BOOL completed = NO;
  [[RNFBMessagingAppDelegate sharedInstance]
                  application:[UIApplication sharedApplication]
      didReceiveRemoteNotification:@{@"custom" : @"value"}
            fetchCompletionHandler:^(UIBackgroundFetchResult result) {
              completed = YES;
            }];
  resolve(@(completed));
}

@end
