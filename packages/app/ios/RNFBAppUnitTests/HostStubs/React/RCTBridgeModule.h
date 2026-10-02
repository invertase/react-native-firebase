/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

typedef void (^RCTPromiseResolveBlock)(id result);
typedef void (^RCTPromiseRejectBlock)(NSString *code, NSString *message, NSError *error);

@protocol RCTBridgeModule <NSObject>
@end

/**
 * Real macro also registers the class with the bridge in `+load`. Host tests only need
 * the module name the shipped TurboModule shells export.
 */
#define RCT_EXPORT_MODULE(js_name) \
  +(NSString *)moduleName {        \
    return @ #js_name;             \
  }
