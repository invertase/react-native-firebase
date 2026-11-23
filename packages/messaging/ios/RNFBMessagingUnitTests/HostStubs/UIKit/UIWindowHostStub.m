/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <UIKit/UIKit.h>

@implementation UIView
@end

@implementation UIViewController

- (instancetype)init {
  self = [super init];
  if (self) {
    _childViewControllers = @[];
  }
  return self;
}

@end

@implementation UIWindow
@end

@implementation UIScene
@end

@implementation UIWindowScene

- (instancetype)init {
  self = [super init];
  if (self) {
    _windows = @[];
  }
  return self;
}

@end
