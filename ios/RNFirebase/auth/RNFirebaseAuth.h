#ifndef RNFirebaseAuth_h
#define RNFirebaseAuth_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseAuth/FIRAuth.h>)
#import "Firebase.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseAuth : RCTEventEmitter <RCTBridgeModule> {
    FIRAuthStateDidChangeListenerHandle authListenerHandle;
    Boolean listening;
}

@end

#else
@interface RNFirebaseAuth : NSObject
@end
#endif

#endif
