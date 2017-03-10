#import "RNFirebase.h"
#import "RNFirebaseEvents.h"
#import "RNFirebaseAnalytics.h"
#import "Firebase.h"

@implementation RNFirebaseAnalytics
- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

RCT_EXPORT_MODULE(RNFirebaseAnalytics);

// Implementation
RCT_EXPORT_METHOD(logEvent:(NSString *)name
                  props:(NSDictionary *)props)
{
  NSString *debugMsg = [NSString stringWithFormat:@"%@: %@ with %@",
                          @"RNFirebaseAnalytics", name, props];
  [[RNFirebase sharedInstance] debugLog:@"logEventWithName called"
                                   msg:debugMsg];

  [FIRAnalytics logEventWithName:name parameters:props];
}

RCT_EXPORT_METHOD(setAnalyticsCollectionEnabled:(BOOL) enabled)
{
  [[FIRAnalyticsConfiguration sharedInstance] setAnalyticsCollectionEnabled:enabled];
}

RCT_EXPORT_METHOD(setCurrentScreen:(NSString *) screenName
                       screenClass:(NSString *) screenClassOverriew)
{
  [FIRAnalytics setScreenName:screenName screenClass:screenClassOverriew];
}

RCT_EXPORT_METHOD(setMinimumSessionDuration:(nonnull NSNumber *) milliseconds)
{
  //Not implemented on iOS
}

RCT_EXPORT_METHOD(setSessionTimeoutDuration:(nonnull NSNumber *) milliseconds)
{
  //Not implemented on iOS
}

RCT_EXPORT_METHOD(setUserId: (NSString *) id)
{
  [FIRAnalytics setUserID:id];
}

RCT_EXPORT_METHOD(setUserProperty: (NSString *) name
  value:(NSString *) value)
{
  [FIRAnalytics setUserPropertyString:value forName:name];
}

@end
