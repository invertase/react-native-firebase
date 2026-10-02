/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Foundation/Foundation.h>

@interface RNFBPreferences : NSObject
+ (instancetype)shared;
- (void)setBooleanValue:(NSString *)key boolValue:(BOOL)boolValue;
- (void)setIntegerValue:(NSString *)key integerValue:(NSInteger)integerValue;
- (void)setStringValue:(NSString *)key stringValue:(NSString *)stringValue;
@property(nonatomic, strong, readonly) NSMutableDictionary *store;
+ (void)resetTestState;
@end
