#ifndef RNFirebaseDatabase_h
#define RNFirebaseDatabase_h

#import <Foundation/Foundation.h>

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)

#import <FirebaseDatabase/FIRDatabase.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseDatabase : RCTEventEmitter <RCTBridgeModule> {}
@property NSMutableDictionary *dbReferences;
@property NSMutableDictionary *transactions;
@property dispatch_queue_t transactionQueue;

+ (void)handlePromise:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject databaseError:(NSError *)databaseError;

+ (FIRDatabase *)getDatabaseForApp:(NSString *)appDisplayName;
+ (FIRDatabase *)getDatabaseForApp:(NSString *)appDisplayName URL:(NSString *)url;

+ (NSDictionary *)getJSError:(NSError *)nativeError;

+ (NSString *)getMessageWithService:(NSString *)message service:(NSString *)service fullCode:(NSString *)fullCode;

+ (NSString *)getCodeWithService:(NSString *)service code:(NSString *)code;

@end

#else
@interface RNFirebaseDatabase : NSObject
@end
#endif

#endif
