#ifndef RNFirebaseCrashlytics_h
#define RNFirebaseCrashlytics_h
#import <Foundation/Foundation.h>

    #if __has_include(<Crashlytics/Crashlytics/Crashlytics.h>)
        #define HAS_CRASHLYTICS 1
    #else
        #if __has_include(<Crashlytics/Crashlytics.h>)
        #define HAS_CRASHLYTICS 2
        #endif
    #endif

    #ifdef HAS_CRASHLYTICS
        #import <React/RCTBridgeModule.h>

        @interface RNFirebaseCrashlytics : NSObject <RCTBridgeModule> {

        }

        @end
    #else
        @interface RNFirebaseCrashlytics : NSObject
        @end
    #endif

#endif
