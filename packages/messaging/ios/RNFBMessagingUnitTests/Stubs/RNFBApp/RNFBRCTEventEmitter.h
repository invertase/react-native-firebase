/**
 * Host-test stand-in for RNFBApp's RNFBRCTEventEmitter. Records events instead of bridging to JS.
 */

#import <Foundation/Foundation.h>

@interface RNFBRCTEventEmitter : NSObject

+ (RNFBRCTEventEmitter *)shared;

- (void)sendEventWithName:(NSString *)eventName body:(id)body;

#pragma mark Test knobs

/// Each entry is `@{ @"name": eventName, @"body": body }`, in send order.
@property(nonatomic, strong, readonly) NSMutableArray<NSDictionary *> *sentEventsForTesting;
- (void)resetForTesting;

@end
