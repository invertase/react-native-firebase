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

#if __has_include(<Firebase/Firebase.h>)
#import <Firebase/Firebase.h>
#elif __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#import <FirebaseCore/FirebaseCore.h>
#import <FirebaseMessaging/FirebaseMessaging.h>
#else
@import FirebaseCore;
@import FirebaseMessaging;
#endif

#if TARGET_OS_IOS || TARGET_OS_TV
#import <UIKit/UIKit.h>
#endif

#import <RNFBApp/RNFBSharedUtils.h>
#import <React/RCTConvert.h>

#import "RNFBMessagingHelper.h"
#import "RNFBMessagingSerializer.h"

@implementation RNFBMessagingHelper

+ (BOOL)isAutoInitEnabled {
  return [FIRMessaging messaging].autoInitEnabled;
}

+ (void)setAutoInitEnabled:(BOOL)enabled
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject {
  @try {
    [FIRMessaging messaging].autoInitEnabled = enabled;
  } @catch (NSException *exception) {
    return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
  }

  return resolve([NSNull null]);
}

+ (void)getTokenWithSenderId:(NSString *)senderId
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
#if TARGET_OS_IOS || TARGET_OS_TV
  if ([UIApplication sharedApplication].isRegisteredForRemoteNotifications == NO) {
    [RNFBSharedUtils
        rejectPromiseWithUserInfo:reject
                         userInfo:(NSMutableDictionary *)@{
                           @"code" : @"unregistered",
                           @"message" : @"You must be registered for remote "
                                        @"messages before calling "
                                        @"getToken, see "
                                        @"registerDeviceForRemoteMessages(getMessaging()).",
                         }];
    return;
  }
#endif

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

+ (void)deleteTokenWithSenderId:(NSString *)senderId
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

+ (void)getAPNSToken:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
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
#if TARGET_OS_IOS || TARGET_OS_TV
    if ([UIApplication sharedApplication].isRegisteredForRemoteNotifications == NO) {
      [RNFBSharedUtils
          rejectPromiseWithUserInfo:reject
                           userInfo:(NSMutableDictionary *)@{
                             @"code" : @"unregistered",
                             @"message" : @"You must be registered for remote "
                                          @"messages before "
                                          @"calling getAPNSToken, see "
                                          @"registerDeviceForRemoteMessages(getMessaging()).",
                           }];
      return;
    }
#endif
    resolve([NSNull null]);
  }
}

+ (void)setAPNSToken:(NSString *)token
                type:(NSString *)type
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  FIRMessagingAPNSTokenType tokenType = FIRMessagingAPNSTokenTypeUnknown;
  if (type != nil && [@"prod" isEqualToString:type]) {
    tokenType = FIRMessagingAPNSTokenTypeProd;
  } else if (type != nil && [@"sandbox" isEqualToString:type]) {
    tokenType = FIRMessagingAPNSTokenTypeSandbox;
  }

  NSData *tokenData = [RNFBMessagingSerializer APNSTokenDataFromNSString:token];
  if (tokenData == nil) {
    [RNFBSharedUtils
        rejectPromiseWithUserInfo:reject
                         userInfo:[@{
                           @"code" : @"invalid-apns-token",
                           @"message" : @"APNs token must be a non-empty, even-length hexadecimal "
                                        @"string."
                         } mutableCopy]];
    return;
  }

  [[FIRMessaging messaging] setAPNSToken:tokenData type:tokenType];
  resolve([NSNull null]);
}

+ (void)subscribeToTopic:(NSString *)topic
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

+ (void)unsubscribeFromTopic:(NSString *)topic
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

@end
