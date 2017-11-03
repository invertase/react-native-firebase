#import "RNFirebaseDatabase.h"

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)

#import <Firebase.h>
#import "RNFirebaseDatabaseReference.h"
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"

@implementation RNFirebaseDatabase
RCT_EXPORT_MODULE();

// TODO document methods

- (id)init {
    self = [super init];
    if (self != nil) {
        _dbReferences = [[NSMutableDictionary alloc] init];
        _transactions = [[NSMutableDictionary alloc] init];
        _transactionQueue = dispatch_queue_create("io.invertase.react-native-firebase", DISPATCH_QUEUE_CONCURRENT);
    }
    return self;
}

RCT_EXPORT_METHOD(goOnline:(NSString *) appName) {
    [[RNFirebaseDatabase getDatabaseForApp:appName] goOnline];
}

RCT_EXPORT_METHOD(goOffline:(NSString *) appName) {
    [[RNFirebaseDatabase getDatabaseForApp:appName] goOffline];
}

RCT_EXPORT_METHOD(setPersistence:(NSString *) appName
                           state:(BOOL) state) {
    [RNFirebaseDatabase getDatabaseForApp:appName].persistenceEnabled = state;
}

RCT_EXPORT_METHOD(keepSynced:(NSString *) appName
                         key:(NSString *) key
                        path:(NSString *) path
                   modifiers:(NSArray *) modifiers
                       state:(BOOL) state) {
    FIRDatabaseQuery *query = [self getInternalReferenceForApp:appName key:key path:path modifiers:modifiers].query;
    [query keepSynced:state];
}

RCT_EXPORT_METHOD(transactionTryCommit:(NSString *) appName
                         transactionId:(nonnull NSNumber *) transactionId
                               updates:(NSDictionary *) updates) {
    __block NSMutableDictionary *transactionState;

    dispatch_sync(_transactionQueue, ^{
        transactionState = _transactions[transactionId];
    });

    if (!transactionState) {
        NSLog(@"tryCommitTransaction for unknown ID %@", transactionId);
        return;
    }

    dispatch_semaphore_t sema = [transactionState valueForKey:@"semaphore"];

    BOOL abort = [[updates valueForKey:@"abort"] boolValue];

    if (abort) {
        [transactionState setValue:@true forKey:@"abort"];
    } else {
        id newValue = [updates valueForKey:@"value"];
        [transactionState setValue:newValue forKey:@"value"];
    }

    dispatch_semaphore_signal(sema);
}


RCT_EXPORT_METHOD(transactionStart:(NSString *) appName
                              path:(NSString *) path
                     transactionId:(nonnull NSNumber *) transactionId
                      applyLocally:(BOOL) applyLocally) {
    dispatch_async(_transactionQueue, ^{
        NSMutableDictionary *transactionState = [NSMutableDictionary new];
        dispatch_semaphore_t sema = dispatch_semaphore_create(0);
        transactionState[@"semaphore"] = sema;
        FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];

        [ref runTransactionBlock:^FIRTransactionResult * _Nonnull(FIRMutableData *
        _Nonnull currentData) {
        dispatch_barrier_async(_transactionQueue, ^{
            [_transactions setValue:transactionState forKey:transactionId];
            NSDictionary *updateMap = [self createTransactionUpdateMap:appName transactionId:transactionId updatesData:currentData];
            [RNFirebaseUtil sendJSEvent:self name:DATABASE_TRANSACTION_EVENT body:updateMap];
        });

        // wait for the js event handler to call tryCommitTransaction
        // this wait occurs on the Firebase Worker Queue
        // so if the tryCommitTransaction fails to signal the semaphore
        // no further blocks will be executed by Firebase until the timeout expires
        dispatch_time_t delayTime = dispatch_time(DISPATCH_TIME_NOW, 30 * NSEC_PER_SEC);
        BOOL timedout = dispatch_semaphore_wait(sema, delayTime) != 0;

        BOOL abort = [transactionState valueForKey:@"abort"] || timedout;
        id value = [transactionState valueForKey:@"value"];

        dispatch_barrier_async(_transactionQueue, ^{
            [_transactions removeObjectForKey:transactionId];
        });

        if (abort) {
            return [FIRTransactionResult abort];
        } else {
            currentData.value = value;
            return [FIRTransactionResult successWithValue:currentData];
        }
    }
        andCompletionBlock:
        ^(NSError *_Nullable databaseError, BOOL committed, FIRDataSnapshot *_Nullable snapshot) {
            NSDictionary *resultMap = [self createTransactionResultMap:appName transactionId:transactionId error:databaseError committed:committed snapshot:snapshot];
            [RNFirebaseUtil sendJSEvent:self name:DATABASE_TRANSACTION_EVENT body:resultMap];
        }
        withLocalEvents:
        applyLocally];
    });
}

RCT_EXPORT_METHOD(onDisconnectSet:(NSString *) appName
                             path:(NSString *) path
                            props:(NSDictionary *) props
                         resolver:(RCTPromiseResolveBlock) resolve
                         rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref onDisconnectSetValue:props[@"value"] withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(onDisconnectUpdate:(NSString *) appName
                                path:(NSString *) path
                               props:(NSDictionary *) props
                            resolver:(RCTPromiseResolveBlock) resolve
                            rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref onDisconnectUpdateChildValues:props withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(onDisconnectRemove:(NSString *) appName
                                path:(NSString *) path
                            resolver:(RCTPromiseResolveBlock) resolve
                            rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref onDisconnectRemoveValueWithCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(onDisconnectCancel:(NSString *) appName
                                path:(NSString *) path
                            resolver:(RCTPromiseResolveBlock) resolve
                            rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref cancelDisconnectOperationsWithCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(set:(NSString *) appName
                 path:(NSString *) path
                props:(NSDictionary *) props
             resolver:(RCTPromiseResolveBlock) resolve
             rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref setValue:[props valueForKey:@"value"] withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(setPriority:(NSString *) appName
                         path:(NSString *) path
                     priority:(NSDictionary *) priority
                     resolver:(RCTPromiseResolveBlock) resolve
                     rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref setPriority:[priority valueForKey:@"value"] withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(setWithPriority:(NSString *) appName
                             path:(NSString *) path
                             data:(NSDictionary *) data
                         priority:(NSDictionary *) priority
                         resolver:(RCTPromiseResolveBlock) resolve
                         rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref setValue:[data valueForKey:@"value"] andPriority:[priority valueForKey:@"value"] withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(update:(NSString *) appName
                    path:(NSString *) path
                   props:(NSDictionary *) props
                resolver:(RCTPromiseResolveBlock) resolve
                rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref updateChildValues:props withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(remove:(NSString *) appName
                    path:(NSString *) path
                resolver:(RCTPromiseResolveBlock) resolve
                rejecter:(RCTPromiseRejectBlock) reject) {
    FIRDatabaseReference *ref = [self getReferenceForAppPath:appName path:path];
    [ref removeValueWithCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

RCT_EXPORT_METHOD(once:(NSString *) appName
                   key:(NSString *) key
                  path:(NSString *) path
             modifiers:(NSArray *) modifiers
             eventName:(NSString *) eventName
              resolver:(RCTPromiseResolveBlock) resolve
              rejecter:(RCTPromiseRejectBlock) reject) {
    RNFirebaseDatabaseReference *ref = [self getInternalReferenceForApp:appName key:key path:path modifiers:modifiers];
    [ref once:eventName resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(on:(NSString *) appName
               props:(NSDictionary *) props) {
    RNFirebaseDatabaseReference *ref = [self getCachedInternalReferenceForApp:appName props:props];
    [ref on:props[@"eventType"] registration:props[@"registration"]];
}

RCT_EXPORT_METHOD(off:(NSString *) key
 eventRegistrationKey:(NSString *) eventRegistrationKey) {
    RNFirebaseDatabaseReference *ref = _dbReferences[key];
    if (ref) {
        [ref removeEventListener:eventRegistrationKey];

        if (![ref hasListeners]) {
            [_dbReferences removeObjectForKey:key];
        }
    }
}



/*
 * INTERNALS/UTILS
 */
+ (void)handlePromise:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject databaseError:(NSError *)databaseError {
    if (databaseError != nil) {
        NSDictionary *jsError = [RNFirebaseDatabase getJSError:databaseError];
        reject([jsError valueForKey:@"code"], [jsError valueForKey:@"message"], databaseError);
    } else {
        resolve([NSNull null]);
    }
}

+ (FIRDatabase *)getDatabaseForApp:(NSString *)appName {
    FIRApp *app = [FIRApp appNamed:appName];
    return [FIRDatabase databaseForApp:app];
}

- (FIRDatabaseReference *)getReferenceForAppPath:(NSString *)appName path:(NSString *)path {
    return [[RNFirebaseDatabase getDatabaseForApp:appName] referenceWithPath:path];
}

- (RNFirebaseDatabaseReference *)getInternalReferenceForApp:(NSString *)appName key:(NSString *)key path:(NSString *)path modifiers:(NSArray *)modifiers {
    return [[RNFirebaseDatabaseReference alloc] initWithPathAndModifiers:self app:appName key:key refPath:path modifiers:modifiers];
}

- (RNFirebaseDatabaseReference *)getCachedInternalReferenceForApp:(NSString *)appName props:(NSDictionary *)props {
    NSString *key = props[@"key"];
    NSString *path = props[@"path"];
    NSDictionary *modifiers = props[@"modifiers"];

    RNFirebaseDatabaseReference *ref = _dbReferences[key];

    if (ref == nil) {
        ref = [[RNFirebaseDatabaseReference alloc] initWithPathAndModifiers:self app:appName key:key refPath:path modifiers:modifiers];
        _dbReferences[key] = ref;
    }
    return ref;
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
    NSString *service = @"Database";

    switch (nativeError.code) {
        // iOS confirmed codes
        case 1: // -3 on Android
            code = [RNFirebaseDatabase getCodeWithService:service code:@"permission-denied"];
            message = [RNFirebaseDatabase getMessageWithService:@"Client doesn't have permission to access the desired data." service:service fullCode:code];
            break;
        case 2: // -10 on Android
            code = [RNFirebaseDatabase getCodeWithService:service code:@"unavailable"];
            message = [RNFirebaseDatabase getMessageWithService:@"The service is unavailable." service:service fullCode:code];
            break;
        case 3: // -25 on Android
            code = [RNFirebaseDatabase getCodeWithService:service code:@"write-cancelled"];
            message = [RNFirebaseDatabase getMessageWithService:@"The write was canceled by the user." service:service fullCode:code];
            break;

            // TODO: Missing iOS equivalent codes
        case -1:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"data-stale"];
            message = [RNFirebaseDatabase getMessageWithService:@"The transaction needs to be run again with current data." service:service fullCode:code];
            break;
        case -2:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"failure"];
            message = [RNFirebaseDatabase getMessageWithService:@"The server indicated that this operation failed." service:service fullCode:code];
            break;
        case -4:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"disconnected"];
            message = [RNFirebaseDatabase getMessageWithService:@"The operation had to be aborted due to a network disconnect." service:service fullCode:code];
            break;
        case -6:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"expired-token"];
            message = [RNFirebaseDatabase getMessageWithService:@"The supplied auth token has expired." service:service fullCode:code];
            break;
        case -7:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"invalid-token"];
            message = [RNFirebaseDatabase getMessageWithService:@"The supplied auth token was invalid." service:service fullCode:code];
            break;
        case -8:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"max-retries"];
            message = [RNFirebaseDatabase getMessageWithService:@"The transaction had too many retries." service:service fullCode:code];
            break;
        case -9:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"overridden-by-set"];
            message = [RNFirebaseDatabase getMessageWithService:@"The transaction was overridden by a subsequent set." service:service fullCode:code];
            break;
        case -11:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"user-code-exception"];
            message = [RNFirebaseDatabase getMessageWithService:@"User code called from the Firebase Database runloop threw an exception." service:service fullCode:code];
            break;
        case -24:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"network-error"];
            message = [RNFirebaseDatabase getMessageWithService:@"The operation could not be performed due to a network error." service:service fullCode:code];
            break;
        default:
            code = [RNFirebaseDatabase getCodeWithService:service code:@"unknown"];
            message = [RNFirebaseDatabase getMessageWithService:@"An unknown error occurred." service:service fullCode:code];
            break;
    }

    [errorMap setValue:code forKey:@"code"];
    [errorMap setValue:message forKey:@"message"];

    return errorMap;
}

- (NSDictionary *)createTransactionUpdateMap:(NSString *)appName transactionId:(NSNumber *)transactionId updatesData:(FIRMutableData *)updatesData {
    NSMutableDictionary *updatesMap = [[NSMutableDictionary alloc] init];
    [updatesMap setValue:transactionId forKey:@"id"];
    [updatesMap setValue:@"update" forKey:@"type"];
    [updatesMap setValue:appName forKey:@"appName"];
    [updatesMap setValue:updatesData.value forKey:@"value"];

    return updatesMap;
}

- (NSDictionary *)createTransactionResultMap:(NSString *)appName transactionId:(NSNumber *)transactionId error:(NSError *)error committed:(BOOL)committed snapshot:(FIRDataSnapshot *)snapshot {
    NSMutableDictionary *resultMap = [[NSMutableDictionary alloc] init];
    [resultMap setValue:transactionId forKey:@"id"];
    [resultMap setValue:appName forKey:@"appName"];
    // TODO: no timeout on iOS
    [resultMap setValue:@(committed) forKey:@"committed"];
    // TODO: no interrupted on iOS
    if (error != nil) {
        [resultMap setValue:@"error" forKey:@"type"];
        [resultMap setValue:[RNFirebaseDatabase getJSError:error] forKey:@"error"];
        // TODO: timeout error on iOS
    } else {
        [resultMap setValue:@"complete" forKey:@"type"];
        [resultMap setValue:[RNFirebaseDatabaseReference snapshotToDict:snapshot] forKey:@"snapshot"];
    }

    return resultMap;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[DATABASE_SYNC_EVENT, DATABASE_TRANSACTION_EVENT];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end

#else
@implementation RNFirebaseDatabase
@end
#endif
