#import "RNFirebaseCrash.h"

#if __has_include(<FirebaseCrash/FIRCrashLog.h>)
#import <FirebaseCrash/FIRCrashLog.h>

@implementation RNFirebaseCrash
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(log:(NSString *)message) {
  FIRCrashLog(@"%@", message);
}

RCT_EXPORT_METHOD(logcat:(nonnull NSNumber *) level tag:(NSString *) tag message:(NSString *) message) {
  FIRCrashLog(@"%@", message);
}

RCT_EXPORT_METHOD(report:(NSString *) message) {
  FIRCrashLog(@"%@", message);
}

RCT_EXPORT_METHOD(setCrashCollectionEnabled:(BOOL *) enabled) {
    // Not available yet
}

RCT_EXPORT_METHOD(isCrashCollectionEnabled:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    // Not available yet
  resolve(@YES);
}

@end

#else
@implementation RNFirebaseCrash
@end
#endif
