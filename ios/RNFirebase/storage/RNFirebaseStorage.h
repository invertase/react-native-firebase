#ifndef RNFirebaseStorage_h
#define RNFirebaseStorage_h

#import <React/RCTBridgeModule.h>

#if __has_include(<FirebaseStorage/FIRStorage.h>)
#import <React/RCTEventEmitter.h>

@interface RNFirebaseStorage : RCTEventEmitter<RCTBridgeModule> {

}

@end

#else
@interface RNFirebaseStorage : NSObject<RCTBridgeModule>
@end
#endif

#endif
