#import "RNFirebaseCrash.h"
#import "Firebase.h"

@implementation RNFirebaseCrash

RCT_EXPORT_MODULE(RNFirebaseCrash);

RCT_EXPORT_METHOD(log:(NSString *)message)
{
  FIRCrashLog(message);
}

RCT_EXPORT_METHOD(logcat:(nonnull NSNumber *) level
                     tag:(NSString *) tag
                 message:(NSString *) message)
{
  FIRCrashLog(message);
}

RCT_EXPORT_METHOD(report:(NSString *) message)
{
  FIRCrashLog(message);
  assert(NO);
}

@end
