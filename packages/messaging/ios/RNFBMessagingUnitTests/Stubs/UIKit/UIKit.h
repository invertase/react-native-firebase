/**
 * Host-test stand-in for the UIKit symbols referenced by the messaging iOS sources. The unit
 * project runs on a macOS destination (IosTest-AD-1), which has no UIKit.
 */

#import <Foundation/Foundation.h>

@class UIWindow;
@class UIScene;

@protocol UIApplicationDelegate <NSObject>
@optional
@property(nonatomic, strong) UIWindow *window;
@end

typedef NS_ENUM(NSInteger, UIApplicationState) {
  UIApplicationStateActive,
  UIApplicationStateInactive,
  UIApplicationStateBackground,
};

typedef NS_ENUM(NSUInteger, UIBackgroundFetchResult) {
  UIBackgroundFetchResultNewData,
  UIBackgroundFetchResultNoData,
  UIBackgroundFetchResultFailed,
};

typedef NSUInteger UIBackgroundTaskIdentifier;
static const UIBackgroundTaskIdentifier UIBackgroundTaskInvalid = 0;

static NSString *const UIApplicationLaunchOptionsRemoteNotificationKey =
    @"UIApplicationLaunchOptionsRemoteNotificationKey";

@interface UIApplication : NSObject
+ (UIApplication *)sharedApplication;
@property(nonatomic, weak) id<UIApplicationDelegate> delegate;
@property(nonatomic, assign) UIApplicationState applicationState;
@property(nonatomic, copy) NSSet<UIScene *> *connectedScenes;
@property(nonatomic, assign, getter=isRegisteredForRemoteNotifications)
    BOOL registeredForRemoteNotifications;
@property(nonatomic, assign) NSUInteger unregisterForRemoteNotificationsCallCountForTesting;
- (void)registerForRemoteNotifications;
- (void)unregisterForRemoteNotifications;
- (void)endBackgroundTask:(UIBackgroundTaskIdentifier)identifier;
- (void)resetForTesting;
@end

static NSString *const UIApplicationDidFinishLaunchingNotification =
    @"UIApplicationDidFinishLaunchingNotification";
static NSString *const UIApplicationWillEnterForegroundNotification =
    @"UIApplicationWillEnterForegroundNotification";

@interface UIView : NSObject
@end

@interface UIViewController : NSObject
@property(nonatomic, strong) UIView *viewIfLoaded;
@property(nonatomic, copy) NSArray<UIViewController *> *childViewControllers;
@property(nonatomic, strong) UIViewController *presentedViewController;
@end

@interface UIWindow : UIView
@property(nonatomic, strong) UIViewController *rootViewController;
@end

@interface UIScene : NSObject
@end

@interface UIWindowScene : UIScene
@property(nonatomic, copy) NSArray<UIWindow *> *windows;
@end
