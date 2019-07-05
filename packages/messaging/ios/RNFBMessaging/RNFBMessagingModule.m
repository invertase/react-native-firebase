/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
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

#import <React/RCTUtils.h>
#import <Firebase/Firebase.h>
#import <UserNotifications/UserNotifications.h>

#import "RNFBMessagingModule.h"
#import "RNFBApp/RNFBSharedUtils.h"
#import "RCTConvert.h"
#import "RNFBMessagingDelegate.h"
#import "RNFBMessagingAppDelegateInterceptor.h"


@implementation RNFBMessagingModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();


- (id)init {
  self = [super init];
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    [RNFBMessagingDelegate sharedInstance];
    [RNFBMessagingAppDelegateInterceptor sharedInstance];
  });
  return self;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}


- (NSDictionary *)constantsToExport {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isAutoInitEnabled"] = @([RCTConvert BOOL:@([FIRMessaging messaging].autoInitEnabled]);
  return constants;
}


#pragma mark -
#pragma mark Firebase Messaging Methods


RCT_EXPORT_METHOD(setAutoInitEnabled:
  (BOOL) enabled
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  @try {
    [FIRMessaging messaging].autoInitEnabled = enabled;
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}


RCT_EXPORT_METHOD(getToken:
  (NSString *) authorizedEntity
    :(NSString *) scope
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  NSDictionary *options = nil;
  if ([FIRMessaging messaging].APNSToken) {
    options = @{@"apns_token": [FIRMessaging messaging].APNSToken};
  }
  [[FIRInstanceID instanceID] tokenWithAuthorizedEntity:authorizedEntity scope:scope options:options handler:^(NSString *_Nullable identity, NSError *_Nullable error) {
    if (error) {
      [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
    } else {
      resolve(identity);
    }
  }];
}


RCT_EXPORT_METHOD(deleteToken:
  (NSString *) authorizedEntity
    :(NSString *) scope
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  [[FIRInstanceID instanceID] deleteTokenWithAuthorizedEntity:authorizedEntity scope:scope handler:^(NSError *_Nullable error) {
    if (error) {
      [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
    } else {
      resolve([NSNull null]);
    }
  }];
}


RCT_EXPORT_METHOD(getAPNSToken:
  (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject
) {
  NSData *apnsToken = [FIRMessaging messaging].APNSToken;
  if (apnsToken) {
    const char *data = [apnsToken bytes];
    NSMutableString *token = [NSMutableString string];
    for (NSInteger i = 0; i < apnsToken.length; i++) {
      [token appendFormat:@"%02.2hhX", data[i]];
    }
    resolve([token copy]);
  } else {
    resolve([NSNull null]);
  }
}

RCT_EXPORT_METHOD(requestPermission:
  (RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  if (RCTRunningInAppExtension()) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
        @"code": @"unavailable-in-extension",
        @"message": @"requestPermission can not be called in App Extensions"} mutableCopy];
    return;
  }

  if (@available(iOS 10.0, *)) {
    UNAuthorizationOptions authOptions;
    if (@available(iOS 12.0, *)) {
      authOptions = UNAuthorizationOptionProvisional | UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
    } else {
      authOptions = UNAuthorizationOptionAlert | UNAuthorizationOptionSound | UNAuthorizationOptionBadge;
    }

    [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:authOptions completionHandler:^(BOOL granted, NSError *_Nullable error) {
      if (error) {
        [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
      } else {
        resolve(@([RCTConvert BOOL:@(granted)]));
      }
    }];
  } else {
    // TODO iOS 9 support can be added here
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{
        @"code": @"unsupported-platform-version",
        @"message": @"requestPermission can not be called on this version of iOS, minimum version is iOS 10."} mutableCopy];
    return;
  }


  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] registerForRemoteNotifications];
  });
}

RCT_EXPORT_METHOD(registerForRemoteNotifications:
  (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject) {
  [[UIApplication sharedApplication] registerForRemoteNotifications];
  resolve(nil);
}

// Non Web SDK methods
RCT_EXPORT_METHOD(hasPermission:
  (RCTPromiseResolveBlock) resolve
      rejecter:
      (RCTPromiseRejectBlock) reject) {
  if (floor(NSFoundationVersionNumber) <= NSFoundationVersionNumber_iOS_9_x_Max) {
    dispatch_async(dispatch_get_main_queue(), ^{
      BOOL hasPermission = [RCTConvert BOOL:@([RCTSharedApplication() currentUserNotificationSettings].types != UIUserNotificationTypeNone)];
      resolve(@(hasPermission));
    });
  } else {
    if (@available(iOS 10.0, *)) {
      [[UNUserNotificationCenter currentNotificationCenter] getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *_Nonnull settings) {
        BOOL hasPermission = [RCTConvert BOOL:@(settings.alertSetting == UNNotificationSettingEnabled)];
        resolve(@(hasPermission));
      }];
    }
  }
}


RCT_EXPORT_METHOD(sendMessage:
  (NSDictionary *) message
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject) {
  if (!message[@"to"]) {
    reject(@"messaging/invalid-message", @"The supplied message is missing a 'to' field", nil);
  }
  NSString *to = message[@"to"];
  NSString *messageId = message[@"messageId"];
  NSNumber *ttl = message[@"ttl"];
  NSDictionary *data = message[@"data"];

  [[FIRMessaging messaging] sendMessage:data to:to withMessageID:messageId timeToLive:[ttl intValue]];

  // TODO: Listen for send success / errors
  resolve(nil);
}

RCT_EXPORT_METHOD(subscribeToTopic:
  (NSString *) topic
    : (RCTPromiseResolveBlock) resolve
    : (RCTPromiseRejectBlock) reject) {
  [[FIRMessaging messaging] subscribeToTopic:topic completion:^(NSError *error) {
    if (error) {
      [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
    } else {
      resolve(nil);
    }
  }];
}

RCT_EXPORT_METHOD(unsubscribeFromTopic:
  (NSString *) topic
      resolve:
      (RCTPromiseResolveBlock) resolve
      reject:
      (RCTPromiseRejectBlock) reject) {
  [[FIRMessaging messaging] unsubscribeFromTopic:topic completion:^(NSError *error) {
    if (error) {
      [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
    } else {
      resolve(nil);
    }
  }];
}


@end
