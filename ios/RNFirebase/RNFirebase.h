#ifndef RNFirebase_h
#define RNFirebase_h

#import <UIKit/UIKit.h>
#if __has_include(<React/RCTEventDispatcher.h>)
#import <React/RCTEventDispatcher.h>
#else // Compatibility for RN version < 0.40
#import "RCTEventDispatcher.h"
#endif
#if __has_include(<React/RCTEventEmitter.h>)
#import <React/RCTEventEmitter.h>
#else // Compatibility for RN version < 0.40
#import "RCTEventEmitter.h"
#endif
#if __has_include(<React/Base/RCTBridgeModule.h>)
#import <React/Base/RCTBridgeModule.h>
#else // Compatibility for RN version < 0.40
#import "RCTBridgeModule.h"
#endif

@interface RNFirebase : RCTEventEmitter <RCTBridgeModule> {
}

// + (void) registerForNotification:(NSString *) typeStr andToken:(NSData *)deviceToken;
+ (void) setup:(UIApplication *) application
withLaunchOptions: (NSDictionary *) launchOptions;

+ (id) sharedInstance;

- (void) debugLog:(NSString *)title
              msg:(NSString *)msg;

- (void) sendJSEvent:(NSString *)title
               props:(NSDictionary *)props;


@property (nonatomic) BOOL debug;
@property (atomic) BOOL configured;
@property (nonatomic, strong) NSDictionary *configuration;

@end

#endif
