/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBApp/RNFBRCTEventEmitter.h"

@implementation RNFBRCTEventEmitter

static NSString *sLastEventName;
static id sLastEventBody;

+ (instancetype)shared {
  static RNFBRCTEventEmitter *shared;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    shared = [[RNFBRCTEventEmitter alloc] init];
  });
  return shared;
}

- (void)sendEventWithName:(NSString *)name body:(id)body {
  sLastEventName = [name copy];
  sLastEventBody = body;
}

+ (NSString *)lastEventName {
  return sLastEventName;
}
+ (void)setLastEventName:(NSString *)lastEventName {
  sLastEventName = [lastEventName copy];
}
+ (id)lastEventBody {
  return sLastEventBody;
}
+ (void)setLastEventBody:(id)lastEventBody {
  sLastEventBody = lastEventBody;
}
+ (void)resetTestState {
  sLastEventName = nil;
  sLastEventBody = nil;
}

@end
