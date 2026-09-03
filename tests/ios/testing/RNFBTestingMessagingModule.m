#import <Foundation/Foundation.h>
#import <FirebaseMessaging/FirebaseMessaging.h>
#import <React/RCTBridgeModule.h>

/**
 * Dedicated-test-app probe for messaging e2e: confirm an existing
 * FIRMessagingDelegate installed in AppDelegate is still invoked after
 * RNFB Messaging initializes. Not coverage — lives here so the coverage
 * TurboModule stays product-neutral (`react-native-coverage`).
 */
@interface RNFBTestingMessagingModule : NSObject <RCTBridgeModule>
@end

@implementation RNFBTestingMessagingModule

RCT_EXPORT_MODULE(RNFBTestingMessaging);

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

@end
