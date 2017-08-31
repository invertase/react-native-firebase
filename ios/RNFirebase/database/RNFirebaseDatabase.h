#ifndef RNFirebaseDatabase_h
#define RNFirebaseDatabase_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseDatabase/FIRDatabase.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseDatabase : RCTEventEmitter<RCTBridgeModule> {}
@property NSMutableDictionary *dbReferences;
@property NSMutableDictionary *transactions;
@property dispatch_queue_t transactionQueue;
@end

#else
@interface RNFirebaseDatabase : NSObject
@end
#endif

#endif
