#ifndef RNFirebaseFunctions_h
#define RNFirebaseFunctions_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseFunctions/FIRFunctions.h>)
#import <React/RCTBridgeModule.h>

@interface RNFirebaseFunctions : NSObject <RCTBridgeModule> {
    
}

@end

#else
@interface RNFirebaseFunctions : NSObject
@end
#endif

#endif

