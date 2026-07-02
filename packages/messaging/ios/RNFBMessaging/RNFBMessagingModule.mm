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

RCT_EXPORT_MODULE(NativeRNFBTurboMessaging)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (id)init {
  self = [super init];
  return self;
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

- (NSDictionary *)messagingConstantsDictionary {
  NSMutableDictionary *constants = [NSMutableDictionary new];
  constants[@"isAutoInitEnabled"] =
      @([RCTConvert BOOL:@([FIRMessaging messaging].autoInitEnabled)]);
#if TARGET_IPHONE_SIMULATOR
  constants[@"isRegisteredForRemoteNotifications"] = @NO;
#else
  constants[@"isRegisteredForRemoteNotifications"] = @(
      [RCTConvert BOOL:@([[UIApplication sharedApplication] isRegisteredForRemoteNotifications])]);
#endif
  constants[@"isDeliveryMetricsExportToBigQueryEnabled"] =
      @([RCTConvert BOOL:@(_isDeliveryMetricsExportToBigQueryEnabled)]);
  return constants;
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboMessaging::Constants::Builder>)
    constantsToExport {
  return [_RCTTypedModuleConstants newWithUnsafeDictionary:[self messagingConstantsDictionary]];
}

- (facebook::react::ModuleConstants<JS::NativeRNFBTurboMessaging::Constants::Builder>)getConstants {
  return [self constantsToExport];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRNFBTurboMessagingSpecJSI>(params);
}

#pragma mark -
#pragma mark Firebase Messaging Methods

- (void)getInitialNotification:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
  resolve([[RNFBMessagingUNUserNotificationCenter sharedInstance] getInitialNotification]);
}

- (void)getDidOpenSettingsForNotification:(RCTPromiseResolveBlock)resolve
                                   reject:(RCTPromiseRejectBlock)reject {
  resolve(
      [[RNFBMessagingUNUserNotificationCenter sharedInstance] getDidOpenSettingsForNotification]);
}

- (void)setAutoInitEnabled:(BOOL)enabled
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRMessaging messaging].autoInitEnabled = enabled;
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)signalBackgroundMessageHandlerSet {
  DLog(@"signalBackgroundMessageHandlerSet called");
  @try {
    [[RNFBMessagingAppDelegate sharedInstance] signalBackgroundMessageHandlerSet];
  } @catch (NSException *exception) {
    ELog(@"signalBackgroundMessageHandlerSet failed");
  }
}

- (void)getToken:(NSString *)appName
        senderId:(NSString *)senderId
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  if ([UIApplication sharedApplication].isRegisteredForRemoteNotifications == NO) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:(NSMutableDictionary *)@{
                                        @"code" : @"unregistered",
                                        @"message" : @"You must be registered for remote "
                                                     @"messages before calling "
                                                     @"getToken, see "
                                                     @"messaging()."
                                                     @"registerDeviceForRemoteMessages().",
                                      }];
    return;
  }

  NSData *apnsToken = [FIRMessaging messaging].APNSToken;
  if (apnsToken == nil) {
    DLog(@"RNFBMessaging getToken - no APNS token is available. Firebase "
         @"requires an APNS token to "
         @"vend an FCM token in firebase-ios-sdk 10.4.0 and higher. See "
         @"documentation on "
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

- (void)deleteToken:(NSString *)appName
           senderId:(NSString *)senderId
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
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

- (void)getAPNSToken:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSData *apnsToken = [FIRMessaging messaging].APNSToken;
  if (apnsToken) {
    resolve([RNFBMessagingSerializer APNSTokenFromNSData:apnsToken]);
  } else {
#if TARGET_IPHONE_SIMULATOR
#if !TARGET_CPU_ARM64
    DLog(@"RNFBMessaging getAPNSToken - Simulator without APNS support "
         @"detected, with no token "
         @"set. Use setAPNSToken with an arbitrary string if needed for "
         @"testing.") resolve([NSNull null]);
    return;
#endif
    DLog(@"RNFBMessaging getAPNSToken - ARM64 Simulator detected, but no APNS "
         @"token available. "
         @"APNS token may be possible. macOS13+ / iOS16+ / M1 mac required for "
         @"assumption to be "
         @"valid. "
         @"Use setAPNSToken in testing if needed.");
#endif
    if ([UIApplication sharedApplication].isRegisteredForRemoteNotifications == NO) {
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"unregistered",
                                          @"message" : @"You must be registered for remote "
                                                       @"messages before "
                                                       @"calling getAPNSToken, see "
                                                       @"messaging()."
                                                       @"registerDeviceForRemoteMessages().",
                                        }];
      return;
    }
    resolve([NSNull null]);
  }
}

- (void)setAPNSToken:(NSString *)token
                type:(NSString *)type
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
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

- (void)getIsHeadless:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  RNFBMessagingNSNotificationCenter *notifCenter =
      [RNFBMessagingNSNotificationCenter sharedInstance];

  return resolve(@([RCTConvert BOOL:@(notifCenter.isHeadless)]));
}

- (void)completeNotificationProcessing {
  dispatch_async(dispatch_get_main_queue(), ^{
    RNFBMessagingAppDelegate *appDelegate = [RNFBMessagingAppDelegate sharedInstance];
    if (appDelegate.completionHandler) {
      appDelegate.completionHandler(UIBackgroundFetchResultNewData);
      appDelegate.completionHandler = nil;
    }
    if (appDelegate.backgroundTaskId != UIBackgroundTaskInvalid) {
      [[UIApplication sharedApplication] endBackgroundTask:appDelegate.backgroundTaskId];
      appDelegate.backgroundTaskId = UIBackgroundTaskInvalid;
    }
  });
}

- (void)requestPermission:(JS::NativeRNFBTurboMessaging::IOSPermissions &)permissions
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject {
  if (RCTRunningInAppExtension()) {
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                      userInfo:[@{
                                        @"code" : @"unavailable-in-extension",
                                        @"message" : @"requestPermission can not be called "
                                                     @"in App Extensions"
                                      } mutableCopy]];
    return;
  }

  UNAuthorizationOptions options = UNAuthorizationOptionNone;

  if (permissions.alert().has_value() && permissions.alert().value()) {
    options |= UNAuthorizationOptionAlert;
  }

  if (permissions.announcement().has_value() && permissions.announcement().value()) {
    options |= UNAuthorizationOptionAnnouncement;
  }

  if (permissions.badge().has_value() && permissions.badge().value()) {
    options |= UNAuthorizationOptionBadge;
  }

  if (permissions.sound().has_value() && permissions.sound().value()) {
    options |= UNAuthorizationOptionSound;
  }

  if (permissions.criticalAlert().has_value() && permissions.criticalAlert().value()) {
    options |= UNAuthorizationOptionCriticalAlert;
  }

  if (permissions.provisional().has_value() && permissions.provisional().value()) {
    options |= UNAuthorizationOptionProvisional;
  }

  if (permissions.carPlay().has_value() && permissions.carPlay().value()) {
    options |= UNAuthorizationOptionCarPlay;
  }

  if (permissions.providesAppNotificationSettings().has_value() &&
      permissions.providesAppNotificationSettings().value()) {
    options |= UNAuthorizationOptionProvidesAppNotificationSettings;
  }

  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center requestAuthorizationWithOptions:options
                        completionHandler:^(BOOL granted, NSError *_Nullable error) {
                          if (error) {
                            [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
                          } else {
                            dispatch_async(dispatch_get_main_queue(), ^{
                              [[UIApplication sharedApplication] registerForRemoteNotifications];
                            });
                            [self hasPermission:resolve reject:reject];
                          }
                        }];
}

- (void)registerForRemoteNotifications:(RCTPromiseResolveBlock)resolve
                                reject:(RCTPromiseRejectBlock)reject {
#if TARGET_IPHONE_SIMULATOR
#if !TARGET_CPU_ARM64
  [[UIApplication sharedApplication] registerForRemoteNotifications];
  resolve(@([RCTConvert BOOL:@(YES)]));
  return;
#endif
  DLog(@"RNFBMessaging registerForRemoteNotifications ARM64 Simulator "
       @"detected, attempting real "
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

  dispatch_async(dispatch_get_main_queue(), ^{
    dispatch_after(
        dispatch_time(DISPATCH_TIME_NOW, 10.0 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
          if ([RNFBMessagingAppDelegate sharedInstance].registerPromiseResolver != nil) {
            DLog(@"RNFBMessaging dispatch_after block: we appear to have timed "
                 @"out. Rejecting");
            [[RNFBMessagingAppDelegate sharedInstance] setPromiseResolve:nil andPromiseReject:nil];

            [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                              userInfo:[@{
                                                @"code" : @"unknown-error",
                                                @"message" : @"registerDeviceForRemoteMessag"
                                                             @"es requested but "
                                                             @"system did not respond. "
                                                             @"Possibly missing permission."
                                              } mutableCopy]];
            return;
          } else {
            DLog(@"RNFBMessaging dispatch_after: "
                 @"registerDeviceForRemoteMessages handled.");
            return;
          }
        });

    [[UIApplication sharedApplication] registerForRemoteNotifications];
  });
}

- (void)unregisterForRemoteNotifications:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject {
  [[UIApplication sharedApplication] unregisterForRemoteNotifications];
  resolve(nil);
}

- (void)hasPermission:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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

- (void)sendMessage:(NSDictionary *)remoteMessageMap
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject {
  [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                    userInfo:[@{
                                      @"code" : @"unimplemented",
                                      @"message" : @"sendMessage is only supported on "
                                                   @"Android devices."
                                    } mutableCopy]];
}

- (void)subscribeToTopic:(NSString *)topic
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  [[FIRMessaging messaging] subscribeToTopic:topic
                                  completion:^(NSError *error) {
                                    if (error) {
                                      [RNFBSharedUtils rejectPromiseWithNSError:reject error:error];
                                    } else {
                                      resolve(nil);
                                    }
                                  }];
}

- (void)unsubscribeFromTopic:(NSString *)topic
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
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

- (void)setDeliveryMetricsExportToBigQuery:(BOOL)enabled
                                   resolve:(RCTPromiseResolveBlock)resolve
                                    reject:(RCTPromiseRejectBlock)reject {
  @try {
    _isDeliveryMetricsExportToBigQueryEnabled = enabled;
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

- (void)setNotificationDelegationEnabled:(BOOL)enabled
                                 resolve:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject {
  resolve([NSNull null]);
}

- (void)isNotificationDelegationEnabled:(RCTPromiseResolveBlock)resolve
                                 reject:(RCTPromiseRejectBlock)reject {
  resolve(@NO);
}

@end
