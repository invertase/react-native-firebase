#import "RNFirebaseFirestoreCollectionReference.h"

@implementation RNFirebaseFirestoreCollectionReference

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)

static NSMutableDictionary *_listeners;

- (id)initWithPathAndModifiers:(RCTEventEmitter *) emitter
                appDisplayName:(NSString *) appDisplayName
                          path:(NSString *) path
                       filters:(NSArray *) filters
                        orders:(NSArray *) orders
                       options:(NSDictionary *) options {
    self = [super init];
    if (self) {
        _emitter = emitter;
        _appDisplayName = appDisplayName;
        _path = path;
        _filters = filters;
        _orders = orders;
        _options = options;
        _query = [self buildQuery];
    }
    // Initialise the static listeners object if required
    if (!_listeners) {
        _listeners = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (void)get:(NSDictionary *) getOptions
   resolver:(RCTPromiseResolveBlock) resolve
   rejecter:(RCTPromiseRejectBlock) reject {
    FIRFirestoreSource source;
    if (getOptions && getOptions[@"source"]) {
        if ([getOptions[@"source"] isEqualToString:@"server"]) {
            source = FIRFirestoreSourceServer;
        } else if ([getOptions[@"source"] isEqualToString:@"cache"]) {
            source = FIRFirestoreSourceCache;
        } else {
            source = FIRFirestoreSourceDefault;
        }
    } else {
        source = FIRFirestoreSourceDefault;
    }
    [_query getDocumentsWithSource:source completion:^(FIRQuerySnapshot * _Nullable snapshot, NSError * _Nullable error) {
        if (error) {
            [RNFirebaseFirestore promiseRejectException:reject error:error];
        } else {
            NSDictionary *data = [RNFirebaseFirestoreCollectionReference snapshotToDictionary:snapshot];
            resolve(data);
        }
    }];
}

+ (void)offSnapshot:(NSString *) listenerId {
    id<FIRListenerRegistration> listener = _listeners[listenerId];
    if (listener) {
        [_listeners removeObjectForKey:listenerId];
        [listener remove];
    }
}

- (void)onSnapshot:(NSString *) listenerId
queryListenOptions:(NSDictionary *) queryListenOptions {
    if (_listeners[listenerId] == nil) {
        id listenerBlock = ^(FIRQuerySnapshot * _Nullable snapshot, NSError * _Nullable error) {
            if (error) {
                id<FIRListenerRegistration> listener = _listeners[listenerId];
                if (listener) {
                    [_listeners removeObjectForKey:listenerId];
                    [listener remove];
                }
                [self handleQuerySnapshotError:listenerId error:error];
            } else {
                [self handleQuerySnapshotEvent:listenerId querySnapshot:snapshot];
            }
        };

        bool includeMetadataChanges;
        if (queryListenOptions && queryListenOptions[@"includeMetadataChanges"]) {
            includeMetadataChanges = true;
        } else {
            includeMetadataChanges = false;
        }

        id<FIRListenerRegistration> listener = [_query addSnapshotListenerWithIncludeMetadataChanges:includeMetadataChanges listener:listenerBlock];
        _listeners[listenerId] = listener;
    }
}

- (FIRQuery *)buildQuery {
    FIRFirestore *firestore = [RNFirebaseFirestore getFirestoreForApp:_appDisplayName];
    FIRQuery *query = (FIRQuery*)[firestore collectionWithPath:_path];
    query = [self applyFilters:firestore query:query];
    query = [self applyOrders:query];
    query = [self applyOptions:firestore query:query];

    return query;
}

- (FIRQuery *)applyFilters:(FIRFirestore *) firestore
                     query:(FIRQuery *) query {
    for (NSDictionary *filter in _filters) {
        NSDictionary *fieldPathDictionary = filter[@"fieldPath"];
        NSString *fieldPathType = fieldPathDictionary[@"type"];
        NSString *operator = filter[@"operator"];
        NSDictionary *jsValue = filter[@"value"];
        id value = [RNFirebaseFirestoreDocumentReference parseJSTypeMap:firestore jsTypeMap:jsValue];

        if ([fieldPathType isEqualToString:@"string"]) {
            NSString *fieldPath = fieldPathDictionary[@"string"];
            if ([operator isEqualToString:@"EQUAL"]) {
                query = [query queryWhereField:fieldPath isEqualTo:value];
            } else if ([operator isEqualToString:@"GREATER_THAN"]) {
                query = [query queryWhereField:fieldPath isGreaterThan:value];
            } else if ([operator isEqualToString:@"GREATER_THAN_OR_EQUAL"]) {
                query = [query queryWhereField:fieldPath isGreaterThanOrEqualTo:value];
            } else if ([operator isEqualToString:@"LESS_THAN"]) {
                query = [query queryWhereField:fieldPath isLessThan:value];
            } else if ([operator isEqualToString:@"LESS_THAN_OR_EQUAL"]) {
                query = [query queryWhereField:fieldPath isLessThanOrEqualTo:value];
            }
        } else {
            NSArray *fieldPathElements = fieldPathDictionary[@"elements"];
            FIRFieldPath *fieldPath = [[FIRFieldPath alloc] initWithFields:fieldPathElements];
            if ([operator isEqualToString:@"EQUAL"]) {
                query = [query queryWhereFieldPath:fieldPath isEqualTo:value];
            } else if ([operator isEqualToString:@"GREATER_THAN"]) {
                query = [query queryWhereFieldPath:fieldPath isGreaterThan:value];
            } else if ([operator isEqualToString:@"GREATER_THAN_OR_EQUAL"]) {
                query = [query queryWhereFieldPath:fieldPath isGreaterThanOrEqualTo:value];
            } else if ([operator isEqualToString:@"LESS_THAN"]) {
                query = [query queryWhereFieldPath:fieldPath isLessThan:value];
            } else if ([operator isEqualToString:@"LESS_THAN_OR_EQUAL"]) {
                query = [query queryWhereFieldPath:fieldPath isLessThanOrEqualTo:value];
            }
        }
    }
    return query;
}

- (FIRQuery *)applyOrders:(FIRQuery *) query {
    for (NSDictionary *order in _orders) {
        NSString *direction = order[@"direction"];
        NSDictionary *fieldPathDictionary = order[@"fieldPath"];
        NSString *fieldPathType = fieldPathDictionary[@"type"];

        if ([fieldPathType isEqualToString:@"string"]) {
            NSString *fieldPath = fieldPathDictionary[@"string"];
            query = [query queryOrderedByField:fieldPath descending:([direction isEqualToString:@"DESCENDING"])];
        } else {
            NSArray *fieldPathElements = fieldPathDictionary[@"elements"];
            FIRFieldPath *fieldPath = [[FIRFieldPath alloc] initWithFields:fieldPathElements];
            query = [query queryOrderedByFieldPath:fieldPath descending:([direction isEqualToString:@"DESCENDING"])];
        }
    }
    return query;
}

- (FIRQuery *)applyOptions:(FIRFirestore *) firestore
                     query:(FIRQuery *) query {
    if (_options[@"endAt"]) {
        query = [query queryEndingAtValues:[RNFirebaseFirestoreDocumentReference parseJSArray:firestore jsArray:_options[@"endAt"]]];
    }
    if (_options[@"endBefore"]) {
        query = [query queryEndingBeforeValues:[RNFirebaseFirestoreDocumentReference parseJSArray:firestore jsArray:_options[@"endBefore"]]];
    }
    if (_options[@"limit"]) {
        query = [query queryLimitedTo:[_options[@"limit"] intValue]];
    }
    if (_options[@"offset"]) {
        // iOS doesn't support offset
    }
    if (_options[@"selectFields"]) {
        // iOS doesn't support selectFields
    }
    if (_options[@"startAfter"]) {
        query = [query queryStartingAfterValues:[RNFirebaseFirestoreDocumentReference parseJSArray:firestore jsArray:_options[@"startAfter"]]];
    }
    if (_options[@"startAt"]) {
        query = [query queryStartingAtValues:[RNFirebaseFirestoreDocumentReference parseJSArray:firestore jsArray:_options[@"startAt"]]];
    }
    return query;
}

- (void)handleQuerySnapshotError:(NSString *)listenerId
                           error:(NSError *)error {
    NSMutableDictionary *event = [[NSMutableDictionary alloc] init];
    [event setValue:_appDisplayName forKey:@"appName"];
    [event setValue:_path forKey:@"path"];
    [event setValue:listenerId forKey:@"listenerId"];
    [event setValue:[RNFirebaseFirestore getJSError:error] forKey:@"error"];

    [RNFirebaseUtil sendJSEvent:self.emitter name:FIRESTORE_COLLECTION_SYNC_EVENT body:event];
}

- (void)handleQuerySnapshotEvent:(NSString *)listenerId
                   querySnapshot:(FIRQuerySnapshot *)querySnapshot {
    NSMutableDictionary *event = [[NSMutableDictionary alloc] init];
    [event setValue:_appDisplayName forKey:@"appName"];
    [event setValue:_path forKey:@"path"];
    [event setValue:listenerId forKey:@"listenerId"];
    [event setValue:[RNFirebaseFirestoreCollectionReference snapshotToDictionary:querySnapshot] forKey:@"querySnapshot"];

    [RNFirebaseUtil sendJSEvent:self.emitter name:FIRESTORE_COLLECTION_SYNC_EVENT body:event];
}

+ (NSDictionary *)snapshotToDictionary:(FIRQuerySnapshot *)querySnapshot {
    NSMutableDictionary *snapshot = [[NSMutableDictionary alloc] init];
    [snapshot setValue:[self documentChangesToArray:querySnapshot.documentChanges] forKey:@"changes"];
    [snapshot setValue:[self documentSnapshotsToArray:querySnapshot.documents] forKey:@"documents"];
    if (querySnapshot.metadata) {
        NSMutableDictionary *metadata = [[NSMutableDictionary alloc] init];
        [metadata setValue:@(querySnapshot.metadata.fromCache) forKey:@"fromCache"];
        [metadata setValue:@(querySnapshot.metadata.hasPendingWrites) forKey:@"hasPendingWrites"];
        [snapshot setValue:metadata forKey:@"metadata"];
    }

    return snapshot;
}

+ (NSArray *)documentChangesToArray:(NSArray<FIRDocumentChange *> *) documentChanges {
    NSMutableArray *changes = [[NSMutableArray alloc] init];
    for (FIRDocumentChange *change in documentChanges) {
        [changes addObject:[self documentChangeToDictionary:change]];
    }

    return changes;
}

+ (NSDictionary *)documentChangeToDictionary:(FIRDocumentChange *)documentChange {
    NSMutableDictionary *change = [[NSMutableDictionary alloc] init];
    [change setValue:[RNFirebaseFirestoreDocumentReference snapshotToDictionary:documentChange.document] forKey:@"document"];
    [change setValue:@(documentChange.newIndex) forKey:@"newIndex"];
    [change setValue:@(documentChange.oldIndex) forKey:@"oldIndex"];

    if (documentChange.type == FIRDocumentChangeTypeAdded) {
        [change setValue:@"added" forKey:@"type"];
    } else if (documentChange.type == FIRDocumentChangeTypeRemoved) {
        [change setValue:@"removed" forKey:@"type"];
    } else if (documentChange.type == FIRDocumentChangeTypeModified) {
        [change setValue:@"modified" forKey:@"type"];
    }

    return change;
}

+ (NSArray *)documentSnapshotsToArray:(NSArray<FIRDocumentSnapshot *> *) documentSnapshots {
    NSMutableArray *snapshots = [[NSMutableArray alloc] init];
    for (FIRDocumentSnapshot *snapshot in documentSnapshots) {
        [snapshots addObject:[RNFirebaseFirestoreDocumentReference snapshotToDictionary:snapshot]];
    }

    return snapshots;
}

#endif

@end
