#ifndef RNFirebaseDatabase_h
#define RNFirebaseDatabase_h

#import <React/RCTBridgeModule.h>

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)
#import "Firebase.h"
#import <React/RCTEventEmitter.h>

@interface RNFirebaseDatabase : RCTEventEmitter<RCTBridgeModule> {}
@property NSMutableDictionary *dbReferences;
@property NSMutableDictionary *transactions;
@property dispatch_queue_t transactionQueue;

+ (void)handlePromise:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock) reject databaseError:(NSError *)databaseError;
+ (FIRDatabase *)getDatabaseForApp:(NSString*)appName;
+ (NSString *) getMessageWithService:(NSString *) message service:(NSString *) service fullCode:(NSString *) fullCode;
+ (NSString *) getCodeWithService:(NSString *) service code:(NSString *) code;

@end

#else
@interface RNFirebaseDatabase : NSObject<RCTBridgeModule> {}
@end
#endif

#endif
