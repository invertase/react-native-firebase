#ifndef RNFirebase_h
#define RNFirebase_h

#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTEventEmitter.h>

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
