#ifndef RNFirebaseUtil_h
#define RNFirebaseUtil_h

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseUtil : NSObject

+ (void)sendJSEvent:(RCTEventEmitter *)emitter name:(NSString *)name body:(NSDictionary *)body;
+ (void)sendJSEventWithAppName:(RCTEventEmitter *)emitter appName:(NSString *)appName name:(NSString *)name body:(NSDictionary *)body;

@end

#endif
