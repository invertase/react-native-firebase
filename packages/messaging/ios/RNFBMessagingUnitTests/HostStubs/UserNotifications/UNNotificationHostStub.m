/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */

#import "UserNotifications.h"

@implementation UNNotificationContent
@end

@implementation UNNotificationRequest
@end

@implementation UNNotification

- (instancetype)initWithUserInfo:(NSDictionary *)userInfo {
  self = [super init];
  if (self) {
    UNNotificationContent *content = [[UNNotificationContent alloc] init];
    content.userInfo = userInfo;
    UNNotificationRequest *request = [[UNNotificationRequest alloc] init];
    request.content = content;
    _request = request;
  }
  return self;
}

@end
