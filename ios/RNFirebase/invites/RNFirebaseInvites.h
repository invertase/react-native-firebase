#ifndef RNFirebaseInvites_h
#define RNFirebaseInvites_h
#import <Foundation/Foundation.h>

#if __has_include(<FirebaseInvites/FirebaseInvites.h>)
#import <FirebaseInvites/FirebaseInvites.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseInvites : RCTEventEmitter<RCTBridgeModule, FIRInviteDelegate>

+ (_Nonnull instancetype)instance;

@property _Nullable RCTPromiseRejectBlock invitationsRejecter;
@property _Nullable RCTPromiseResolveBlock invitationsResolver;

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options;
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray *))restorationHandler;

@end

#else
@interface RNFirebaseInvites : NSObject
@end
#endif

#endif
