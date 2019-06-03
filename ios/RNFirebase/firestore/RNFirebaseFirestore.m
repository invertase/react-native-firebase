#import "RNFirebaseFirestore.h"

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)

#import <Firebase.h>
#import "RNFirebaseEvents.h"
#import "RNFirebaseFirestoreCollectionReference.h"
#import "RNFirebaseFirestoreDocumentReference.h"

@implementation RNFirebaseFirestore
RCT_EXPORT_MODULE();

static dispatch_queue_t firestoreQueue;
static NSMutableDictionary* initialisedApps;

// Run on a different thread
- (dispatch_queue_t)methodQueue {
    if (!firestoreQueue) {
        firestoreQueue = dispatch_queue_create("io.invertase.react-native-firebase.firestore", DISPATCH_QUEUE_SERIAL);
    }
    return firestoreQueue;
}

- (id)init {
    self = [super init];
    if (self != nil) {
        initialisedApps = [[NSMutableDictionary alloc] init];
        _transactions = [[NSMutableDictionary alloc] init];
    }
    return self;
}

/**
 *  TRANSACTIONS
 */
RCT_EXPORT_METHOD(transactionGetDocument:(NSString *)appDisplayName
                  transactionId:(nonnull NSNumber *)transactionId
                  path:(NSString *)path
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    @synchronized (self->_transactions[[transactionId stringValue]]) {
        __block NSMutableDictionary *transactionState = self->_transactions[[transactionId stringValue]];
        
        if (!transactionState) {
            DLog(@"transactionGetDocument called for non-existant transactionId %@", transactionId);
            return;
        }

        NSError *error = nil;
        FIRTransaction *transaction = [transactionState valueForKey:@"transaction"];
        FIRDocumentReference *ref = [self getDocumentForAppPath:appDisplayName path:path].ref;
        FIRDocumentSnapshot *snapshot = [transaction getDocument:ref error:&error];

        if (error != nil) {
            [RNFirebaseFirestore promiseRejectException:reject error:error];
        } else {
            NSDictionary *snapshotDict = [RNFirebaseFirestoreDocumentReference snapshotToDictionary:snapshot];
            NSString *path = snapshotDict[@"path"];
            
            if (path == nil) {
                [snapshotDict setValue:ref.path forKey:@"path"];
            }
            
            resolve(snapshotDict);
        }
    }
}

RCT_EXPORT_METHOD(transactionDispose:(NSString *)appDisplayName
                  transactionId:(nonnull NSNumber *)transactionId) {
    @synchronized (self->_transactions[[transactionId stringValue]]) {
        __block NSMutableDictionary *transactionState = self->_transactions[[transactionId stringValue]];

        if (!transactionState) {
            DLog(@"transactionGetDocument called for non-existant transactionId %@", transactionId);
            return;
        }

        dispatch_semaphore_t semaphore = [transactionState valueForKey:@"semaphore"];
        [transactionState setValue:@true forKey:@"abort"];
        dispatch_semaphore_signal(semaphore);
    }
}

RCT_EXPORT_METHOD(transactionApplyBuffer:(NSString *)appDisplayName
                  transactionId:(nonnull NSNumber *)transactionId
                  commandBuffer:(NSArray *)commandBuffer) {
    @synchronized (self->_transactions[[transactionId stringValue]]) {
        __block NSMutableDictionary *transactionState = self->_transactions[[transactionId stringValue]];

        if (!transactionState) {
            DLog(@"transactionGetDocument called for non-existant transactionId %@", transactionId);
            return;
        }

        dispatch_semaphore_t semaphore = [transactionState valueForKey:@"semaphore"];
        [transactionState setValue:commandBuffer forKey:@"commandBuffer"];
        dispatch_semaphore_signal(semaphore);
    }
}

RCT_EXPORT_METHOD(transactionBegin:(NSString *)appDisplayName
                  transactionId:(nonnull NSNumber *)transactionId) {
    FIRFirestore *firestore = [RNFirebaseFirestore getFirestoreForApp:appDisplayName];
    __block BOOL aborted = false;
    __block BOOL completed = false;
    __block NSMutableDictionary *transactionState = [NSMutableDictionary new];

    [firestore runTransactionWithBlock:^id (FIRTransaction *transaction, NSError * *errorPointer) {
        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        
        @synchronized (transactionState) {
            transactionState[@"semaphore"] = semaphore;
            transactionState[@"transaction"] = transaction;

            if (!self->_transactions[[transactionId stringValue]]) {
                [self->_transactions setValue:transactionState forKey:[transactionId stringValue]];
            }
            
            // Build and send transaction update event
            dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                NSMutableDictionary *eventMap = [NSMutableDictionary new];
                eventMap[@"type"] = @"update";
                eventMap[@"id"] = transactionId;
                eventMap[@"appName"] = appDisplayName;
                [RNFirebaseUtil sendJSEvent:self name:FIRESTORE_TRANSACTION_EVENT body:eventMap];
            });
        }

        // wait for the js event handler to call transactionApplyBuffer
        // this wait occurs on the RNFirestore Worker Queue so if transactionApplyBuffer fails to
        // signal the semaphore then no further blocks will be executed by RNFirestore until the timeout expires
        dispatch_time_t delayTime = dispatch_time(DISPATCH_TIME_NOW, 5000 * NSEC_PER_SEC);
        BOOL timedOut = dispatch_semaphore_wait(semaphore, delayTime) != 0;
        
        @synchronized (transactionState) {
            aborted = [transactionState valueForKey:@"abort"];
            
            if (transactionState[@"semaphore"] != semaphore) {
                return nil;
            }

            if (aborted == YES) {
                *errorPointer = [NSError errorWithDomain:FIRFirestoreErrorDomain code:FIRFirestoreErrorCodeAborted userInfo:@{}];
                return nil;
            }

            if (timedOut == YES) {
                *errorPointer = [NSError errorWithDomain:FIRFirestoreErrorDomain code:FIRFirestoreErrorCodeDeadlineExceeded userInfo:@{}];
                return nil;
            }
            
            if (completed == YES) {
                return nil;
            }

            NSArray *commandBuffer = [transactionState valueForKey:@"commandBuffer"];
            
            for (NSDictionary *command in commandBuffer) {
                NSString *type = command[@"type"];
                NSString *path = command[@"path"];
                NSDictionary *data = [RNFirebaseFirestoreDocumentReference parseJSMap:firestore jsMap:command[@"data"]];

                FIRDocumentReference *ref = [firestore documentWithPath:path];

                if ([type isEqualToString:@"delete"]) {
                    [transaction deleteDocument:ref];
                } else if ([type isEqualToString:@"set"]) {
                    NSDictionary *options = command[@"options"];
                    if (options && options[@"merge"]) {
                        [transaction setData:data forDocument:ref merge:true];
                    } else {
                        [transaction setData:data forDocument:ref];
                    }
                } else if ([type isEqualToString:@"update"]) {
                    [transaction updateData:data forDocument:ref];
                }
            }

            return nil;
        }
    } completion:^(id result, NSError *error) {
        if (completed == YES) return;
        completed = YES;
        
        @synchronized (transactionState) {
            if (aborted == NO) {
                NSMutableDictionary *eventMap = [NSMutableDictionary new];
                eventMap[@"id"] = transactionId;
                eventMap[@"appName"] = appDisplayName;

                if (error != nil) {
                    eventMap[@"type"] = @"error";
                    eventMap[@"error"] = [RNFirebaseFirestore getJSError:error];
                } else {
                    eventMap[@"type"] = @"complete";
                }
                
                [RNFirebaseUtil sendJSEvent:self name:FIRESTORE_TRANSACTION_EVENT body:eventMap];
            }
            
            [self->_transactions removeObjectForKey:[transactionId stringValue]];
        }
        
    }];
}

/**
 *  TRANSACTIONS END
 */

RCT_EXPORT_METHOD(disableNetwork:(NSString *)appDisplayName
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    FIRFirestore *firestore = [RNFirebaseFirestore getFirestoreForApp:appDisplayName];
    [firestore disableNetworkWithCompletion:^(NSError * _Nullable error) {
        if (error) {
            [RNFirebaseFirestore promiseRejectException:reject error:error];
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(setLogLevel:(NSString *)logLevel) {
    if ([@"debug" isEqualToString:logLevel] || [@"error" isEqualToString:logLevel]) {
        [FIRFirestore enableLogging:true];
    } else {
        [FIRFirestore enableLogging:false];
    }
}

RCT_EXPORT_METHOD(enableNetwork:(NSString *)appDisplayName
                  resolver:(RCTPromiseResolveBlock) resolve
                  rejecter:(RCTPromiseRejectBlock) reject) {
    FIRFirestore *firestore = [RNFirebaseFirestore getFirestoreForApp:appDisplayName];
    [firestore enableNetworkWithCompletion:^(NSError * _Nullable error) {
        if (error) {
            [RNFirebaseFirestore promiseRejectException:reject error:error];
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(collectionGet:(NSString *)appDisplayName
                  path:(NSString *)path
                  filters:(NSArray *)filters
                  orders:(NSArray *)orders
                  options:(NSDictionary *)options
                  getOptions:(NSDictionary *)getOptions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getCollectionForAppPath:appDisplayName path:path filters:filters orders:orders options:options] get:getOptions resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(collectionOffSnapshot:(NSString *)appDisplayName
                  path:(NSString *)path
                  filters:(NSArray *)filters
                  orders:(NSArray *)orders
                  options:(NSDictionary *)options
                  listenerId:(nonnull NSString *)listenerId) {
    [RNFirebaseFirestoreCollectionReference offSnapshot:listenerId];
}

RCT_EXPORT_METHOD(collectionOnSnapshot:(NSString *)appDisplayName
                  path:(NSString *)path
                  filters:(NSArray *)filters
                  orders:(NSArray *)orders
                  options:(NSDictionary *)options
                  listenerId:(nonnull NSString *)listenerId
                  queryListenOptions:(NSDictionary *)queryListenOptions) {
    RNFirebaseFirestoreCollectionReference *ref = [self getCollectionForAppPath:appDisplayName path:path filters:filters orders:orders options:options];
    [ref onSnapshot:listenerId queryListenOptions:queryListenOptions];
}

RCT_EXPORT_METHOD(documentBatch:(NSString *)appDisplayName
                  writes:(NSArray *)writes
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    FIRFirestore *firestore = [RNFirebaseFirestore getFirestoreForApp:appDisplayName];
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
                batch = [batch setData:data forDocument:ref merge:true];
            } else {
                batch = [batch setData:data forDocument:ref];
            }
        } else if ([type isEqualToString:@"UPDATE"]) {
            batch = [batch updateData:data forDocument:ref];
        }
    }

    [batch commitWithCompletion:^(NSError *_Nullable error) {
        if (error) {
            [RNFirebaseFirestore promiseRejectException:reject error:error];
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(documentDelete:(NSString *)appDisplayName
                  path:(NSString *)path
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getDocumentForAppPath:appDisplayName path:path] delete:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(documentGet:(NSString *)appDisplayName
                  path:(NSString *)path
                  getOptions:(NSDictionary *)getOptions
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getDocumentForAppPath:appDisplayName path:path] get:getOptions resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(documentOffSnapshot:(NSString *)appDisplayName
                  path:(NSString *)path
                  listenerId:(nonnull NSString *)listenerId) {
    [RNFirebaseFirestoreDocumentReference offSnapshot:listenerId];
}

RCT_EXPORT_METHOD(documentOnSnapshot:(NSString *)appDisplayName
                  path:(NSString *)path
                  listenerId:(nonnull NSString *)listenerId
                  docListenOptions:(NSDictionary *)docListenOptions) {
    RNFirebaseFirestoreDocumentReference *ref = [self getDocumentForAppPath:appDisplayName path:path];
    [ref onSnapshot:listenerId docListenOptions:docListenOptions];
}

RCT_EXPORT_METHOD(documentSet:(NSString *)appDisplayName
                  path:(NSString *)path
                  data:(NSDictionary *)data
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getDocumentForAppPath:appDisplayName path:path] set:data options:options resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(documentUpdate:(NSString *)appDisplayName
                  path:(NSString *)path
                  data:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [[self getDocumentForAppPath:appDisplayName path:path] update:data resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(settings:(NSString *)appDisplayName
                  settings:(NSDictionary *)settings
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    FIRFirestore *firestore = [RNFirebaseFirestore getFirestoreForApp:appDisplayName];
    FIRFirestoreSettings *firestoreSettings = [[FIRFirestoreSettings alloc] init];

    // Make sure the dispatch queue is set correctly
    firestoreSettings.dispatchQueue = firestoreQueue;

    // Apply the settings passed by the user, or ensure that the current settings are preserved
    if (settings[@"host"]) {
        firestoreSettings.host = settings[@"host"];
    } else {
        firestoreSettings.host = firestore.settings.host;
    }
    if (settings[@"persistence"]) {
        firestoreSettings.persistenceEnabled = settings[@"persistence"];
    } else {
        firestoreSettings.persistenceEnabled = firestore.settings.persistenceEnabled;
    }
    if (settings[@"cacheSizeBytes"]) {
        firestoreSettings.cacheSizeBytes = settings[@"cacheSizeBytes"];
    } else {
        firestoreSettings.cacheSizeBytes = firestore.settings.cacheSizeBytes;
    }
    if (settings[@"ssl"]) {
        firestoreSettings.sslEnabled = settings[@"ssl"];
    } else {
        firestoreSettings.sslEnabled = firestore.settings.sslEnabled;
    }
    if (settings[@"timestampsInSnapshots"]) {
        firestoreSettings.timestampsInSnapshotsEnabled = settings[@"timestampsInSnapshots"];
    }

    [firestore setSettings:firestoreSettings];
    resolve(nil);
}

/*
 * INTERNALS/UTILS
 */
+ (void)promiseRejectException:(RCTPromiseRejectBlock)reject error:(NSError *)error {
    NSDictionary *jsError = [RNFirebaseFirestore getJSError:error];
    reject([jsError valueForKey:@"code"], [jsError valueForKey:@"message"], error);
}

+ (FIRFirestore *)getFirestoreForApp:(NSString *)appDisplayName {
    FIRApp *app = [RNFirebaseUtil getApp:appDisplayName];
    FIRFirestore *firestore = [FIRFirestore firestoreForApp:app];

    // This is the first time we've tried to do something on this Firestore instance
    // So we need to make sure the dispatch queue is set correctly
    if (!initialisedApps[appDisplayName]) {
        initialisedApps[appDisplayName] = @(true);
        FIRFirestoreSettings *firestoreSettings = [[FIRFirestoreSettings alloc] init];
        firestoreSettings.dispatchQueue = firestoreQueue;
        [firestore setSettings:firestoreSettings];
    }
    return firestore;
}

- (RNFirebaseFirestoreCollectionReference *)getCollectionForAppPath:(NSString *)appDisplayName path:(NSString *)path filters:(NSArray *)filters orders:(NSArray *)orders options:(NSDictionary *)options {
    return [[RNFirebaseFirestoreCollectionReference alloc] initWithPathAndModifiers:self appDisplayName:appDisplayName path:path filters:filters orders:orders options:options];
}

- (RNFirebaseFirestoreDocumentReference *)getDocumentForAppPath:(NSString *)appDisplayName path:(NSString *)path {
    return [[RNFirebaseFirestoreDocumentReference alloc] initWithPath:self appDisplayName:appDisplayName path:path];
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
    return @[FIRESTORE_COLLECTION_SYNC_EVENT, FIRESTORE_DOCUMENT_SYNC_EVENT, FIRESTORE_TRANSACTION_EVENT];
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end

#else
@implementation RNFirebaseFirestore
@end
#endif
