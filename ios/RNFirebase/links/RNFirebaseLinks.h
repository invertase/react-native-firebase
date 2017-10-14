#ifndef RNFirebaseLinks_h
#define RNFirebaseLinks_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseDynamicLinks/FirebaseDynamicLinks.h>)
#import <FirebaseDynamicLinks/FirebaseDynamicLinks.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseLinks : RCTEventEmitter<RCTBridgeModule> {
    
}
+ (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options;

+ (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation;

+ (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray *))restorationHandler;

@end

#else
@interface RNFirebaseLinks : NSObject
@end
#endif

#endif
