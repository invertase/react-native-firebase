#import "RNFirebaseDatabase.h"

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)
#import "RNFirebaseDatabaseReference.h"
#import "RNFirebaseEvents.h"
#import "Firebase.h"

@implementation RNFirebaseDatabase
RCT_EXPORT_MODULE();

- (id)init {
    self = [super init];
    if (self != nil) {
        _dbReferences = [[NSMutableDictionary alloc] init];
        _transactions = [[NSMutableDictionary alloc] init];
        _transactionQueue = dispatch_queue_create("io.invertase.react-native-firebase", DISPATCH_QUEUE_CONCURRENT);
    }
    return self;
}

- (void)sendTransactionEvent:(NSString *)type body:(id)body {
    @try {
        [self sendEventWithName:type body:body];
    } @catch (NSException *err) {
        NSLog(@"An error occurred in sendJSEvent: %@", [err debugDescription]);
        NSLog(@"Tried to send: %@ with %@", type, body);
    }
}

RCT_EXPORT_METHOD(startTransaction:
    (NSString *) path
            identifier:
            (NSString *) identifier
            applyLocally:
            (BOOL) applyLocally) {
    dispatch_async(_transactionQueue, ^{
        NSMutableDictionary *transactionState = [NSMutableDictionary new];
        dispatch_semaphore_t sema = dispatch_semaphore_create(0);
        transactionState[@"semaphore"] = sema;
        FIRDatabaseReference *ref = [self getPathRef:path];

        [ref runTransactionBlock:^FIRTransactionResult * _Nonnull(FIRMutableData *
        _Nonnull currentData) {
        dispatch_barrier_async(_transactionQueue, ^{
            [_transactions setValue:transactionState forKey:identifier];
            [self sendTransactionEvent:DATABASE_TRANSACTION_EVENT body:@{@"id": identifier, @"type": @"update", @"value": currentData.value}];
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
            [_transactions removeObjectForKey:identifier];
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
            if (databaseError != nil) {
                [self sendTransactionEvent:DATABASE_TRANSACTION_EVENT body:@{@"id": identifier, @"type": @"error", @"code": @([databaseError code]), @"message": [databaseError description]}];
            } else {
                [self sendTransactionEvent:DATABASE_TRANSACTION_EVENT body:@{@"id": identifier, @"type": @"complete", @"committed": @(committed), @"snapshot": [RNFirebaseDatabaseReference snapshotToDict:snapshot],}];
            }
        }
        withLocalEvents:
        applyLocally];
    });
}

RCT_EXPORT_METHOD(tryCommitTransaction:
    (NSString *) identifier
            withData:
            (NSDictionary *) data) {
    __block NSMutableDictionary *transactionState;

    dispatch_sync(_transactionQueue, ^{
        transactionState = _transactions[identifier];
    });

    if (!transactionState) {
        NSLog(@"tryCommitTransaction for unknown ID %@", identifier);
        return;
    }

    dispatch_semaphore_t sema = [transactionState valueForKey:@"semaphore"];

    BOOL abort = [[data valueForKey:@"abort"] boolValue];

    if (abort) {
        [transactionState setValue:@true forKey:@"abort"];
    } else {
        id newValue = [data valueForKey:@"value"];
        [transactionState setValue:newValue forKey:@"value"];
    }

    dispatch_semaphore_signal(sema);
}

RCT_EXPORT_METHOD(enablePersistence:
    (BOOL) enable
            callback:
            (RCTResponseSenderBlock) callback) {

    BOOL isEnabled = [FIRDatabase database].persistenceEnabled;
    if (isEnabled != enable) {
        @try {
            [FIRDatabase database].persistenceEnabled = enable;
        } @catch (NSException *exception) {
            // do nothing - for RN packager reloads
        }
    }
    callback(@[[NSNull null], @{@"result": @"success"}]);
}

RCT_EXPORT_METHOD(keepSynced:
    (NSString *) path
            withEnable:
            (BOOL) enable
            callback:
            (RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref keepSynced:enable];
    callback(@[[NSNull null], @{@"status": @"success", @"path": path}]);
}

RCT_EXPORT_METHOD(set:
    (NSString *) path
            data:
            (NSDictionary *) data
            callback:
            (RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref setValue:[data valueForKey:@"value"] withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [self handleCallback:@"set" callback:callback databaseError:error];
    }];
}

RCT_EXPORT_METHOD(priority:(NSString *) path
                  priorityData:(NSDictionary *) priorityData
                  callback:(RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref setPriority:[priorityData valueForKey:@"value"] withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
        [self handleCallback:@"priority" callback:callback databaseError:error];
    }];
}

RCT_EXPORT_METHOD(withPriority:(NSString *) path
                          data:(NSDictionary *) data
                  priorityData:(NSDictionary *) priorityData
                      callback:(RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref setValue:[data valueForKey:@"value"] andPriority:[priorityData valueForKey:@"value"] withCompletionBlock:^(NSError * _Nullable error, FIRDatabaseReference * _Nonnull ref) {
        [self handleCallback:@"withPriority" callback:callback databaseError:error];
    }];
}

RCT_EXPORT_METHOD(update:
    (NSString *) path
            value:
            (NSDictionary *) value
            callback:
            (RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref updateChildValues:value withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [self handleCallback:@"update" callback:callback databaseError:error];
    }];
}

RCT_EXPORT_METHOD(remove:
    (NSString *) path
            callback:
            (RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref removeValueWithCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [self handleCallback:@"remove" callback:callback databaseError:error];
    }];
}

RCT_EXPORT_METHOD(push:
    (NSString *) path
            data:
            (NSDictionary *) data
            callback:
            (RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    FIRDatabaseReference *newRef = [ref childByAutoId];

    NSURL *url = [NSURL URLWithString:newRef.URL];
    NSString *newPath = [url path];

    if ([data count] > 0) {
        [newRef setValue:[data valueForKey:@"value"] withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
            if (error != nil) {
                // Error handling
                NSDictionary *evt = @{@"code": @([error code]), @"details": [error debugDescription], @"message": [error localizedDescription], @"description": [error description]};

                callback(@[evt]);
            } else {
                callback(@[[NSNull null], @{@"status": @"success", @"ref": newPath}]);
            }
        }];
    } else {
        callback(@[[NSNull null], @{@"status": @"success", @"ref": newPath}]);
    }
}


RCT_EXPORT_METHOD(on:
    (nonnull
        NSNumber *) refId
        path:(NSString *) path
        modifiers:(NSArray *) modifiers
        listenerId:(nonnull NSNumber *) listenerId
        name:(NSString *) eventName
        callback:(RCTResponseSenderBlock) callback) {
    RNFirebaseDatabaseReference *ref = [self getDBHandle:refId path:path modifiers:modifiers];
    [ref addEventHandler:listenerId eventName:eventName];
    callback(@[[NSNull null], @{@"status": @"success", @"refId": refId, @"handle": path}]);
}

RCT_EXPORT_METHOD(once:
    (nonnull
        NSNumber *) refId
        path:(NSString *) path
        modifiers:(NSArray *) modifiers
        eventName:(NSString *) eventName
        callback:(RCTResponseSenderBlock) callback) {
    RNFirebaseDatabaseReference *ref = [self getDBHandle:refId path:path modifiers:modifiers];
    [ref addSingleEventHandler:eventName callback:callback];
}

RCT_EXPORT_METHOD(off:
    (nonnull
        NSNumber *) refId
        listeners:(NSArray *) listeners
        callback:(RCTResponseSenderBlock) callback) {
    RNFirebaseDatabaseReference *ref = _dbReferences[refId];
    if (ref != nil) {
        for (NSDictionary *listener in listeners) {
            NSNumber *listenerId = [listener valueForKey:@"listenerId"];
            NSString *eventName = [listener valueForKey:@"eventName"];
            [ref removeEventHandler:listenerId eventName:eventName];
            if (![ref hasListeners]) {
                [_dbReferences removeObjectForKey:refId];
            }
        }
    }
    callback(@[[NSNull null], @{@"status": @"success", @"refId": refId,}]);
}

// On disconnect
RCT_EXPORT_METHOD(onDisconnectSet:
    (NSString *) path
            props:
            (NSDictionary *) props
            callback:
            (RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref onDisconnectSetValue:props[@"value"] withCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [self handleCallback:@"onDisconnectSetObject" callback:callback databaseError:error];
    }];
}

RCT_EXPORT_METHOD(onDisconnectRemove:
    (NSString *) path
            callback:
            (RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref onDisconnectRemoveValueWithCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [self handleCallback:@"onDisconnectRemove" callback:callback databaseError:error];
    }];
}


RCT_EXPORT_METHOD(onDisconnectCancel:
    (NSString *) path
            callback:
            (RCTResponseSenderBlock) callback) {
    FIRDatabaseReference *ref = [self getPathRef:path];
    [ref cancelDisconnectOperationsWithCompletionBlock:^(NSError *_Nullable error, FIRDatabaseReference *_Nonnull _ref) {
        [self handleCallback:@"onDisconnectCancel" callback:callback databaseError:error];
    }];
}

RCT_EXPORT_METHOD(goOffline) {
    [FIRDatabase database].goOffline;
}

RCT_EXPORT_METHOD(goOnline) {
    [FIRDatabase database].goOnline;
}

- (FIRDatabaseReference *)getPathRef:(NSString *)path {
    return [[[FIRDatabase database] reference] child:path];
}

- (void)handleCallback:(NSString *)methodName callback:(RCTResponseSenderBlock)callback databaseError:(NSError *)databaseError {
    if (databaseError != nil) {
        NSDictionary *evt = @{@"code": @([databaseError code]), @"details": [databaseError debugDescription], @"message": [databaseError localizedDescription], @"description": [databaseError description]};
        callback(@[evt]);
    } else {
        callback(@[[NSNull null], @{@"status": @"success", @"method": methodName}]);
    }
}

- (RNFirebaseDatabaseReference *)getDBHandle:(NSNumber *)refId path:(NSString *)path modifiers:(NSArray *)modifiers {
    RNFirebaseDatabaseReference *ref = _dbReferences[refId];

    if (ref == nil) {
        ref = [[RNFirebaseDatabaseReference alloc] initWithPathAndModifiers:self database:[FIRDatabase database] refId:refId path:path modifiers:modifiers];
        _dbReferences[refId] = ref;
    }
    return ref;
}

// Not sure how to get away from this... yet
- (NSArray<NSString *> *)supportedEvents {
    return @[DATABASE_DATA_EVENT, DATABASE_ERROR_EVENT, DATABASE_TRANSACTION_EVENT];
}

@end

#else
@implementation RNFirebaseDatabase
@end
#endif
