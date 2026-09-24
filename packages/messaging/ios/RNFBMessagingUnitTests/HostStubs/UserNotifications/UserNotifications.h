/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Constructible UNNotification for façade notificationToDict coverage.
 */
#import <Foundation/Foundation.h>

@interface UNNotificationContent : NSObject
@property(nonatomic, copy) NSDictionary *userInfo;
@end

@interface UNNotificationRequest : NSObject
@property(nonatomic, strong) UNNotificationContent *content;
@end

@interface UNNotification : NSObject
@property(nonatomic, strong) UNNotificationRequest *request;
- (instancetype)initWithUserInfo:(NSDictionary *)userInfo;
@end
