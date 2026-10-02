/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import "RNFBApp/RNFBPreferences.h"

@implementation RNFBPreferences {
  NSMutableDictionary *_store;
}

+ (instancetype)shared {
  static RNFBPreferences *shared;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    shared = [[RNFBPreferences alloc] init];
  });
  return shared;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _store = [NSMutableDictionary new];
  }
  return self;
}

- (NSMutableDictionary *)store {
  return _store;
}

- (void)setBooleanValue:(NSString *)key boolValue:(BOOL)boolValue {
  _store[key] = @(boolValue);
}
- (void)setIntegerValue:(NSString *)key integerValue:(NSInteger)integerValue {
  _store[key] = @(integerValue);
}
- (void)setStringValue:(NSString *)key stringValue:(NSString *)stringValue {
  _store[key] = [stringValue copy];
}

+ (void)resetTestState {
  [[[self shared] store] removeAllObjects];
}

@end
