#ifndef RNFirebaseDatabaseReference_h
#define RNFirebaseDatabaseReference_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)
#import <FirebaseDatabase/FIRDatabase.h>
#import "RNFirebaseDatabase.h"
#import "RNFirebaseEvents.h"
#import <React/RCTEventEmitter.h>

@interface RNFirebaseDatabaseReference : NSObject
@property RCTEventEmitter *emitter;
@property FIRDatabaseQuery *query;
@property NSString *app;
@property NSNumber *refId;
@property NSString *path;
@property NSMutableDictionary *listeners;

- (id)initWithPathAndModifiers:(RCTEventEmitter *)emitter app:(NSString *)app refId:(NSNumber *)refId refPath:(NSString *)refPath modifiers:(NSArray *)modifiers;
- (void)addEventHandler:(NSNumber *)listenerId eventName:(NSString *)eventName;
- (void)addSingleEventHandler:(NSString *)eventName resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)removeEventHandler:(NSNumber *)listenerId eventName:(NSString *)eventName;
- (BOOL)hasListeners;
+ (NSDictionary *)snapshotToDict:(FIRDataSnapshot *)snapshot;
@end

#else

@interface RNFirebaseDatabaseReference : NSObject
@end
#endif

#endif
