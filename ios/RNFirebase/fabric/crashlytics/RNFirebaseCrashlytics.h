#ifndef RNFirebaseCrashlytics_h
#define RNFirebaseCrashlytics_h
#import <Foundation/Foundation.h>

#if __has_include(<Crashlytics/Crashlytics/Crashlytics.h>)
#import <React/RCTBridgeModule.h>

@interface RNFirebaseCrashlytics : NSObject <RCTBridgeModule> {

}

@end

#else
@interface RNFirebaseCrashlytics : NSObject
@end
#endif

#endif
