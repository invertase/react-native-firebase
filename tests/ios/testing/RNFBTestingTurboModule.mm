#import "RNFBTestingTurboModule.h"

#import <FirebaseMessaging/FirebaseMessaging.h>
#import <RNFBMessaging/RNFBMessaging+AppDelegate.h>
#import <RNFBMessaging/RNFBMessagingSerializer.h>
#import <UIKit/UIKit.h>

@implementation RNFBTestingTurboModule

RCT_EXPORT_MODULE(NativeRNFBTesting)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNFBTestingSpecJSI>(params);
}

- (void)messagingPreservesExistingDelegate:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject
{
  NSString *probeKey = @"rnfb_testing_messaging_delegate_called";
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  [defaults removeObjectForKey:probeKey];

  id<FIRMessagingDelegate> delegate = [FIRMessaging messaging].delegate;
  [delegate messaging:[FIRMessaging messaging] didReceiveRegistrationToken:@"rnfb-delegate-test"];

  resolve(@([defaults boolForKey:probeKey]));
  [defaults removeObjectForKey:probeKey];
}

- (void)completesNonFCMRemoteNotification:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject
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

- (void)messagingStoreSupportsDisabledStorage:(RCTPromiseResolveBlock)resolve
                                     reject:(RCTPromiseRejectBlock)reject
{
  // Android-only probe — SharedPreferences / messaging store path is not used on iOS.
  resolve(@(NO));
}

- (void)serializeMessagingUserInfo:(NSDictionary *)userInfo
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject
{
  resolve([RNFBMessagingSerializer remoteMessageUserInfoToDict:userInfo]);
}

@end
