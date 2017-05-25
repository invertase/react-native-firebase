#ifndef RNFirebaseDatabase_h
#define RNFirebaseDatabase_h

#if __has_include(<React/RCTEventEmitter.h>)
#import <React/RCTEventEmitter.h>
#else // Compatibility for RN version < 0.40
#import "RCTEventEmitter.h"
#endif
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else // Compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#endif

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)
#import "Firebase.h"

@interface RNFirebaseDatabase : RCTEventEmitter <RCTBridgeModule> {}
@property NSMutableDictionary *dbReferences;
@property NSMutableDictionary *transactions;
@property dispatch_queue_t transactionQueue;
@end

#else
@interface RNFirebaseDatabase : RCTEventEmitter <RCTBridgeModule> {}
@end
#endif

#endif
