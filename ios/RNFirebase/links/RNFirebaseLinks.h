#ifndef RNFirebaseLinks_h
#define RNFirebaseLinks_h
#import <Foundation/Foundation.h>


#if __has_include(<FirebaseDynamicLinks/FIRDynamicLinks.h>)
#import <React/RCTBridgeModule.h>

@interface RNFirebaseLinks : NSObject<RCTBridgeModule> {

}

@end

#else
@interface RNFirebaseLinks : NSObject
@end
#endif

#endif
