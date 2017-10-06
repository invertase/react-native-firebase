#ifndef RNFirebaseFirestoreDocumentReference_h
#define RNFirebaseFirestoreDocumentReference_h

#import <Foundation/Foundation.h>

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)

#import <FirebaseFirestore/FirebaseFirestore.h>
#import <React/RCTEventEmitter.h>
#import "RNFirebaseEvents.h"
#import "RNFirebaseFirestore.h"

@interface RNFirebaseFirestoreDocumentReference : NSObject
@property RCTEventEmitter *emitter;
@property NSString *app;
@property NSString *path;
@property FIRDocumentReference *ref;

- (id)initWithPath:(RCTEventEmitter *)emitter app:(NSString *)app path:(NSString *)path;
- (void)collections:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)create:(NSDictionary *)data resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)delete:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)get:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
+ (void)offSnapshot:(NSString *)listenerId;
- (void)onSnapshot:(NSString *)listenerId docListenOptions:(NSDictionary *) docListenOptions;
- (void)set:(NSDictionary *)data options:(NSDictionary *)options resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)update:(NSDictionary *)data resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (BOOL)hasListeners;
+ (NSDictionary *)snapshotToDictionary:(FIRDocumentSnapshot *)documentSnapshot;
@end

#else

@interface RNFirebaseFirestoreDocumentReference : NSObject
@end
#endif

#endif
