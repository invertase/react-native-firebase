/**
 * Host-only stub for macOS XCTest (IosTest-AD-1). Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

#ifndef RCT_DEBUG
#define RCT_DEBUG 0
#endif

#ifndef RCT_DYNAMIC
#define RCT_DYNAMIC
#endif

#ifndef RCTLogConvertError
#define RCTLogConvertError(json, type) \
  do {                                 \
  } while (0)
#endif

#define RCT_CUSTOM_CONVERTER(type, name, code) \
  +(type)name : (id)json RCT_DYNAMIC {         \
    return code;                               \
  }

@interface RCTConvert : NSObject
+ (NSString *)NSString:(id)json;
+ (NSDictionary *)NSDictionary:(id)json;
@end
