/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <RNFBApp/RNFBRCTEventEmitter.h>

@interface RNFBRCTEventEmitter ()
@property(nonatomic, strong, readwrite) NSMutableArray<NSDictionary *> *sentEventsForTesting;
@end

@implementation RNFBRCTEventEmitter

+ (RNFBRCTEventEmitter *)shared {
  static RNFBRCTEventEmitter *shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    shared = [[RNFBRCTEventEmitter alloc] init];
    shared.sentEventsForTesting = [NSMutableArray array];
  });
  return shared;
}

- (void)sendEventWithName:(NSString *)eventName body:(id)body {
  [self.sentEventsForTesting addObject:@{
    @"name" : eventName ?: @"",
    @"body" : body ?: [NSNull null],
  }];
}

- (void)resetForTesting {
  [self.sentEventsForTesting removeAllObjects];
}

@end
