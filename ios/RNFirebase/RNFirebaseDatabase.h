#ifndef RNFirebaseDatabase_h
#define RNFirebaseDatabase_h

#import "Firebase.h"
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface RNFirebaseDatabase : RCTEventEmitter <RCTBridgeModule> {

}

@property NSMutableDictionary *dbReferences;
@property NSMutableDictionary *transactions;
@property dispatch_queue_t transactionQueue;

@end

#endif
