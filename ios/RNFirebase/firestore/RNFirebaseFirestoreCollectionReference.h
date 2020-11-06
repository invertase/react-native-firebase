#ifndef RNFirebaseFirestoreCollectionReference_h
#define RNFirebaseFirestoreCollectionReference_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)

#import <FirebaseFirestore/FirebaseFirestore.h>
#import <React/RCTEventEmitter.h>
#import "RNFirebaseEvents.h"
#import "RNFirebaseFirestore.h"
#import "RNFirebaseFirestoreDocumentReference.h"
#import "RNFirebaseUtil.h"

@interface RNFirebaseFirestoreCollectionReference : NSObject
@property RCTEventEmitter *emitter;
@property NSString *appDisplayName;
@property NSString *path;
@property NSArray *filters;
@property NSArray *orders;
@property NSDictionary *options;
@property FIRQuery *query;

- (id)initWithPathAndModifiers:(RCTEventEmitter *)emitter appDisplayName:(NSString *)appDisplayName path:(NSString *)path filters:(NSArray *)filters orders:(NSArray *)orders options:(NSDictionary *)options;
- (void)get:(NSDictionary *)getOptions resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
+ (void)offSnapshot:(NSString *)listenerId;
- (void)onSnapshot:(NSString *)listenerId queryListenOptions:(NSDictionary *) queryListenOptions;
+ (NSDictionary *)snapshotToDictionary:(FIRQuerySnapshot *)querySnapshot;
@end

#else

@interface RNFirebaseFirestoreCollectionReference : NSObject
@end
#endif

#endif
