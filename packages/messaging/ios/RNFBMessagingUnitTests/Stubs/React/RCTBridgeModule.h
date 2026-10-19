/**
 * Host-test stand-in for React's RCTBridgeModule (promise block types and export macro).
 */

#import <Foundation/Foundation.h>

typedef void (^RCTPromiseResolveBlock)(id result);
typedef void (^RCTPromiseRejectBlock)(NSString *code, NSString *message, NSError *error);

#define RCT_EXPORT_MODULE(...)

@protocol RCTBridgeModule <NSObject>
@end
