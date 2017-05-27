#ifndef RNFirebaseDatabase_h
#define RNFirebaseDatabase_h

#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

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
