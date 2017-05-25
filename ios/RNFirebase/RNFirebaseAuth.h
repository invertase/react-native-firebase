#ifndef RNFirebaseAuth_h
#define RNFirebaseAuth_h

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

#if __has_include(<FirebaseAuth/FIRAuth.h>)
#import "Firebase.h"

@interface RNFirebaseAuth : RCTEventEmitter <RCTBridgeModule> {
    FIRAuthStateDidChangeListenerHandle authListenerHandle;
    Boolean listening;
}

@end

#else
@interface RNFirebaseAuth : RCTEventEmitter <RCTBridgeModule> {
}
@end
#endif

#endif
