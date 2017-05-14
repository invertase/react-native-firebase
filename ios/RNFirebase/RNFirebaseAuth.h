#ifndef RNFirebaseAuth_h
#define RNFirebaseAuth_h

#import "Firebase.h"
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

@interface RNFirebaseAuth : RCTEventEmitter <RCTBridgeModule> {
    FIRAuthStateDidChangeListenerHandle authListenerHandle;
    Boolean listening;
}

@end

#endif
