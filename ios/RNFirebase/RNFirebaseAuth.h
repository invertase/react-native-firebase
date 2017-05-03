#ifndef RNFirebaseAuth_h
#define RNFirebaseAuth_h

#import "Firebase.h"
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>

@interface RNFirebaseAuth : RCTEventEmitter <RCTBridgeModule> {
    FIRAuthStateDidChangeListenerHandle authListenerHandle;
    Boolean listening;
}

@end

#endif
