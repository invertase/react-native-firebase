#ifndef RNFirebaseDatabase_h
#define RNFirebaseDatabase_h

#import "Firebase.h"
#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"

@interface RNFirebaseDatabase : RCTEventEmitter <RCTBridgeModule> {

}

@property NSMutableDictionary *dbReferences;
@property NSMutableDictionary *transactions;
@property dispatch_queue_t transactionQueue;

@end

#endif
