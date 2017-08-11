#ifndef RNFirebaseRemoteConfig_h
#define RNFirebaseRemoteConfig_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseRemoteConfig/FirebaseRemoteConfig.h>)
#import <React/RCTBridgeModule.h>

@interface RNFirebaseRemoteConfig : NSObject <RCTBridgeModule>

@end

#else
@interface RNFirebaseRemoteConfig : NSObject
@end
#endif

#endif
