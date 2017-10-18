#import "RNFirebaseFirestore.h"

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)

#import <Firebase.h>
#import "RNFirebaseEvents.h"
#import "RNFirebaseFirestoreCollectionReference.h"
#import "RNFirebaseFirestoreDocumentReference.h"

@implementation RNFirebaseFirestore
RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {

    }
    return self;
}

RCT_EXPORT_METHOD(collectionGet:(NSString *) appName
                           path:(NSString *) path
                        filters:(NSArray *) filters
                         orders:(NSArray *) orders
                        options:(NSDictionary *) options
                       resolver:(RCTPromiseResolveBlock) resolve
                       rejecter:(RCTPromiseRejectBlock) reject) {
    [[self getCollectionForAppPath:appName path:path filters:filters orders:orders options:options] get:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(collectionOffSnapshot:(NSString *) appName
                                   path:(NSString *) path
                                filters:(NSArray *) filters
                                 orders:(NSArray *) orders
                                options:(NSDictionary *) options
                             listenerId:(nonnull NSString *) listenerId) {
    [RNFirebaseFirestoreCollectionReference offSnapshot:listenerId];
}

RCT_EXPORT_METHOD(collectionOnSnapshot:(NSString *) appName
                                  path:(NSString *) path
                               filters:(NSArray *) filters
                                orders:(NSArray *) orders
                               options:(NSDictionary *) options
                            listenerId:(nonnull NSString *) listenerId
                    queryListenOptions:(NSDictionary *) queryListenOptions) {
    RNFirebaseFirestoreCollectionReference *ref = [self getCollectionForAppPath:appName path:path filters:filters orders:orders options:options];
    [ref onSnapshot:listenerId queryListenOptions:queryListenOptions];
}

RCT_EXPORT_METHOD(documentBatch:(NSString *) appName
                         writes:(NSArray *) writes
                       resolver:(RCTPromiseResolveBlock) resolve
                       rejecter:(RCTPromiseRejectBlock) reject) {
    FIRFirestore *firestore = [RNFirebaseFirestore getFirestoreForApp:appName];
    FIRWriteBatch *batch = [firestore batch];

    for (NSDictionary *write in writes) {
        NSString *type = write[@"type"];
        NSString *path = write[@"path"];
        NSDictionary *data = [RNFirebaseFirestoreDocumentReference parseJSMap:firestore jsMap:write[@"data"]];

        FIRDocumentReference *ref = [firestore documentWithPath:path];

        if ([type isEqualToString:@"DELETE"]) {
            batch = [batch deleteDocument:ref];
        } else if ([type isEqualToString:@"SET"]) {
            NSDictionary *options = write[@"options"];
            if (options && options[@"merge"]) {
                batch = [batch setData:data forDocument:ref options:[FIRSetOptions merge]];
            } else {
                batch = [batch setData:data forDocument:ref];
            }
        } else if ([type isEqualToString:@"UPDATE"]) {
            batch = [batch updateData:data forDocument:ref];
        }
    }

    [batch commitWithCompletion:^(NSError * _Nullable error) {
        if (error) {
            [RNFirebaseFirestore promiseRejectException:reject error:error];
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(documentDelete:(NSString *) appName
                            path:(NSString *) path
                        resolver:(RCTPromiseResolveBlock) resolve
                        rejecter:(RCTPromiseRejectBlock) reject) {
    [[self getDocumentForAppPath:appName path:path] delete:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(documentGet:(NSString *) appName
                         path:(NSString *) path
                     resolver:(RCTPromiseResolveBlock) resolve
                     rejecter:(RCTPromiseRejectBlock) reject) {
    [[self getDocumentForAppPath:appName path:path] get:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(documentGetAll:(NSString *) appName
                       documents:(NSString *) documents
                        resolver:(RCTPromiseResolveBlock) resolve
                        rejecter:(RCTPromiseRejectBlock) reject) {
    // Not supported on iOS out of the box
}

RCT_EXPORT_METHOD(documentOffSnapshot:(NSString *) appName
                                 path:(NSString *) path
                           listenerId:(nonnull NSString *) listenerId) {
    [RNFirebaseFirestoreDocumentReference offSnapshot:listenerId];
}

RCT_EXPORT_METHOD(documentOnSnapshot:(NSString *) appName
                                path:(NSString *) path
                          listenerId:(nonnull NSString *) listenerId
                    docListenOptions:(NSDictionary *) docListenOptions) {
    RNFirebaseFirestoreDocumentReference *ref = [self getDocumentForAppPath:appName path:path];
    [ref onSnapshot:listenerId docListenOptions:docListenOptions];
}

RCT_EXPORT_METHOD(documentSet:(NSString *) appName
                         path:(NSString *) path
                         data:(NSDictionary *) data
                      options:(NSDictionary *) options
                     resolver:(RCTPromiseResolveBlock) resolve
                     rejecter:(RCTPromiseRejectBlock) reject) {
    [[self getDocumentForAppPath:appName path:path] set:data options:options resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(documentUpdate:(NSString *) appName
                            path:(NSString *) path
                            data:(NSDictionary *) data
                        resolver:(RCTPromiseResolveBlock) resolve
                        rejecter:(RCTPromiseRejectBlock) reject) {
    [[self getDocumentForAppPath:appName path:path] update:data resolver:resolve rejecter:reject];
}

/*
 * INTERNALS/UTILS
 */
+ (void)promiseRejectException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
    NSDictionary *jsError = [RNFirebaseFirestore getJSError:error];
    reject([jsError valueForKey:@"code"], [jsError valueForKey:@"message"], error);
}

+ (FIRFirestore *)getFirestoreForApp:(NSString *)appName {
    FIRApp *app = [FIRApp appNamed:appName];
    return [FIRFirestore firestoreForApp:app];
}

- (RNFirebaseFirestoreCollectionReference *)getCollectionForAppPath:(NSString *)appName path:(NSString *)path filters:(NSArray *)filters orders:(NSArray *)orders options:(NSDictionary *)options {
    return [[RNFirebaseFirestoreCollectionReference alloc] initWithPathAndModifiers:self app:appName path:path filters:filters orders:orders options:options];
}

- (RNFirebaseFirestoreDocumentReference *)getDocumentForAppPath:(NSString *)appName path:(NSString *)path {
    return [[RNFirebaseFirestoreDocumentReference alloc] initWithPath:self app:appName path:path];
}

// TODO: Move to error util for use in other modules
+ (NSString *)getMessageWithService:(NSString *)message service:(NSString *)service fullCode:(NSString *)fullCode {
    return [NSString stringWithFormat:@"%@: %@ (%@).", service, message, [fullCode lowercaseString]];
}

+ (NSString *)getCodeWithService:(NSString *)service code:(NSString *)code {
    return [NSString stringWithFormat:@"%@/%@", [service lowercaseString], [code lowercaseString]];
}

+ (NSDictionary *)getJSError:(NSError *)nativeError {
    NSMutableDictionary *errorMap = [[NSMutableDictionary alloc] init];
    [errorMap setValue:@(nativeError.code) forKey:@"nativeErrorCode"];
    [errorMap setValue:[nativeError localizedDescription] forKey:@"nativeErrorMessage"];

    NSString *code;
    NSString *message;
    NSString *service = @"Firestore";

    switch (nativeError.code) {
        case FIRFirestoreErrorCodeOK:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"ok"];
            message = [RNFirebaseFirestore getMessageWithService:@"Ok." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeCancelled:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"cancelled"];
            message = [RNFirebaseFirestore getMessageWithService:@"The operation was cancelled." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeUnknown:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"unknown"];
            message = [RNFirebaseFirestore getMessageWithService:@"Unknown error or an error from a different error domain." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeInvalidArgument:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"invalid-argument"];
            message = [RNFirebaseFirestore getMessageWithService:@"Client specified an invalid argument." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeDeadlineExceeded:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"deadline-exceeded"];
            message = [RNFirebaseFirestore getMessageWithService:@"Deadline expired before operation could complete." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeNotFound:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"not-found"];
            message = [RNFirebaseFirestore getMessageWithService:@"Some requested document was not found." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeAlreadyExists:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"already-exists"];
            message = [RNFirebaseFirestore getMessageWithService:@"Some document that we attempted to create already exists." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodePermissionDenied:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"permission-denied"];
            message = [RNFirebaseFirestore getMessageWithService:@"The caller does not have permission to execute the specified operation." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeResourceExhausted:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"resource-exhausted"];
            message = [RNFirebaseFirestore getMessageWithService:@"Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeFailedPrecondition:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"failed-precondition"];
            message = [RNFirebaseFirestore getMessageWithService:@"Operation was rejected because the system is not in a state required for the operation`s execution." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeAborted:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"aborted"];
            message = [RNFirebaseFirestore getMessageWithService:@"The operation was aborted, typically due to a concurrency issue like transaction aborts, etc." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeOutOfRange:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"out-of-range"];
            message = [RNFirebaseFirestore getMessageWithService:@"Operation was attempted past the valid range." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeUnimplemented:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"unimplemented"];
            message = [RNFirebaseFirestore getMessageWithService:@"Operation is not implemented or not supported/enabled." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeInternal:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"internal"];
            message = [RNFirebaseFirestore getMessageWithService:@"Internal errors." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeUnavailable:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"unavailable"];
            message = [RNFirebaseFirestore getMessageWithService:@"The service is currently unavailable." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeDataLoss:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"data-loss"];
            message = [RNFirebaseFirestore getMessageWithService:@"Unrecoverable data loss or corruption." service:service fullCode:code];
            break;
        case FIRFirestoreErrorCodeUnauthenticated:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"unauthenticated"];
            message = [RNFirebaseFirestore getMessageWithService:@"The request does not have valid authentication credentials for the operation." service:service fullCode:code];
            break;
        default:
            code = [RNFirebaseFirestore getCodeWithService:service code:@"unknown"];
            message = [RNFirebaseFirestore getMessageWithService:@"An unknown error occurred." service:service fullCode:code];
            break;
    }

    [errorMap setValue:code forKey:@"code"];
    [errorMap setValue:message forKey:@"message"];

    return errorMap;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[FIRESTORE_COLLECTION_SYNC_EVENT, FIRESTORE_DOCUMENT_SYNC_EVENT];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation RNFirebaseFirestore
@end
#endif
