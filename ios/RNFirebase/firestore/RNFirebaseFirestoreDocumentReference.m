#import "RNFirebaseFirestoreDocumentReference.h"

@implementation RNFirebaseFirestoreDocumentReference

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)

static NSMutableDictionary *_listeners;

- (id)initWithPath:(RCTEventEmitter *)emitter
               app:(NSString *) app
              path:(NSString *) path {
    self = [super init];
    if (self) {
        _emitter = emitter;
        _app = app;
        _path = path;
        _ref = [[RNFirebaseFirestore getFirestoreForApp:_app] documentWithPath:_path];
    }
    // Initialise the static listeners object if required
    if (!_listeners) {
        _listeners = [[NSMutableDictionary alloc] init];
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

- (void)delete:(RCTPromiseResolveBlock) resolve
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

+ (void)offSnapshot:(NSString *) listenerId {
    id<FIRListenerRegistration> listener = _listeners[listenerId];
    if (listener) {
        [_listeners removeObjectForKey:listenerId];
        [listener remove];
    }
}

- (void)onSnapshot:(NSString *) listenerId {
    if (_listeners[listenerId] == nil) {
        id listenerBlock = ^(FIRDocumentSnapshot * _Nullable snapshot, NSError * _Nullable error) {
            if (error) {
                id<FIRListenerRegistration> listener = _listeners[listenerId];
                if (listener) {
                    [_listeners removeObjectForKey:listenerId];
                    [listener remove];
                }
                [self handleDocumentSnapshotError:listenerId error:error];
            } else {
                [self handleDocumentSnapshotEvent:listenerId documentSnapshot:snapshot];
            }
        };

        id<FIRListenerRegistration> listener = [_ref addSnapshotListener:listenerBlock];
        _listeners[listenerId] = listener;
    }
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

- (BOOL)hasListeners {
    return [[_listeners allKeys] count] > 0;
}

+ (void)handleWriteResponse:(NSError *) error
                   resolver:(RCTPromiseResolveBlock) resolve
                   rejecter:(RCTPromiseRejectBlock) reject {
    if (error) {
        [RNFirebaseFirestore promiseRejectException:reject error:error];
    } else {
        resolve(nil);
    }
}

+ (NSDictionary *)snapshotToDictionary:(FIRDocumentSnapshot *)documentSnapshot {
    NSMutableDictionary *snapshot = [[NSMutableDictionary alloc] init];
    [snapshot setValue:documentSnapshot.reference.path forKey:@"path"];
    if (documentSnapshot.exists) {
        [snapshot setValue:documentSnapshot.data forKey:@"data"];
    }
    if (documentSnapshot.metadata) {
        NSMutableDictionary *metadata = [[NSMutableDictionary alloc] init];
        [metadata setValue:@(documentSnapshot.metadata.fromCache) forKey:@"fromCache"];
        [metadata setValue:@(documentSnapshot.metadata.hasPendingWrites) forKey:@"hasPendingWrites"];
        [snapshot setValue:metadata forKey:@"metadata"];
    }
    return snapshot;
}

- (void)handleDocumentSnapshotError:(NSString *)listenerId
                              error:(NSError *)error {
    NSMutableDictionary *event = [[NSMutableDictionary alloc] init];
    [event setValue:_app forKey:@"appName"];
    [event setValue:_path forKey:@"path"];
    [event setValue:listenerId forKey:@"listenerId"];
    [event setValue:[RNFirebaseFirestore getJSError:error] forKey:@"error"];

    [_emitter sendEventWithName:FIRESTORE_DOCUMENT_SYNC_EVENT body:event];
}

- (void)handleDocumentSnapshotEvent:(NSString *)listenerId
                   documentSnapshot:(FIRDocumentSnapshot *)documentSnapshot {
    NSMutableDictionary *event = [[NSMutableDictionary alloc] init];
    [event setValue:_app forKey:@"appName"];
    [event setValue:_path forKey:@"path"];
    [event setValue:listenerId forKey:@"listenerId"];
    [event setValue:[RNFirebaseFirestoreDocumentReference snapshotToDictionary:documentSnapshot] forKey:@"documentSnapshot"];

    [_emitter sendEventWithName:FIRESTORE_DOCUMENT_SYNC_EVENT body:event];
}

#endif

@end
