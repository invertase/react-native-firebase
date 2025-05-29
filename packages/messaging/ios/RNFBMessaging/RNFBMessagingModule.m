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

#import <Firebase/Firebase.h>
#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

#import "RNFBMessaging+AppDelegate.h"
#import "RNFBMessaging+NSNotificationCenter.h"
#import "RNFBMessaging+UNUserNotificationCenter.h"
#import "RNFBMessagingModule.h"
#import "RNFBMessagingSerializer.h"

@implementation RNFBMessagingModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (id)init {
  self = [super init];
  return self;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

+ (NSDictionary *)addCustomPropsToUserProps:(NSDictionary *_Nullable)userProps
                          withLaunchOptions:(NSDictionary *_Nullable)launchOptions {
  NSMutableDictionary *appProperties =
      userProps != nil ? [userProps mutableCopy] : [NSMutableDictionary dictionary];
  appProperties[@"isHeadless"] = @([RCTConvert BOOL:@(NO)]);

  if (launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey]) {
    if ([UIApplication sharedApplication].applicationState == UIApplicationStateBackground) {
      appProperties[@"isHeadless"] = @([RCTConvert BOOL:@(YES)]);
    }
  }

  return [NSDictionary dictionaryWithDictionary:appProperties];
}

- (NSDictionary *)constantsToExport {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isAutoInitEnabled"] =
      @([RCTConvert BOOL:@([FIRMessaging messaging].autoInitEnabled)]);
  constants[@"isRegisteredForRemoteNotifications"] = @(
      [RCTConvert BOOL:@([[UIApplication sharedApplication] isRegisteredForRemoteNotifications])]);
  constants[@"isDeliveryMetricsExportToBigQueryEnabled"] =
      @([RCTConvert BOOL:@(_isDeliveryMetricsExportToBigQueryEnabled)]);
  return constants;
}

#pragma mark -
#pragma mark Firebase Messaging Methods

RCT_EXPORT_METHOD(getInitialNotification
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  resolve([[RNFBMessagingUNUserNotificationCenter sharedInstance] getInitialNotification]);
}

RCT_EXPORT_METHOD(getDidOpenSettingsForNotification
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  resolve(
      [[RNFBMessagingUNUserNotificationCenter sharedInstance] getDidOpenSettingsForNotification]);
}

RCT_EXPORT_METHOD(setAutoInitEnabled
                  : (BOOL)enabled
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    [FIRMessaging messaging].autoInitEnabled = enabled;
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

RCT_EXPORT_METHOD(signalBackgroundMessageHandlerSet) {
  DLog(@"signalBackgroundMessageHandlerSet called");
  @try {
    [[RNFBMessagingAppDelegate sharedInstance] signalBackgroundMessageHandlerSet];
  } @catch (NSException *exception) {
    ELog(@"signalBackgroundMessageHandlerSet failed");
  }
}

RCT_EXPORT_METHOD(getToken
                  : (NSString *)appName
                  : (NSString *)senderId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  if ([UIApplication sharedApplication].isRegisteredForRemoteNotifications == NO) {
    [RNFBSharedUtils
        rejectPromiseWithUserInfo:reject
                         userInfo:(NSMutableDictionary *)@{
                           @"code" : @"unregistered",
                           @"message" :
                               @"You must be registered for remote messages before calling "
                               @"getToken, see messaging().registerDeviceForRemoteMessages().",
                         }];
    return;
  }

  // As of firebase-ios-sdk 10.4.0, an APNS token is strictly required for getToken to work
  NSData *apnsToken = [FIRMessaging messaging].APNSToken;
  if (apnsToken == nil) {
    DLog(@"RNFBMessaging getToken - no APNS token is available. Firebase requires an APNS token to "
         @"vend an FCM token in firebase-ios-sdk 10.4.0 and higher. See documentation on "
         @"setAPNSToken and getAPNSToken.")
  }

  [[FIRMessaging messaging]
      retrieveFCMTokenForSenderID:senderId
                       completion:^(NSString *_Nullable token, NSError *_Nullable error) {
                         if (error) {
                           [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
                         } else {
                           resolve(token);
                         }
                       }];
}

RCT_EXPORT_METHOD(deleteToken
                  : (NSString *)appName
                  : (NSString *)senderId
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRMessaging messaging] deleteFCMTokenForSenderID:senderId
                                           completion:^(NSError *_Nullable error) {
                                             if (error) {
                                               [RNFBSharedUtils rejectPromiseWithNSError:reject
                                                                                   error:error];
                                             } else {
                                               resolve([NSNull null]);
                                             }
                                           }];
}

RCT_EXPORT_METHOD(getAPNSToken : (RCTPromiseResolveBlock)resolve : (RCTPromiseRejectBlock)reject) {
  NSData *apnsToken = [FIRMessaging messaging].APNSToken;
  if (apnsToken) {
    resolve([RNFBMessagingSerializer APNSTokenFromNSData:apnsToken]);
  } else {
#if TARGET_IPHONE_SIMULATOR
#if !TARGET_CPU_ARM64
    DLog(@"RNFBMessaging getAPNSToken - Simulator without APNS support detected, with no token "
         @"set. Use setAPNSToken with an arbitrary string if needed for testing.")
        resolve([NSNull null]);
    return;
#endif
    DLog(@"RNFBMessaging getAPNSToken - ARM64 Simulator detected, but no APNS token available. "
         @"APNS token may be possible. macOS13+ / iOS16+ / M1 mac required for assumption to be "
         @"valid. "
         @"Use setAPNSToken in testing if needed.");
#endif
    if ([UIApplication sharedApplication].isRegisteredForRemoteNotifications == NO) {
      [RNFBSharedUtils
          rejectPromiseWithUserInfo:reject
                           userInfo:(NSMutableDictionary *)@{
                             @"code" : @"unregistered",
                             @"message" : @"You must be registered for remote messages before "
                                          @"calling getAPNSToken, see "
                                          @"messaging().registerDeviceForRemoteMessages().",
                           }];
      return;
    }
    resolve([NSNull null]);
  }
}

RCT_EXPORT_METHOD(setAPNSToken
                  : (NSString *)token
                  : (NSString *)type
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  // Default to unknown (determined by provisioning profile) type, but user may have passed type as
  // param
  FIRMessagingAPNSTokenType tokenType = FIRMessagingAPNSTokenTypeUnknown;
  if (type != nil && [@"prod" isEqualToString:type]) {
    tokenType = FIRMessagingAPNSTokenTypeProd;
  } else if (type != nil && [@"sandbox" isEqualToString:type]) {
    tokenType = FIRMessagingAPNSTokenTypeSandbox;
  }

  [[FIRMessaging messaging] setAPNSToken:[RNFBMessagingSerializer APNSTokenDataFromNSString:token]
                                    type:tokenType];
  resolve([NSNull null]);
}

RCT_EXPORT_METHOD(getIsHeadless : (RCTPromiseResolveBlock)resolve : (RCTPromiseRejectBlock)reject) {
  RNFBMessagingNSNotificationCenter *notifCenter =
      [RNFBMessagingNSNotificationCenter sharedInstance];

  return resolve(@([RCTConvert BOOL:@(notifCenter.isHeadless)]));
}

RCT_EXPORT_METHOD(completeNotificationProcessing) {
  dispatch_get_main_queue(), ^{
    RNFBMessagingAppDelegate *appDelegate = [RNFBMessagingAppDelegate sharedInstance];
    if (appDelegate.completionHandler) {
      appDelegate.completionHandler(UIBackgroundFetchResultNewData);
      appDelegate.completionHandler = nil;
    }
    if (appDelegate.backgroundTaskId != UIBackgroundTaskInvalid) {
      [[UIApplication sharedApplication] endBackgroundTask:appDelegate.backgroundTaskId];
      appDelegate.backgroundTaskId = UIBackgroundTaskInvalid;
    }
  };
}

RCT_EXPORT_METHOD(requestPermission
                  : (NSDictionary *)permissions
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  if (RCTRunningInAppExtension()) {
    [RNFBSharedUtils
        rejectPromiseWithUserInfo:reject
                         userInfo:[@{
                           @"code" : @"unavailable-in-extension",
                           @"message" : @"requestPermission can not be called in App Extensions"
                         } mutableCopy]];
    return;
  }

  UNAuthorizationOptions options = UNAuthorizationOptionNone;

  if ([permissions[@"alert"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionAlert;
  }

  if ([permissions[@"badge"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionBadge;
  }

  if ([permissions[@"sound"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionSound;
  }

  if ([permissions[@"criticalAlert"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionCriticalAlert;
  }

  if ([permissions[@"provisional"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionProvisional;
  }

  if ([permissions[@"announcement"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionAnnouncement;
  }

  if ([permissions[@"carPlay"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionCarPlay;
  }

  if ([permissions[@"providesAppNotificationSettings"] isEqual:@(YES)]) {
    options |= UNAuthorizationOptionProvidesAppNotificationSettings;
  }

  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center requestAuthorizationWithOptions:options
                        completionHandler:^(BOOL granted, NSError *_Nullable error) {
                          if (error) {
                            [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
                          } else {
                            // if we do not attempt to register immediately, registration fails
                            // later unknown reason why, but this was the only difference between
                            // using a react-native-permissions vs built-in permissions request in
                            // a sequence of "request permissions" --> "register for messages" you
                            // only want to request permission if you want to register for
                            // messages, so we register directly now - see #7272
                            dispatch_async(dispatch_get_main_queue(), ^{
                              [[UIApplication sharedApplication] registerForRemoteNotifications];
                            });
                            [self hasPermission:resolve:reject];
                          }
                        }];
}

RCT_EXPORT_METHOD(registerForRemoteNotifications
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
#if TARGET_IPHONE_SIMULATOR
#if !TARGET_CPU_ARM64
  // Register on this unsupported simulator, but no waiting for a token that won't arrive
  [[UIApplication sharedApplication] registerForRemoteNotifications];
  resolve(@([RCTConvert BOOL:@(YES)]));
  return;
#endif
  DLog(@"RNFBMessaging registerForRemoteNotifications ARM64 Simulator detected, attempting real "
       @"registration. macOS13+ / iOS16+ / M1 mac required or will timeout.")
#endif
      if ([UIApplication sharedApplication].isRegisteredForRemoteNotifications == YES) {
    DLog(@"RNFBMessaging registerForRemoteNotifications - already registered.");
    resolve(@([RCTConvert BOOL:@(YES)]));
    return;
  }
  else {
    [[RNFBMessagingAppDelegate sharedInstance] setPromiseResolve:resolve andPromiseReject:reject];
  }

  // Apple docs recommend that registerForRemoteNotifications is always called on app start
  // regardless of current status
  dispatch_async(dispatch_get_main_queue(), ^{
    // Sometimes the registration never completes, which deserves separate attention in other
    // areas. This area should protect itself against hanging forever regardless. Just in case,
    // check in after a delay and cleanup if required
    dispatch_after(
        dispatch_time(DISPATCH_TIME_NOW, 10.0 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
          if ([RNFBMessagingAppDelegate sharedInstance].registerPromiseResolver != nil) {
            // if we got here and resolve/reject are still set, unset, log failure, reject
            DLog(@"RNFBMessaging dispatch_after block: we appear to have timed out. Rejecting");
            [[RNFBMessagingAppDelegate sharedInstance] setPromiseResolve:nil andPromiseReject:nil];

            [RNFBSharedUtils
                rejectPromiseWithUserInfo:reject
                                 userInfo:[@{
                                   @"code" : @"unknown-error",
                                   @"message" :
                                       @"registerDeviceForRemoteMessages requested but "
                                       @"system did not respond. Possibly missing permission."
                                 } mutableCopy]];
            return;
          } else {
            DLog(@"RNFBMessaging dispatch_after: registerDeviceForRemoteMessages handled.");
            return;
          }
        });

    [[UIApplication sharedApplication] registerForRemoteNotifications];
  });
}

RCT_EXPORT_METHOD(unregisterForRemoteNotifications
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[UIApplication sharedApplication] unregisterForRemoteNotifications];
  resolve(nil);
}

RCT_EXPORT_METHOD(hasPermission : (RCTPromiseResolveBlock)resolve : (RCTPromiseRejectBlock)reject) {
  [[UNUserNotificationCenter currentNotificationCenter]
      getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *_Nonnull settings) {
        NSNumber *authorizedStatus = @-1;
        if (settings.authorizationStatus == UNAuthorizationStatusNotDetermined) {
          authorizedStatus = @-1;
        } else if (settings.authorizationStatus == UNAuthorizationStatusDenied) {
          authorizedStatus = @0;
        } else if (settings.authorizationStatus == UNAuthorizationStatusAuthorized) {
          authorizedStatus = @1;
        } else if (settings.authorizationStatus == UNAuthorizationStatusProvisional) {
          authorizedStatus = @2;
        }

        if (@available(iOS 14.0, macCatalyst 14.0, *)) {
          if (settings.authorizationStatus == UNAuthorizationStatusEphemeral) {
            authorizedStatus = @3;
          }
        }

        resolve(authorizedStatus);
      }];
}

RCT_EXPORT_METHOD(subscribeToTopic
                  : (NSString *)topic
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRMessaging messaging] subscribeToTopic:topic
                                  completion:^(NSError *error) {
                                    if (error) {
                                      [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
                                    } else {
                                      resolve(nil);
                                    }
                                  }];
}

RCT_EXPORT_METHOD(unsubscribeFromTopic
                  : (NSString *)topic
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  [[FIRMessaging messaging] unsubscribeFromTopic:topic
                                      completion:^(NSError *error) {
                                        if (error) {
                                          [RNFBSharedUtils rejectPromiseWithNSError:reject
                                                                              error:error];
                                        } else {
                                          resolve(nil);
                                        }
                                      }];
}

RCT_EXPORT_METHOD(setDeliveryMetricsExportToBigQuery
                  : (BOOL)enabled
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  @try {
    _isDeliveryMetricsExportToBigQueryEnabled = enabled;
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

@end
