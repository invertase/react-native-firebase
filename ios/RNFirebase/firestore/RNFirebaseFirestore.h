#ifndef RNFirebaseFirestore_h
#define RNFirebaseFirestore_h

#import <Foundation/Foundation.h>

#if __has_include(<Firestore/FIRFirestore.h>)

#import <Firestore/FIRFirestore.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseFirestore : RCTEventEmitter <RCTBridgeModule> {}

+ (void)promiseRejectException:(RCTPromiseRejectBlock)reject error:(NSError *)error;

+ (FIRFirestore *)getFirestoreForApp:(NSString *)appName;
+ (NSDictionary *)getJSError:(NSError *)nativeError;

@end

#else
@interface RNFirebaseFirestore : NSObject
@end
#endif

#endif

