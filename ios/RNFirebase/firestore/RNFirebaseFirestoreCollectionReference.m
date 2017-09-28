#import "RNFirebaseFirestoreCollectionReference.h"

@implementation RNFirebaseFirestoreCollectionReference

#if __has_include(<Firestore/FIRFirestore.h>)

- (id)initWithPathAndModifiers:(NSString *) app
                          path:(NSString *) path
                       filters:(NSArray *) filters
                        orders:(NSArray *) orders
                       options:(NSDictionary *) options {
    self = [super init];
    if (self) {
        _app = app;
        _path = path;
        _filters = filters;
        _orders = orders;
        _options = options;
        _query = [self buildQuery];
    }
    return self;
}

- (void)get:(RCTPromiseResolveBlock) resolve
   rejecter:(RCTPromiseRejectBlock) reject {
    [_query getDocumentsWithCompletion:^(FIRQuerySnapshot * _Nullable snapshot, NSError * _Nullable error) {
        if (error) {
            [RNFirebaseFirestore promiseRejectException:reject error:error];
        } else {
            NSDictionary *data = [RNFirebaseFirestoreCollectionReference snapshotToDictionary:snapshot];
            resolve(data);
        }
    }];
}

- (FIRQuery *)buildQuery {
    FIRQuery *query = (FIRQuery*)[[RNFirebaseFirestore getFirestoreForApp:_app] collectionWithPath:_path];
    query = [self applyFilters:query];
    query = [self applyOrders:query];
    query = [self applyOptions:query];
    
    return query;
}

- (FIRQuery *)applyFilters:(FIRQuery *) query {
    for (NSDictionary *filter in _filters) {
        NSString *fieldPath = filter[@"fieldPath"];
        NSString *operator = filter[@"operator"];
        // TODO: Validate this works
        id value = filter[@"value"];
        
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
    }
    return query;
}

- (FIRQuery *)applyOrders:(FIRQuery *) query {
    for (NSDictionary *order in _orders) {
        NSString *direction = order[@"direction"];
        NSString *fieldPath = order[@"fieldPath"];
        
        query = [query queryOrderedByField:fieldPath descending:([direction isEqualToString:@"DESCENDING"])];
    }
    return query;
}

- (FIRQuery *)applyOptions:(FIRQuery *) query {
    if (_options[@"endAt"]) {
        query = [query queryEndingAtValues:_options[@"endAt"]];
    }
    if (_options[@"endBefore"]) {
        query = [query queryEndingBeforeValues:_options[@"endBefore"]];
    }
    if (_options[@"offset"]) {
        // iOS doesn't support offset
    }
    if (_options[@"selectFields"]) {
        // iOS doesn't support selectFields
    }
    if (_options[@"startAfter"]) {
        query = [query queryStartingAfterValues:_options[@"startAfter"]];
    }
    if (_options[@"startAt"]) {
        query = [query queryStartingAtValues:_options[@"startAt"]];
    }
    return query;
}

+ (NSDictionary *)snapshotToDictionary:(FIRQuerySnapshot *)querySnapshot {
    NSMutableDictionary *snapshot = [[NSMutableDictionary alloc] init];
    [snapshot setValue:[self documentChangesToArray:querySnapshot.documentChanges] forKey:@"changes"];
    [snapshot setValue:[self documentSnapshotsToArray:querySnapshot.documents] forKey:@"documents"];
    
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

