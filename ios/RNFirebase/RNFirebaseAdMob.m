#import "RNFirebaseAdMob.h"

@implementation RNFirebaseAdMob
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(log:(NSString *)message) {
  FIRCrashLog(message);
}

RCT_EXPORT_METHOD(nativeSDKMissing) {}
@end

