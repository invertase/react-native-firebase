#import "RNFirebaseDatabaseReference.h"

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)
#import "RNFirebaseEvents.h"

@implementation RNFirebaseDatabaseReference

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
            NSDictionary *props = [RNFirebaseDatabaseReference snapshotToDict:snapshot];
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
    FIRDataEventType firDataEventType = (FIRDataEventType)[self eventTypeFromName:eventName];

    [_query observeSingleEventOfType:firDataEventType andPreviousSiblingKeyWithBlock:^(FIRDataSnapshot *_Nonnull snapshot, NSString *_Nullable previousChildName) {
        NSDictionary *props = [RNFirebaseDatabaseReference snapshotToDict:snapshot];
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

#else
@implementation RNFirebaseDatabase
@end
#endif
