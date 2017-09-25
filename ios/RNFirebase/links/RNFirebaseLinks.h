#ifndef RNFirebaseLinks_h
#define RNFirebaseLinks_h
#import <Foundation/Foundation.h>


#if __has_include(<FirebaseDynamicLinks/FIRDynamicLinks.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseLinks : RCTEventEmitter<RCTBridgeModule> {

}
+ (void)sendDynamicLink:(nonnull NSURL *)link;
@end

#else
@interface RNFirebaseLinks : NSObject
@end
#endif

#endif
