#ifndef RNFirebaseDatabaseReference_h
#define RNFirebaseDatabaseReference_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)
#import "RNFirebaseEvents.h"
#import <React/RCTEventEmitter.h>
#import "Firebase.h"

@interface RNFirebaseDatabaseReference : NSObject
@property RCTEventEmitter *emitter;
@property FIRDatabaseQuery *query;
@property NSNumber *refId;
@property NSString *path;
@property NSMutableDictionary *listeners;

- (id)initWithPathAndModifiers:(RCTEventEmitter *)emitter database:(FIRDatabase *)database refId:(NSNumber *)refId path:(NSString *)path modifiers:(NSArray *)modifiers;
- (void)addEventHandler:(NSNumber *)listenerId eventName:(NSString *)eventName;
- (void)addSingleEventHandler:(NSString *)eventName callback:(RCTResponseSenderBlock)callback;
- (void)removeEventHandler:(NSNumber *)listenerId eventName:(NSString *)eventName;
- (BOOL)hasListeners;
+ (NSDictionary *)snapshotToDict:(FIRDataSnapshot *)snapshot;
@end

#else
#import <Foundation/Foundation.h>

@interface RNFirebaseDatabaseReference : NSObject
@end
#endif

#endif
