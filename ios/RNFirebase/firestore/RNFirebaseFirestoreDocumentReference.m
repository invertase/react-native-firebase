#import "RNFirebaseFirestoreDocumentReference.h"

@implementation RNFirebaseFirestoreDocumentReference

#if __has_include(<Firestore/FIRFirestore.h>)

- (id)initWithPath:(NSString *) app
              path:(NSString *) path {
    self = [super init];
    if (self) {
        _app = app;
        _path = path;
        _ref = [[RNFirebaseFirestore getFirestoreForApp:_app] documentWithPath:_path];
    }
    return self;
}

- (void)collections:(RCTPromiseResolveBlock) resolve
           rejecter:(RCTPromiseRejectBlock) reject {
    // Not supported on iOS
}

- (void)create:(NSDictionary *) data
      resolver:(RCTPromiseResolveBlock) resolve
      rejecter:(RCTPromiseRejectBlock) reject {
    // Not supported on iOS out of the box
}

- (void)delete:(NSDictionary *)options
      resolver:(RCTPromiseResolveBlock) resolve
      rejecter:(RCTPromiseRejectBlock) reject {
    [_ref deleteDocumentWithCompletion:^(NSError * _Nullable error) {
        [RNFirebaseFirestoreDocumentReference handleWriteResponse:error resolver:resolve rejecter:reject];
    }];
}

- (void)get:(RCTPromiseResolveBlock) resolve
   rejecter:(RCTPromiseRejectBlock) reject {
    [_ref getDocumentWithCompletion:^(FIRDocumentSnapshot * _Nullable snapshot, NSError * _Nullable error) {
        if (error) {
            [RNFirebaseFirestore promiseRejectException:reject error:error];
        } else {
            NSDictionary *data = [RNFirebaseFirestoreDocumentReference snapshotToDictionary:snapshot];
            resolve(data);
        }
    }];
}

- (void)set:(NSDictionary *) data
    options:(NSDictionary *) options
   resolver:(RCTPromiseResolveBlock) resolve
   rejecter:(RCTPromiseRejectBlock) reject {
    if (options && options[@"merge"]) {
        [_ref setData:data options:[FIRSetOptions merge] completion:^(NSError * _Nullable error) {
            [RNFirebaseFirestoreDocumentReference handleWriteResponse:error resolver:resolve rejecter:reject];
        }];
    } else {
        [_ref setData:data completion:^(NSError * _Nullable error) {
            [RNFirebaseFirestoreDocumentReference handleWriteResponse:error resolver:resolve rejecter:reject];
        }];
    }
}

- (void)update:(NSDictionary *) data
      resolver:(RCTPromiseResolveBlock) resolve
      rejecter:(RCTPromiseRejectBlock) reject {
    [_ref updateData:data completion:^(NSError * _Nullable error) {
        [RNFirebaseFirestoreDocumentReference handleWriteResponse:error resolver:resolve rejecter:reject];
    }];
}

+ (void)handleWriteResponse:(NSError *) error
                   resolver:(RCTPromiseResolveBlock) resolve
                   rejecter:(RCTPromiseRejectBlock) reject {
    if (error) {
        [RNFirebaseFirestore promiseRejectException:reject error:error];
    } else {
        // Missing fields from web SDK
        // writeTime
        resolve(@{});
    }
}

+ (NSDictionary *)snapshotToDictionary:(FIRDocumentSnapshot *)documentSnapshot {
    NSMutableDictionary *snapshot = [[NSMutableDictionary alloc] init];
    [snapshot setValue:documentSnapshot.reference.path forKey:@"path"];
    if (documentSnapshot.exists) {
        [snapshot setValue:documentSnapshot.data forKey:@"data"];
    }
    // Missing fields from web SDK
    // createTime
    // readTime
    // updateTime
    
    return snapshot;
}

#endif

@end


