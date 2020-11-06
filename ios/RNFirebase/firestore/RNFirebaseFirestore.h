#ifndef RNFirebaseFirestore_h
#define RNFirebaseFirestore_h

#import <Foundation/Foundation.h>

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)

#import <FirebaseFirestore/FirebaseFirestore.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseFirestore : RCTEventEmitter <RCTBridgeModule> {}
@property NSMutableDictionary *transactions;

+ (void)promiseRejectException:(RCTPromiseRejectBlock)reject error:(NSError *)error;

+ (FIRFirestore *)getFirestoreForApp:(NSString *)appDisplayName;
+ (NSDictionary *)getJSError:(NSError *)nativeError;

@end

#else
@interface RNFirebaseFirestore : NSObject
@end
#endif

#endif
