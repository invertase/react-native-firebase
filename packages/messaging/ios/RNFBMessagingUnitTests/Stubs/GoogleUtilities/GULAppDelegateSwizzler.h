/**
 * Host-test stand-in for GoogleUtilities' GULAppDelegateSwizzler (only `sharedApplication`).
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface GULAppDelegateSwizzler : NSObject
+ (UIApplication *)sharedApplication;
@end
