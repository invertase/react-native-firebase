/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>

#import "RNFBMessaging+NSNotificationCenter.h"

/// Stands in for RCTRootView / RCTSurfaceHostingProxyRootView: a view with `appProperties`.
@interface RNFBMessagingFakeRootView : UIView
@property(nonatomic, copy) NSDictionary *appProperties;
@property(nonatomic, assign) NSUInteger setAppPropertiesCallCount;
@end

@implementation RNFBMessagingFakeRootView

- (void)setAppProperties:(NSDictionary *)appProperties {
  _appProperties = [appProperties copy];
  self.setAppPropertiesCallCount += 1;
}

@end

@interface RNFBMessagingFakeAppDelegateWithWindow : NSObject <UIApplicationDelegate>
@property(nonatomic, strong) UIWindow *window;
@end

@implementation RNFBMessagingFakeAppDelegateWithWindow
@end

@interface RNFBMessagingFakeAppDelegateWithoutWindow : NSObject <UIApplicationDelegate>
@end

@implementation RNFBMessagingFakeAppDelegateWithoutWindow
@end

@interface RNFBMessagingHeadlessRootViewSyncTests : XCTestCase
// UIApplication holds its delegate weakly
@property(nonatomic, strong) id<UIApplicationDelegate> appDelegate;
@end

@implementation RNFBMessagingHeadlessRootViewSyncTests

- (void)setUp {
  [super setUp];
  [[UIApplication sharedApplication] resetForTesting];
  [RNFBMessagingNSNotificationCenter sharedInstance].isHeadless = NO;
}

- (void)tearDown {
  self.appDelegate = nil;
  [[UIApplication sharedApplication] resetForTesting];
  [RNFBMessagingNSNotificationCenter sharedInstance].isHeadless = NO;
  [super tearDown];
}

- (RNFBMessagingFakeRootView *)rootViewWithAppProperties:(NSDictionary *)appProperties {
  RNFBMessagingFakeRootView *view = [[RNFBMessagingFakeRootView alloc] init];
  view.appProperties = appProperties;
  view.setAppPropertiesCallCount = 0;
  return view;
}

- (UIViewController *)controllerWithView:(UIView *)view {
  UIViewController *controller = [[UIViewController alloc] init];
  controller.viewIfLoaded = view;
  return controller;
}

- (UIWindow *)windowWithRootViewController:(UIViewController *)controller {
  UIWindow *window = [[UIWindow alloc] init];
  window.rootViewController = controller;
  return window;
}

- (void)installAppDelegateWindowWithRootViewController:(UIViewController *)controller {
  RNFBMessagingFakeAppDelegateWithWindow *delegate =
      [[RNFBMessagingFakeAppDelegateWithWindow alloc] init];
  delegate.window = [self windowWithRootViewController:controller];
  self.appDelegate = delegate;
  [UIApplication sharedApplication].delegate = delegate;
}

- (void)syncWithIsHeadless:(BOOL)isHeadless {
  RNFBMessagingNSNotificationCenter *center = [RNFBMessagingNSNotificationCenter sharedInstance];
  center.isHeadless = isHeadless;
  [center syncRootViewHeadlessProperty];
}

#pragma mark - value handling

- (void)testWrongValueOnRootViewControllerView_isFlippedAndKeepsOtherProps {
  RNFBMessagingFakeRootView *view =
      [self rootViewWithAppProperties:@{@"isHeadless" : @YES, @"other" : @"kept"}];
  [self installAppDelegateWindowWithRootViewController:[self controllerWithView:view]];

  [self syncWithIsHeadless:NO];

  XCTAssertEqualObjects(view.appProperties, (@{@"isHeadless" : @NO, @"other" : @"kept"}));
  XCTAssertEqual(view.setAppPropertiesCallCount, 1u);
}

- (void)testWrongValue_isFlippedToHeadless {
  RNFBMessagingFakeRootView *view = [self rootViewWithAppProperties:@{@"isHeadless" : @NO}];
  [self installAppDelegateWindowWithRootViewController:[self controllerWithView:view]];

  [self syncWithIsHeadless:YES];

  XCTAssertEqualObjects(view.appProperties[@"isHeadless"], @YES);
  XCTAssertEqual(view.setAppPropertiesCallCount, 1u);
}

- (void)testAppPropertiesWithoutIsHeadlessKey_areLeftAlone {
  RNFBMessagingFakeRootView *view = [self rootViewWithAppProperties:@{@"other" : @"kept"}];
  [self installAppDelegateWindowWithRootViewController:[self controllerWithView:view]];

  [self syncWithIsHeadless:YES];

  XCTAssertEqualObjects(view.appProperties, (@{@"other" : @"kept"}));
  XCTAssertEqual(view.setAppPropertiesCallCount, 0u);
}

- (void)testNilAppProperties_areLeftAlone {
  RNFBMessagingFakeRootView *view = [self rootViewWithAppProperties:nil];
  [self installAppDelegateWindowWithRootViewController:[self controllerWithView:view]];

  [self syncWithIsHeadless:YES];

  XCTAssertNil(view.appProperties);
  XCTAssertEqual(view.setAppPropertiesCallCount, 0u);
}

- (void)testMatchingValue_isNotRewritten {
  RNFBMessagingFakeRootView *view = [self rootViewWithAppProperties:@{@"isHeadless" : @NO}];
  [self installAppDelegateWindowWithRootViewController:[self controllerWithView:view]];

  [self syncWithIsHeadless:NO];

  XCTAssertEqualObjects(view.appProperties[@"isHeadless"], @NO);
  XCTAssertEqual(view.setAppPropertiesCallCount, 0u);
}

#pragma mark - view controller hierarchy

- (void)testWrongValueUnderChildViewController_isFlipped {
  RNFBMessagingFakeRootView *view = [self rootViewWithAppProperties:@{@"isHeadless" : @YES}];
  UIViewController *container = [self controllerWithView:[[UIView alloc] init]];
  UIViewController *intermediate = [self controllerWithView:[[UIView alloc] init]];
  intermediate.childViewControllers = @[ [self controllerWithView:view] ];
  container.childViewControllers = @[ intermediate ];
  [self installAppDelegateWindowWithRootViewController:container];

  [self syncWithIsHeadless:NO];

  XCTAssertEqualObjects(view.appProperties[@"isHeadless"], @NO);
  XCTAssertEqual(view.setAppPropertiesCallCount, 1u);
}

- (void)testWrongValueUnderPresentedViewController_isFlipped {
  RNFBMessagingFakeRootView *view = [self rootViewWithAppProperties:@{@"isHeadless" : @YES}];
  UIViewController *root = [self controllerWithView:[[UIView alloc] init]];
  root.presentedViewController = [self controllerWithView:view];
  [self installAppDelegateWindowWithRootViewController:root];

  [self syncWithIsHeadless:NO];

  XCTAssertEqualObjects(view.appProperties[@"isHeadless"], @NO);
  XCTAssertEqual(view.setAppPropertiesCallCount, 1u);
}

- (void)testViewWithoutAppPropertiesAndUnloadedView_areSkipped {
  UIViewController *root = [self controllerWithView:[[UIView alloc] init]];
  root.childViewControllers = @[ [[UIViewController alloc] init] ];
  [self installAppDelegateWindowWithRootViewController:root];

  XCTAssertNoThrow([self syncWithIsHeadless:NO]);
}

#pragma mark - window lookup

- (void)testWindowSceneWindow_isUpdatedWhenDelegateHasNoWindowSelector {
  RNFBMessagingFakeRootView *view = [self rootViewWithAppProperties:@{@"isHeadless" : @YES}];
  self.appDelegate = [[RNFBMessagingFakeAppDelegateWithoutWindow alloc] init];
  [UIApplication sharedApplication].delegate = self.appDelegate;
  UIWindowScene *windowScene = [[UIWindowScene alloc] init];
  windowScene.windows = @[
    [self windowWithRootViewController:nil],
    [self windowWithRootViewController:[self controllerWithView:view]],
  ];
  [UIApplication sharedApplication].connectedScenes =
      [NSSet setWithObjects:[[UIScene alloc] init], windowScene, nil];

  [self syncWithIsHeadless:NO];

  XCTAssertEqualObjects(view.appProperties[@"isHeadless"], @NO);
  XCTAssertEqual(view.setAppPropertiesCallCount, 1u);
}

- (void)testDelegateWindowAndSceneWindow_areBothUpdated {
  RNFBMessagingFakeRootView *delegateView =
      [self rootViewWithAppProperties:@{@"isHeadless" : @YES}];
  RNFBMessagingFakeRootView *sceneView = [self rootViewWithAppProperties:@{@"isHeadless" : @YES}];
  [self installAppDelegateWindowWithRootViewController:[self controllerWithView:delegateView]];
  UIWindowScene *windowScene = [[UIWindowScene alloc] init];
  windowScene.windows =
      @[ [self windowWithRootViewController:[self controllerWithView:sceneView]] ];
  [UIApplication sharedApplication].connectedScenes = [NSSet setWithObject:windowScene];

  [self syncWithIsHeadless:NO];

  XCTAssertEqualObjects(delegateView.appProperties[@"isHeadless"], @NO);
  XCTAssertEqualObjects(sceneView.appProperties[@"isHeadless"], @NO);
}

- (void)testNoDelegateAndNoScenes_doesNothing {
  XCTAssertNoThrow([self syncWithIsHeadless:YES]);
}

@end
