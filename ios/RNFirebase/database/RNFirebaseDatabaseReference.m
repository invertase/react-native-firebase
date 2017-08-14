#import "RNFirebaseDatabaseReference.h"

@implementation RNFirebaseDatabaseReference

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)

- (id)initWithPathAndModifiers:(RCTEventEmitter *)emitter
                           app:(NSString *) app
                         refId:(NSNumber *) refId
                       refPath:(NSString *) refPath
                     modifiers:(NSArray *) modifiers {
    self = [super init];
    if (self) {
        _emitter = emitter;
        _app = app;
        _refId = refId;
        _path = refPath;

        // TODO: Only create if needed
        _listeners = [[NSMutableDictionary alloc] init];

        _query = [self buildQueryAtPathWithModifiers:refPath modifiers:modifiers];
    }
    return self;
}

- (void)addEventHandler:(NSNumber *)listenerId eventName:(NSString *)eventName {
    if (!_listeners[listenerId]) {
        id andPreviousSiblingKeyWithBlock = ^(FIRDataSnapshot *_Nonnull snapshot, NSString *_Nullable previousChildName) {
            NSDictionary *props = [RNFirebaseDatabaseReference snapshotToDict:snapshot];
            [self sendJSEvent:DATABASE_ON_EVENT title:eventName props:@{@"eventName": eventName, @"refId": _refId, @"listenerId": listenerId, @"path": _path, @"snapshot": props, @"previousChildName": previousChildName != nil ? previousChildName : [NSNull null]}];
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

- (void)addSingleEventHandler:(NSString *)eventName
                     resolver:(RCTPromiseResolveBlock) resolve
                     rejecter:(RCTPromiseRejectBlock) reject {
    FIRDataEventType firDataEventType = (FIRDataEventType)[self eventTypeFromName:eventName];

    [_query observeSingleEventOfType:firDataEventType andPreviousSiblingKeyWithBlock:^(FIRDataSnapshot *_Nonnull snapshot, NSString *_Nullable previousChildName) {
        NSDictionary *data = [RNFirebaseDatabaseReference snapshotToDictionary:eventName path:_path dataSnapshot:snapshot previousChildName:previousChildName refId:_refId listenerId:0];
        resolve(data);
    } withCancelBlock:^(NSError *_Nonnull error) {
        NSLog(@"Error onDBEventOnce: %@", [error debugDescription]);
        [RNFirebaseDatabase handlePromise:resolve rejecter:reject databaseError:error];
    }];
}

- (void)removeEventHandler:(NSNumber *)listenerId eventName:(NSString *)eventName {
    FIRDatabaseHandle handle = (FIRDatabaseHandle) [_listeners[listenerId] integerValue];
    if (handle) {
        [_listeners removeObjectForKey:listenerId];
        [_query removeObserverWithHandle:handle];
    }
}

+ (NSDictionary *) snapshotToDictionary:(NSString *) eventName
                                   path:(NSString *) path
                           dataSnapshot:(FIRDataSnapshot *) dataSnapshot
                      previousChildName:(NSString *) previousChildName
                                  refId:(NSNumber *) refId
                             listenerId:(NSNumber *) listenerId {
    NSMutableDictionary *snapshot = [[NSMutableDictionary alloc] init];
    NSMutableDictionary *eventMap = [[NSMutableDictionary alloc] init];

    [snapshot setValue:dataSnapshot.key forKey:@"key"];
    [snapshot setValue:@(dataSnapshot.exists) forKey:@"exists"];
    [snapshot setValue:@(dataSnapshot.hasChildren) forKey:@"hasChildren"];
    [snapshot setValue:@(dataSnapshot.childrenCount) forKey:@"childrenCount"];
    [snapshot setValue:dataSnapshot.value forKey:@"value"];
    [snapshot setValue:[RNFirebaseDatabaseReference getChildKeys:dataSnapshot] forKey:@"childKeys"];
    [snapshot setValue:dataSnapshot.priority forKey:@"priority"];

    [eventMap setValue:refId forKey:@"refId"];
    [eventMap setValue:path forKey:@"path"];
    [eventMap setValue:snapshot forKey:@"snapshot"];
    [eventMap setValue:eventName forKey:@"eventName"];
    [eventMap setValue:listenerId forKey:@"listenerId"];
    [eventMap setValue:previousChildName forKey:@"previousChildName"];

    return eventMap;
}

+ (NSMutableArray *) getChildKeys:(FIRDataSnapshot *) snapshot {
    NSMutableArray *childKeys = [NSMutableArray array];
    if (snapshot.childrenCount > 0) {
        NSEnumerator *children = [snapshot children];
        FIRDataSnapshot *child;
        while (child = [children nextObject]) {
            [childKeys addObject:child.key];
        }
    }
    return childKeys;
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
    NSDictionary *event = @{@"eventName": DATABASE_CANCEL_EVENT, @"path": _path, @"refId": _refId, @"listenerId": listenerId, @"code": @([error code]), @"details": [error debugDescription], @"message": [error localizedDescription], @"description": [error description]};

    @try {
        [_emitter sendEventWithName:DATABASE_CANCEL_EVENT body:event];
    } @catch (NSException *err) {
        NSLog(@"An error occurred in getAndSendDatabaseError: %@", [err debugDescription]);
        NSLog(@"Tried to send: %@ with %@", DATABASE_CANCEL_EVENT, event);
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

- (FIRDatabaseQuery *)buildQueryAtPathWithModifiers:(NSString *) path
                                          modifiers:(NSArray *)modifiers {
    FIRDatabase *firebaseDatabase = [RNFirebaseDatabase getDatabaseForApp:_app];
    FIRDatabaseQuery *query = [[firebaseDatabase reference] child:path];

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

#endif

@end
