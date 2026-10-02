/**
 * Host-test stand-in for React's RCTConvert (`BOOL:` only).
 */

#import <Foundation/Foundation.h>

@interface RCTConvert : NSObject
+ (BOOL)BOOL:(id)json;
@end
