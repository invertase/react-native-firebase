#ifndef RNFirebaseDatabaseReference_h
#define RNFirebaseDatabaseReference_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)
#import <FirebaseDatabase/FIRDatabase.h>
#import "RNFirebaseDatabase.h"
#import "RNFirebaseEvents.h"
#import "RNFirebaseUtil.h"
#import <React/RCTEventEmitter.h>

@interface RNFirebaseDatabaseReference : NSObject
@property RCTEventEmitter *emitter;
@property FIRDatabaseQuery *query;
@property NSString *appDisplayName;
@property NSString *dbURL;
@property NSString *key;
@property NSString *path;
@property NSMutableDictionary *listeners;

- (id)initWithPathAndModifiers:(RCTEventEmitter *)emitter appDisplayName:(NSString *)appDisplayName dbURL:(NSString *)dbURL key:(NSString *)key refPath:(NSString *)refPath modifiers:(NSArray *)modifiers;
- (void)on:(NSString *) eventName registration:(NSDictionary *) registration;
- (void)once:(NSString *) eventType resolver:(RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject;
- (void)removeEventListener:(NSString *)eventRegistrationKey;
- (BOOL)hasListeners;
+ (NSDictionary *)snapshotToDict:(FIRDataSnapshot *)dataSnapshot;
@end

#else

@interface RNFirebaseDatabaseReference : NSObject
@end
#endif

#endif
