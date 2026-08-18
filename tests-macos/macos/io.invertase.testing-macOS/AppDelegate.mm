#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTConstants.h>

static NSString *const RNFBTestingMetroHost = @"127.0.0.1";

static NSString *RNFBTestingMetroHostPort(void)
{
  return [NSString stringWithFormat:@"%@:%lu", RNFBTestingMetroHost, (unsigned long)RCT_METRO_PORT];
}

#if DEBUG
static void RNFBTestingConfigureMetroHost(void)
{
  RCTBundleURLProvider *settings = [RCTBundleURLProvider sharedSettings];
  [settings setJsLocation:RNFBTestingMetroHostPort()];
  // NYC/babel-istanbul remap needs inline source maps in the dev bundle.
  [settings setInlineSourceMap:YES];
}

static NSURL *RNFBTestingDebugBundleURL(void)
{
  RCTBundleURLProvider *settings = [RCTBundleURLProvider sharedSettings];
  return [RCTBundleURLProvider jsBundleURLForBundleRoot:@"index"
                                           packagerHost:RNFBTestingMetroHostPort()
                                         packagerScheme:settings.packagerScheme ?: @"http"
                                              enableDev:settings.enableDev
                                     enableMinification:settings.enableMinification
                                        inlineSourceMap:YES
                                            modulesOnly:NO
                                              runModule:YES];
}
#endif

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
#if DEBUG
  RNFBTestingConfigureMetroHost();
#endif
  self.moduleName = @"testing";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super applicationDidFinishLaunching:notification];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return RNFBTestingDebugBundleURL();
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return RNFBTestingDebugBundleURL();
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
#ifdef RN_FABRIC_ENABLED
  return true;
#else
  return false;
#endif
}

@end
