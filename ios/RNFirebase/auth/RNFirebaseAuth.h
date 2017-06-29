#ifndef RNFirebaseAuth_h
#define RNFirebaseAuth_h

#import <React/RCTBridgeModule.h>

#if __has_include(<FirebaseAuth/FIRAuth.h>)
#import "Firebase.h"
#import <React/RCTEventEmitter.h>

@interface RNFirebaseAuth : RCTEventEmitter <RCTBridgeModule> {
    FIRAuthStateDidChangeListenerHandle authListenerHandle;
    NSMutableDictionary *authStateHandlers;
}

@end

#else
@interface RNFirebaseAuth : NSObject <RCTBridgeModule> {
}
@end
#endif

#endif
