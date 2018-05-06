#import "RNFirebaseFunctions.h"

#if __has_include(<FirebaseFunctions/FIRFunctions.h>)
#import <FirebaseFunctions/FIRFunctions.h>

@implementation RNFirebaseFunctions
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(httpsCallable:
                  (NSString *)name
                  wrapper:
                  (NSDictionary *)wrapper
                  resolver:
                  (RCTPromiseResolveBlock) resolve
                  rejecter:
                  (RCTPromiseRejectBlock) reject
                  ) {
    // TODO
}


@end

#else
@implementation RNFirebaseFunctions
@end
#endif

