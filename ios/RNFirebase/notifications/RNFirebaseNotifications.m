#import "RNFirebaseNotifications.h"

#if __has_include(<FirebaseMessaging/FIRMessaging.h>)

@implementation RNFirebaseNotifications
RCT_EXPORT_MODULE();

@end

#else
@implementation RNFirebaseNotifications
@end
#endif

