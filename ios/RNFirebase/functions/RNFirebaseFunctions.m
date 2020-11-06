#import "RNFirebaseFunctions.h"
#import "RNFirebaseUtil.h"

#if __has_include(<FirebaseFunctions/FIRFunctions.h>)
#import <FirebaseFunctions/FIRFunctions.h>
#import <FirebaseFunctions/FIRHTTPSCallable.h>
#import <FirebaseFunctions/FIRError.h>

@implementation RNFirebaseFunctions
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(httpsCallable:
                  (NSString *) appName
                  region:
                  (NSString *) region
                  name:
                  (NSString *) name
                  wrapper:
                  (NSDictionary *) wrapper
                  resolver:
                  (RCTPromiseResolveBlock) resolve
                  rejecter:
                  (RCTPromiseRejectBlock) reject
                 ){
    FIRApp *firebaseApp = [RNFirebaseUtil getApp:appName];
    FIRFunctions *functions = [FIRFunctions functionsForApp:firebaseApp region:region];
    
    FIRHTTPSCallable *callable = [functions HTTPSCallableWithName:name];
    
    [callable
     callWithObject:[wrapper valueForKey:@"data"]
     completion:^(FIRHTTPSCallableResult * _Nullable result, NSError * _Nullable error) {
        if (error) {
            NSObject *details = [NSNull null];
            NSString *message = error.localizedDescription;
            
            if (error.domain == FIRFunctionsErrorDomain) {
                details = error.userInfo[FIRFunctionsErrorDetailsKey];
                if (details == nil) {
                    details = [NSNull null];
                }
            }
        
            resolve(@{
                @"__error": @true,
                @"code": [self getErrorCodeName:error],
                @"message": message,
                @"details": details
            });
        } else {
            resolve(@{ @"data": [result data] });
        }
    }];
}

RCT_EXPORT_METHOD(useFunctionsEmulator:
                  (NSString *) appName
                  region:
                  (NSString *) region
                  origin:
                  (NSString *) origin
                  resolver:
                  (RCTPromiseResolveBlock) resolve
                  rejecter:
                  (RCTPromiseRejectBlock) reject
                 ){
    FIRApp *firebaseApp = [RNFirebaseUtil getApp:appName];
    FIRFunctions *functions = [FIRFunctions functionsForApp:firebaseApp region:region];
    [functions useFunctionsEmulatorOrigin:origin];
    resolve([NSNull null]);
}

- (NSString *)getErrorCodeName:(NSError *)error {
    NSString *code = @"UNKNOWN";
    switch (error.code) {
        case FIRFunctionsErrorCodeOK:
            code = @"OK";
            break;
        case FIRFunctionsErrorCodeCancelled:
            code = @"CANCELLED";
            break;
        case FIRFunctionsErrorCodeUnknown:
            code = @"UNKNOWN";
            break;
        case FIRFunctionsErrorCodeInvalidArgument:
            code = @"INVALID_ARGUMENT";
            break;
        case FIRFunctionsErrorCodeDeadlineExceeded:
            code = @"DEADLINE_EXCEEDED";
            break;
        case FIRFunctionsErrorCodeNotFound:
            code = @"NOT_FOUND";
            break;
        case FIRFunctionsErrorCodeAlreadyExists:
            code = @"ALREADY_EXISTS";
            break;
        case FIRFunctionsErrorCodePermissionDenied:
            code = @"PERMISSION_DENIED";
            break;
        case FIRFunctionsErrorCodeResourceExhausted:
            code = @"RESOURCE_EXHAUSTED";
            break;
        case FIRFunctionsErrorCodeFailedPrecondition:
            code = @"FAILED_PRECONDITION";
            break;
        case FIRFunctionsErrorCodeAborted:
            code = @"ABORTED";
            break;
        case FIRFunctionsErrorCodeOutOfRange:
            code = @"OUT_OF_RANGE";
            break;
        case FIRFunctionsErrorCodeUnimplemented:
            code = @"UNIMPLEMENTED";
            break;
        case FIRFunctionsErrorCodeInternal:
            code = @"INTERNAL";
            break;
        case FIRFunctionsErrorCodeUnavailable:
            code = @"UNAVAILABLE";
            break;
        case FIRFunctionsErrorCodeDataLoss:
            code = @"DATA_LOSS";
            break;
        case FIRFunctionsErrorCodeUnauthenticated:
            code = @"UNAUTHENTICATED";
            break;
        default:
            break;
    }
    
    return code;
}


@end

#else
@implementation RNFirebaseFunctions
@end
#endif

