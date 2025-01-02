// This AppDelegate template is modified to have RCTBridge
// created in some non-standard way or not created at all.
// This should trigger the fallback regex in iOS AppDelegate Expo plugin.

// some parts omitted to be short

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTConvert.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

// The generated code should appear above ^^^
#if defined(FB_SONARKIT_ENABLED) && __has_include(<FlipperKit/FlipperClient.h>)
  InitializeFlipper(application);
#endif
  
  // the line below is malfolmed not to be matched by the Expo plugin regex
  // RCTBridge* briddge = [RCTBridge new];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:briddge moduleName:@"main" initialProperties:nil];
  id rootViewBackgroundColor = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"RCTRootViewBackgroundColor"];
  if (rootViewBackgroundColor != nil) {
    rootView.backgroundColor = [RCTConvert UIColor:rootViewBackgroundColor];
  } else {
    rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  [super application:application didFinishLaunchingWithOptions:launchOptions];

  return YES;
 }

@end
