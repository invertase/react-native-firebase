/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */

#import "FirebaseCore.h"

@implementation FIROptions
@end

@implementation FIRApp {
  BOOL _dataCollectionDefaultEnabled;
}

- (instancetype)initWithName:(NSString *)name options:(FIROptions *)options {
  self = [super init];
  if (self) {
    _name = [name copy];
    _options = options ?: [[FIROptions alloc] init];
    _dataCollectionDefaultEnabled = NO;
  }
  return self;
}

- (void)setDataCollectionDefaultEnabled:(BOOL)enabled {
  _dataCollectionDefaultEnabled = enabled;
}

- (BOOL)isDataCollectionDefaultEnabled {
  return _dataCollectionDefaultEnabled;
}

@end
