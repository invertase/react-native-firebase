/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Firebase/Firebase.h>

@implementation FIRAnalytics

static NSString *sLastLogEventName;
static NSDictionary *sLastLogEventParameters;
static BOOL sAnalyticsCollectionEnabledValue;
static NSString *sUserIDValue;
static NSMutableDictionary *sUserProperties;
static NSUInteger sResetAnalyticsDataCallCount;
static NSTimeInterval sSessionTimeoutIntervalValue;
static NSString *sAppInstanceIDValue;
static int64_t sSessionIDCompletionValue;
static NSError *sSessionIDCompletionError;
static BOOL sSessionIDCompletionDeferred;
static void (^sDeferredSessionIDCompletion)(int64_t, NSError *);
static NSDictionary *sLastDefaultEventParameters;
static NSString *sLastConversionEmail;
static NSData *sLastHashedEmail;
static NSString *sLastConversionPhone;
static NSData *sLastHashedPhone;
static NSDictionary *sLastConsent;
static BOOL sShouldThrowOnNextCall;

+ (void)initialize {
  if (self == [FIRAnalytics class]) {
    sUserProperties = [NSMutableDictionary new];
  }
}

+ (NSString *)lastLogEventName {
  return sLastLogEventName;
}

+ (void)setLastLogEventName:(NSString *)lastLogEventName {
  sLastLogEventName = [lastLogEventName copy];
}

+ (NSDictionary *)lastLogEventParameters {
  return sLastLogEventParameters;
}

+ (void)setLastLogEventParameters:(NSDictionary *)lastLogEventParameters {
  sLastLogEventParameters = [lastLogEventParameters copy];
}

+ (BOOL)analyticsCollectionEnabledValue {
  return sAnalyticsCollectionEnabledValue;
}

+ (void)setAnalyticsCollectionEnabledValue:(BOOL)analyticsCollectionEnabledValue {
  sAnalyticsCollectionEnabledValue = analyticsCollectionEnabledValue;
}

+ (NSString *)userIDValue {
  return sUserIDValue;
}

+ (void)setUserIDValue:(NSString *)userIDValue {
  sUserIDValue = [userIDValue copy];
}

+ (NSMutableDictionary *)userProperties {
  return sUserProperties;
}

+ (void)setUserProperties:(NSMutableDictionary *)userProperties {
  [sUserProperties removeAllObjects];
  if (userProperties != nil) {
    [sUserProperties addEntriesFromDictionary:userProperties];
  }
}

+ (NSUInteger)resetAnalyticsDataCallCount {
  return sResetAnalyticsDataCallCount;
}

+ (void)setResetAnalyticsDataCallCount:(NSUInteger)resetAnalyticsDataCallCount {
  sResetAnalyticsDataCallCount = resetAnalyticsDataCallCount;
}

+ (NSTimeInterval)sessionTimeoutIntervalValue {
  return sSessionTimeoutIntervalValue;
}

+ (void)setSessionTimeoutIntervalValue:(NSTimeInterval)sessionTimeoutIntervalValue {
  sSessionTimeoutIntervalValue = sessionTimeoutIntervalValue;
}

+ (NSString *)appInstanceIDValue {
  return sAppInstanceIDValue;
}

+ (void)setAppInstanceIDValue:(NSString *)appInstanceIDValue {
  sAppInstanceIDValue = [appInstanceIDValue copy];
}

+ (int64_t)sessionIDCompletionValue {
  return sSessionIDCompletionValue;
}

+ (void)setSessionIDCompletionValue:(int64_t)sessionIDCompletionValue {
  sSessionIDCompletionValue = sessionIDCompletionValue;
}

+ (NSError *)sessionIDCompletionError {
  return sSessionIDCompletionError;
}

+ (void)setSessionIDCompletionError:(NSError *)sessionIDCompletionError {
  sSessionIDCompletionError = sessionIDCompletionError;
}

+ (BOOL)sessionIDCompletionDeferred {
  return sSessionIDCompletionDeferred;
}

+ (void)setSessionIDCompletionDeferred:(BOOL)sessionIDCompletionDeferred {
  sSessionIDCompletionDeferred = sessionIDCompletionDeferred;
}

+ (NSDictionary *)lastDefaultEventParameters {
  return sLastDefaultEventParameters;
}

+ (void)setLastDefaultEventParameters:(NSDictionary *)lastDefaultEventParameters {
  sLastDefaultEventParameters = [lastDefaultEventParameters copy];
}

+ (NSString *)lastConversionEmail {
  return sLastConversionEmail;
}

+ (void)setLastConversionEmail:(NSString *)lastConversionEmail {
  sLastConversionEmail = [lastConversionEmail copy];
}

+ (NSData *)lastHashedEmail {
  return sLastHashedEmail;
}

+ (void)setLastHashedEmail:(NSData *)lastHashedEmail {
  sLastHashedEmail = [lastHashedEmail copy];
}

+ (NSString *)lastConversionPhone {
  return sLastConversionPhone;
}

+ (void)setLastConversionPhone:(NSString *)lastConversionPhone {
  sLastConversionPhone = [lastConversionPhone copy];
}

+ (NSData *)lastHashedPhone {
  return sLastHashedPhone;
}

+ (void)setLastHashedPhone:(NSData *)lastHashedPhone {
  sLastHashedPhone = [lastHashedPhone copy];
}

+ (NSDictionary *)lastConsent {
  return sLastConsent;
}

+ (void)setLastConsent:(NSDictionary *)lastConsent {
  sLastConsent = [lastConsent copy];
}

+ (BOOL)shouldThrowOnNextCall {
  return sShouldThrowOnNextCall;
}

+ (void)setShouldThrowOnNextCall:(BOOL)shouldThrowOnNextCall {
  sShouldThrowOnNextCall = shouldThrowOnNextCall;
}

+ (void)resetTestState {
  sLastLogEventName = nil;
  sLastLogEventParameters = nil;
  sAnalyticsCollectionEnabledValue = NO;
  sUserIDValue = nil;
  [sUserProperties removeAllObjects];
  sResetAnalyticsDataCallCount = 0;
  sSessionTimeoutIntervalValue = 0;
  sAppInstanceIDValue = nil;
  sSessionIDCompletionValue = 0;
  sSessionIDCompletionError = nil;
  sSessionIDCompletionDeferred = NO;
  sDeferredSessionIDCompletion = nil;
  sLastDefaultEventParameters = nil;
  sLastConversionEmail = nil;
  sLastHashedEmail = nil;
  sLastConversionPhone = nil;
  sLastHashedPhone = nil;
  sLastConsent = nil;
  sShouldThrowOnNextCall = NO;
}

+ (void)throwIfRequested {
  if (sShouldThrowOnNextCall) {
    sShouldThrowOnNextCall = NO;
    @throw [NSException exceptionWithName:@"FIRAnalyticsTestException"
                                   reason:@"stub throw"
                                 userInfo:nil];
  }
}

+ (void)flushDeferredSessionIDCompletion {
  if (sDeferredSessionIDCompletion != nil) {
    void (^completion)(int64_t, NSError *) = sDeferredSessionIDCompletion;
    sDeferredSessionIDCompletion = nil;
    completion(sSessionIDCompletionValue, sSessionIDCompletionError);
  }
}

+ (void)logEventWithName:(NSString *)name parameters:(NSDictionary<NSString *, id> *)parameters {
  [self throwIfRequested];
  sLastLogEventName = [name copy];
  sLastLogEventParameters = [parameters copy];
}

+ (void)setAnalyticsCollectionEnabled:(BOOL)enabled {
  [self throwIfRequested];
  sAnalyticsCollectionEnabledValue = enabled;
}

+ (void)setUserID:(NSString *)userID {
  [self throwIfRequested];
  sUserIDValue = [userID copy];
}

+ (void)setUserPropertyString:(NSString *)value forName:(NSString *)name {
  [self throwIfRequested];
  if (name == nil) {
    return;
  }
  if (value == nil) {
    [sUserProperties removeObjectForKey:name];
  } else {
    sUserProperties[name] = value;
  }
}

+ (void)resetAnalyticsData {
  [self throwIfRequested];
  sResetAnalyticsDataCallCount += 1;
}

+ (void)setSessionTimeoutInterval:(NSTimeInterval)sessionTimeoutInterval {
  [self throwIfRequested];
  sSessionTimeoutIntervalValue = sessionTimeoutInterval;
}

+ (NSString *)appInstanceID {
  [self throwIfRequested];
  return sAppInstanceIDValue;
}

+ (void)sessionIDWithCompletion:(void (^)(int64_t sessionID, NSError *_Nullable error))completion {
  [self throwIfRequested];
  if (sSessionIDCompletionDeferred) {
    sDeferredSessionIDCompletion = [completion copy];
    return;
  }
  if (completion != nil) {
    completion(sSessionIDCompletionValue, sSessionIDCompletionError);
  }
}

+ (void)setDefaultEventParameters:(NSDictionary<NSString *, id> *)parameters {
  [self throwIfRequested];
  sLastDefaultEventParameters = [parameters copy];
}

+ (void)initiateOnDeviceConversionMeasurementWithEmailAddress:(NSString *)emailAddress {
  [self throwIfRequested];
  sLastConversionEmail = [emailAddress copy];
}

+ (void)initiateOnDeviceConversionMeasurementWithHashedEmailAddress:(NSData *)hashedEmailAddress {
  [self throwIfRequested];
  sLastHashedEmail = [hashedEmailAddress copy];
}

+ (void)initiateOnDeviceConversionMeasurementWithPhoneNumber:(NSString *)phoneNumber {
  [self throwIfRequested];
  sLastConversionPhone = [phoneNumber copy];
}

+ (void)initiateOnDeviceConversionMeasurementWithHashedPhoneNumber:(NSData *)hashedPhoneNumber {
  [self throwIfRequested];
  sLastHashedPhone = [hashedPhoneNumber copy];
}

+ (void)setConsent:(NSDictionary *)consentSettings {
  [self throwIfRequested];
  sLastConsent = [consentSettings copy];
}

@end
