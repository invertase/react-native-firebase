#import "RNFirebaseCrashlytics.h"

#if __has_include(<Crashlytics/Crashlytics.h>)
#import <Crashlytics/Crashlytics.h>

@implementation RNFirebaseCrashlytics
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(crash) {
    [[Crashlytics sharedInstance] crash];
}

RCT_EXPORT_METHOD(log:(NSString *)message) {
    CLS_LOG(@"%@", message);
}

RCT_EXPORT_METHOD(recordError:(nonnull NSNumber *)code domain:(NSString *)domain) {
    NSError *error = [NSError errorWithDomain:domain code:[code integerValue] userInfo:nil];
    [CrashlyticsKit recordError:error];
}

RCT_EXPORT_METHOD(setBoolValue:(NSString *)key boolValue:(BOOL *)boolValue) {
    [CrashlyticsKit setBoolValue:boolValue forKey:key];
}

RCT_EXPORT_METHOD(setFloatValue:(NSString *)key floatValue:(nonnull NSNumber *)floatValue) {
    [CrashlyticsKit setFloatValue:[floatValue floatValue] forKey:key];
}

RCT_EXPORT_METHOD(setIntValue:(NSString *)key intValue:(nonnull NSNumber *)intValue) {
    [CrashlyticsKit setIntValue:[intValue integerValue] forKey:key];
}

RCT_EXPORT_METHOD(setStringValue:(NSString *)key stringValue:(NSString *)stringValue) {
    [CrashlyticsKit setObjectValue:stringValue forKey:key];
}

RCT_EXPORT_METHOD(setUserIdentifier:(NSString *)userId) {
    [CrashlyticsKit setUserIdentifier:userId];
}

@end

#else
@implementation RNFirebaseCrashlytics
@end
#endif
