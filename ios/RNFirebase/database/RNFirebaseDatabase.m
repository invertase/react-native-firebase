#import "RNFirebaseDatabase.h"
#import "RNFirebaseEvents.h"
#import "Firebase.h"

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)

@interface RNFirebaseDBReference : NSObject
@property RCTEventEmitter *emitter;
@property FIRDatabaseQuery *query;
@property NSNumber *refId;
@property NSString *path;
@property NSMutableDictionary *listeners;

+ (NSDictionary *)snapshotToDict:(FIRDataSnapshot *)snapshot;
@end

@implementation RNFirebaseDBReference


- (id)initWithPathAndModifiers:(RCTEventEmitter *)emitter database:(FIRDatabase *)database refId:(NSNumber *)refId path:(NSString *)path modifiers:(NSArray *)modifiers {
    self = [super init];
    if (self) {
        _emitter = emitter;
        _refId = refId;
        _path = path;
        _query = [self buildQueryAtPathWithModifiers:database path:path modifiers:modifiers];
        _listeners = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (void)addEventHandler:(NSNumber *)listenerId eventName:(NSString *)eventName {
    if (!_listeners[listenerId]) {
        id andPreviousSiblingKeyWithBlock = ^(FIRDataSnapshot *_Nonnull snapshot, NSString *_Nullable previousChildName) {
            NSDictionary *props = [RNFirebaseDBReference snapshotToDict:snapshot];
            [self sendJSEvent:DATABASE_DATA_EVENT title:eventName props:@{@"eventName": eventName, @"refId": _refId, @"listenerId": listenerId, @"path": _path, @"snapshot": props, @"previousChildName": previousChildName != nil ? previousChildName : [NSNull null]}];
        };
        id errorBlock = ^(NSError *_Nonnull error) {
            NSLog(@"Error onDBEvent: %@", [error debugDescription]);
            [self removeEventHandler:listenerId eventName:eventName];
            [self getAndSendDatabaseError:error listenerId:listenerId];
        };
        int eventType = [self eventTypeFromName:eventName];
        FIRDatabaseHandle handle = [_query observeEventType:eventType andPreviousSiblingKeyWithBlock:andPreviousSiblingKeyWithBlock withCancelBlock:errorBlock];
        _listeners[listenerId] = @(handle);
    } else {
        NSLog(@"Warning Trying to add duplicate listener for refId: %@ listenerId: %@", _refId, listenerId);
    }
}

- (void)addSingleEventHandler:(NSString *)eventName callback:(RCTResponseSenderBlock)callback {
    FIRDataEventType *firDataEventType;

    if ([eventName isEqualToString:@"value"]) {
        firDataEventType = (FIRDataEventType *) FIRDataEventTypeValue;
    } else if ([eventName isEqualToString:@"child_added"]) {
        firDataEventType = (FIRDataEventType *) FIRDataEventTypeChildAdded;
    } else if ([eventName isEqualToString:@"child_removed"]) {
        firDataEventType = (FIRDataEventType *) FIRDataEventTypeChildRemoved;
    } else if ([eventName isEqualToString:@"child_changed"]) {
        firDataEventType = (FIRDataEventType *) FIRDataEventTypeChildChanged;
    } else if ([eventName isEqualToString:@"child_moved"]) {
        firDataEventType = (FIRDataEventType *) FIRDataEventTypeChildMoved;
    }

    [_query observeSingleEventOfType:firDataEventType andPreviousSiblingKeyWithBlock:^(FIRDataSnapshot *_Nonnull snapshot, NSString *_Nullable previousChildName) {
        NSDictionary *props = [RNFirebaseDBReference snapshotToDict:snapshot];
        callback(@[[NSNull null], @{@"eventName": eventName, @"path": _path, @"refId": _refId, @"snapshot": props, @"previousChildName": previousChildName != nil ? previousChildName : [NSNull null]}]);
    } withCancelBlock:^(NSError *_Nonnull error) {
        NSLog(@"Error onDBEventOnce: %@", [error debugDescription]);
        callback(@[@{@"eventName": DATABASE_ERROR_EVENT, @"path": _path, @"refId": _refId, @"code": @([error code]), @"details": [error debugDescription], @"message": [error localizedDescription], @"description": [error description]}]);
    }];
}

- (void)removeEventHandler:(NSNumber *)listenerId eventName:(NSString *)eventName {
    FIRDatabaseHandle handle = (FIRDatabaseHandle) [_listeners[listenerId] integerValue];
    if (handle) {
        [_listeners removeObjectForKey:listenerId];
        [_query removeObserverWithHandle:handle];
    }
}

+ (NSDictionary *)snapshotToDict:(FIRDataSnapshot *)snapshot {
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    [dict setValue:snapshot.key forKey:@"key"];
    NSDictionary *val = snapshot.value;
    dict[@"value"] = val;
    // Snapshot ordering
    NSMutableArray *childKeys = [NSMutableArray array];
    if (snapshot.childrenCount > 0) {
        // Since JS does not respect object ordering of keys
        // we keep a list of the keys and their ordering
        // in the snapshot event
        NSEnumerator *children = [snapshot children];
        FIRDataSnapshot *child;
        while (child = [children nextObject]) {
            [childKeys addObject:child.key];
        }
    }
    dict[@"childKeys"] = childKeys;
    [dict setValue:@(snapshot.hasChildren) forKey:@"hasChildren"];
    [dict setValue:@(snapshot.exists) forKey:@"exists"];
    [dict setValue:@(snapshot.childrenCount) forKey:@"childrenCount"];
    [dict setValue:snapshot.priority forKey:@"priority"];
    return dict;
}

- (NSDictionary *)getAndSendDatabaseError:(NSError *)error listenerId:(NSNumber *)listenerId {
    NSDictionary *event = @{@"eventName": DATABASE_ERROR_EVENT, @"path": _path, @"refId": _refId, @"listenerId": listenerId, @"code": @([error code]), @"details": [error debugDescription], @"message": [error localizedDescription], @"description": [error description]};

    @try {
        [_emitter sendEventWithName:DATABASE_ERROR_EVENT body:event];
    } @catch (NSException *err) {
        NSLog(@"An error occurred in getAndSendDatabaseError: %@", [err debugDescription]);
        NSLog(@"Tried to send: %@ with %@", DATABASE_ERROR_EVENT, event);
    }

    return event;
}

- (void)sendJSEvent:(NSString *)type title:(NSString *)title props:(NSDictionary *)props {
    @try {
        [_emitter sendEventWithName:type body:@{@"eventName": title, @"body": props}];
    } @catch (NSException *err) {
        NSLog(@"An error occurred in sendJSEvent: %@", [err debugDescription]);
        NSLog(@"Tried to send: %@ with %@", title, props);
    }
}

- (FIRDatabaseQuery *)buildQueryAtPathWithModifiers:(FIRDatabase *)database path:(NSString *)path modifiers:(NSArray *)modifiers {
    FIRDatabaseQuery *query = [[database reference] child:path];

    for (NSDictionary *modifier in modifiers) {
        NSString *type = [modifier valueForKey:@"type"];
        NSString *name = [modifier valueForKey:@"name"];
        if ([type isEqualToString:@"orderBy"]) {
            if ([name isEqualToString:@"orderByKey"]) {
                query = [query queryOrderedByKey];
            } else if ([name isEqualToString:@"orderByPriority"]) {
                query = [query queryOrderedByPriority];
            } else if ([name isEqualToString:@"orderByValue"]) {
                query = [query queryOrderedByValue];
            } else if ([name isEqualToString:@"orderByChild"]) {
                NSString *key = [modifier valueForKey:@"key"];
                query = [query queryOrderedByChild:key];
            }
        } else if ([type isEqualToString:@"limit"]) {
            int limit = [[modifier valueForKey:@"limit"] integerValue];
            if ([name isEqualToString:@"limitToLast"]) {
                query = [query queryLimitedToLast:limit];
            } else if ([name isEqualToString:@"limitToFirst"]) {
                query = [query queryLimitedToFirst:limit];
            }
        } else if ([type isEqualToString:@"filter"]) {
            NSString *valueType = [modifier valueForKey:@"valueType"];
            NSString *key = [modifier valueForKey:@"key"];
            id value = [self getIdValue:[modifier valueForKey:@"value"] type:valueType];
            if ([name isEqualToString:@"equalTo"]) {
                if (key != nil) {
                    query = [query queryEqualToValue:value childKey:key];
                } else {
                    query = [query queryEqualToValue:value];
                }
            } else if ([name isEqualToString:@"endAt"]) {
                if (key != nil) {
                    query = [query queryEndingAtValue:value childKey:key];
                } else {
                    query = [query queryEndingAtValue:value];
                }
            } else if ([name isEqualToString:@"startAt"]) {
                if (key != nil) {
                    query = [query queryStartingAtValue:value childKey:key];
                } else {
                    query = [query queryStartingAtValue:value];
                }
            }
        }
    }

    return query;
}

- (id)getIdValue:(NSString *)value type:(NSString *)type {
    if ([type isEqualToString:@"number"]) {
        return @(value.doubleValue);
    } else if ([type isEqualToString:@"boolean"]) {
        return @(value.boolValue);
    } else {
        return value;
    }
}

- (BOOL)hasListeners {
    return [[_listeners allKeys] count] > 0;
}

- (int)eventTypeFromName:(NSString *)name {
    int eventType = FIRDataEventTypeValue;

    if ([name isEqualToString:DATABASE_VALUE_EVENT]) {
        eventType = FIRDataEventTypeValue;
    } else if ([name isEqualToString:DATABASE_CHILD_ADDED_EVENT]) {
        eventType = FIRDataEventTypeChildAdded;
    } else if ([name isEqualToString:DATABASE_CHILD_MODIFIED_EVENT]) {
        eventType = FIRDataEventTypeChildChanged;
    } else if ([name isEqualToString:DATABASE_CHILD_REMOVED_EVENT]) {
        eventType = FIRDataEventTypeChildRemoved;
    } else if ([name isEqualToString:DATABASE_CHILD_MOVED_EVENT]) {
        eventType = FIRDataEventTypeChildMoved;
    }
    return eventType;
}

@end


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
                [self sendTransactionEvent:DATABASE_TRANSACTION_EVENT body:@{@"id": identifier, @"type": @"complete", @"committed": @(committed), @"snapshot": [RNFirebaseDBReference snapshotToDict:snapshot],}];
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
    RNFirebaseDBReference *ref = [self getDBHandle:refId path:path modifiers:modifiers];
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
    RNFirebaseDBReference *ref = [self getDBHandle:refId path:path modifiers:modifiers];
    [ref addSingleEventHandler:eventName callback:callback];
}

RCT_EXPORT_METHOD(off:
    (nonnull
        NSNumber *) refId
        listeners:(NSArray *) listeners
        callback:(RCTResponseSenderBlock) callback) {
    RNFirebaseDBReference *ref = _dbReferences[refId];
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

- (RNFirebaseDBReference *)getDBHandle:(NSNumber *)refId path:(NSString *)path modifiers:(NSArray *)modifiers {
    RNFirebaseDBReference *ref = _dbReferences[refId];

    if (ref == nil) {
        ref = [[RNFirebaseDBReference alloc] initWithPathAndModifiers:self database:[FIRDatabase database] refId:refId path:path modifiers:modifiers];
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
