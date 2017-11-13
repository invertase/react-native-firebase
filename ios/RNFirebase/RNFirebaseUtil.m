#import "RNFirebaseUtil.h"

@implementation RNFirebaseUtil

+ (void)sendJSEvent:(RCTEventEmitter *)emitter name:(NSString *)name body:(NSDictionary *)body {
    @try {
        // TODO: Temporary fix for https://github.com/invertase/react-native-firebase/issues/233
        // until a better solution comes around
        if (emitter.bridge) {
            [emitter sendEventWithName:name body:body];
        }
    } @catch (NSException *error) {
        NSLog(@"An error occurred in sendJSEvent: %@", [error debugDescription]);
    }
}

+ (void)sendJSEventWithAppName:(RCTEventEmitter *)emitter appName:(NSString *)appName name:(NSString *)name body:(NSDictionary *)body {
    // Add the appName to the body
    NSMutableDictionary *newBody = [body mutableCopy];
    newBody[@"appName"] = appName;
    
    [RNFirebaseUtil sendJSEvent:emitter name:name body:newBody];
}

+ (UIViewController*)topViewController {
    return [self topViewControllerWithRootViewController:[UIApplication sharedApplication].keyWindow.rootViewController];
}

+ (UIViewController*)topViewControllerWithRootViewController:(UIViewController*)viewController {
    if ([viewController isKindOfClass:[UITabBarController class]]) {
        UITabBarController* tabBarController = (UITabBarController*)viewController;
        return [self topViewControllerWithRootViewController:tabBarController.selectedViewController];
    } else if ([viewController isKindOfClass:[UINavigationController class]]) {
        UINavigationController* navContObj = (UINavigationController*)viewController;
        return [self topViewControllerWithRootViewController:navContObj.visibleViewController];
    } else if (viewController.presentedViewController && !viewController.presentedViewController.isBeingDismissed) {
        UIViewController* presentedViewController = viewController.presentedViewController;
        return [self topViewControllerWithRootViewController:presentedViewController];
    }
    else {
        for (UIView *view in [viewController.view subviews])
        {
            id subViewController = [view nextResponder];
            if ( subViewController && [subViewController isKindOfClass:[UIViewController class]])
            {
                if ([(UIViewController *)subViewController presentedViewController]  && ![subViewController presentedViewController].isBeingDismissed) {
                    return [self topViewControllerWithRootViewController:[(UIViewController *)subViewController presentedViewController]];
                }
            }
        }
        return viewController;
    }
}

@end
