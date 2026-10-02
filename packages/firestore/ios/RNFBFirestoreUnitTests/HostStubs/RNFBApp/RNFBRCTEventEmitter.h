/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

@interface RNFBRCTEventEmitter : NSObject
+ (instancetype)shared;
- (void)sendEventWithName:(NSString *)name body:(id)body;
@property(class, nonatomic, copy, nullable) NSString *lastEventName;
@property(class, nonatomic, copy, nullable) id lastEventBody;
+ (void)resetTestState;
@end
