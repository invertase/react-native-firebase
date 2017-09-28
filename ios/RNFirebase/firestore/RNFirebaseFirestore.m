#import "RNFirebaseFirestore.h"

#if __has_include(<Firestore/FIRFirestore.h>)

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

RCT_EXPORT_METHOD(documentBatch:(NSString *) appName
                         writes:(NSArray *) writes
                  commitOptions:(NSDictionary *) commitOptions
                       resolver:(RCTPromiseResolveBlock) resolve
                       rejecter:(RCTPromiseRejectBlock) reject) {
    FIRFirestore *firestore = [RNFirebaseFirestore getFirestoreForApp:appName];
    FIRWriteBatch *batch = [firestore batch];
    
    for (NSDictionary *write in writes) {
        NSString *type = write[@"type"];
        NSString *path = write[@"path"];
        NSDictionary *data = write[@"data"];
        
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
            NSMutableArray *result = [[NSMutableArray alloc] init];
            for (NSDictionary *write in writes) {
                // Missing fields from web SDK
                // writeTime
                [result addObject:@{}];
            }
            resolve(result);
        }
    }];
}

RCT_EXPORT_METHOD(documentCollections:(NSString *) appName
                                 path:(NSString *) path
                             resolver:(RCTPromiseResolveBlock) resolve
                             rejecter:(RCTPromiseRejectBlock) reject) {
    [[self getDocumentForAppPath:appName path:path] get:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(documentCreate:(NSString *) appName
                            path:(NSString *) path
                            data:(NSDictionary *) data
                        resolver:(RCTPromiseResolveBlock) resolve
                        rejecter:(RCTPromiseRejectBlock) reject) {
    [[self getDocumentForAppPath:appName path:path] create:data resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(documentDelete:(NSString *) appName
                            path:(NSString *) path
                         options:(NSDictionary *) options
                        resolver:(RCTPromiseResolveBlock) resolve
                        rejecter:(RCTPromiseRejectBlock) reject) {
    [[self getDocumentForAppPath:appName path:path] delete:options resolver:resolve rejecter:reject];
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
    // TODO
    // NSDictionary *jsError = [RNFirebaseDatabase getJSError:databaseError];
    // reject([jsError valueForKey:@"code"], [jsError valueForKey:@"message"], databaseError);
    reject(@"TODO", [error description], error);
}

+ (FIRFirestore *)getFirestoreForApp:(NSString *)appName {
    FIRApp *app = [FIRApp appNamed:appName];
    return [FIRFirestore firestoreForApp:app];
}

- (RNFirebaseFirestoreCollectionReference *)getCollectionForAppPath:(NSString *)appName path:(NSString *)path filters:(NSArray *)filters orders:(NSArray *)orders options:(NSDictionary *)options {
    return [[RNFirebaseFirestoreCollectionReference alloc] initWithPathAndModifiers:appName path:path filters:filters orders:orders options:options];
}

- (RNFirebaseFirestoreDocumentReference *)getDocumentForAppPath:(NSString *)appName path:(NSString *)path {
    return [[RNFirebaseFirestoreDocumentReference alloc] initWithPath:appName path:path];
}

- (NSArray<NSString *> *)supportedEvents {
    return @[DATABASE_SYNC_EVENT, DATABASE_TRANSACTION_EVENT];
}

@end

#else
@implementation RNFirebaseFirestore
@end
#endif

