#import "RNFirebaseAnalytics.h"
#import <React/RCTUtils.h>

#if __has_include(<FirebaseAnalytics/FIRAnalytics.h>)
#import <FirebaseAnalytics/FIRAnalytics.h>
#import <FirebaseCore/FIRAnalyticsConfiguration.h>

@implementation RNFirebaseAnalytics
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(logEvent:(NSString *)name props:(NSDictionary *)props) {
  [FIRAnalytics logEventWithName:name parameters:props];
}

RCT_EXPORT_METHOD(setAnalyticsCollectionEnabled:(BOOL) enabled) {
  [[FIRAnalyticsConfiguration sharedInstance] setAnalyticsCollectionEnabled:enabled];
}

RCT_EXPORT_METHOD(setCurrentScreen:(NSString *) screenName screenClass:(NSString *) screenClassOverriew) {
  RCTUnsafeExecuteOnMainQueueSync(^{
    [FIRAnalytics setScreenName:screenName screenClass:screenClassOverriew];
  });
}

RCT_EXPORT_METHOD(setUserId: (NSString *) id) {
  [FIRAnalytics setUserID:id];
}

RCT_EXPORT_METHOD(setUserProperty: (NSString *) name value:(NSString *) value) {
  [FIRAnalytics setUserPropertyString:value forName:name];
}

// not implemented on iOS sdk
RCT_EXPORT_METHOD(setMinimumSessionDuration:(nonnull NSNumber *) milliseconds) {}
RCT_EXPORT_METHOD(setSessionTimeoutDuration:(nonnull NSNumber *) milliseconds) {}
@end

#else
@implementation RNFirebaseAnalytics
@end
#endif
