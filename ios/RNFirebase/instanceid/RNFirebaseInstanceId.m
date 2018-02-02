#import "RNFirebaseInstanceId.h"

#if __has_include(<FirebaseInstanceID/FIRInstanceID.h>)
#import <FirebaseInstanceID/FIRInstanceID.h>

@implementation RNFirebaseInstanceId
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(delete:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [[FIRInstanceID instanceID] deleteIDWithHandler:^(NSError * _Nullable error) {
        if (error) {
            reject(@"instance_id_error", @"Failed to delete instance id", error);
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(get:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [[FIRInstanceID instanceID] getIDWithHandler:^(NSString * _Nullable identity, NSError * _Nullable error) {
        if (error) {
            reject(@"instance_id_error", @"Failed to get instance id", error);
        } else {
            resolve(identity);
        }
    }];
}

@end

#else
@implementation RNFirebaseInstanceId
@end
#endif

