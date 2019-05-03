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
#import <FirebaseInvites/FIRInvites.h>

#import "RNFBInvitesModule.h"
#import "RNFBSharedUtils.h"
#import "RNFBRCTEventEmitter.h"


@implementation RNFBInvitesModule
#pragma mark -
#pragma mark Module Setup

  static NSString *initialInvite = nil;
  static RNFBInvitesModule *shared = nil;

  RCT_EXPORT_MODULE()

  - (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
  }

  + (BOOL)requiresMainQueueSetup {
    return NO;
  }

#pragma mark -
#pragma mark AppDelegate
  + (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
    return [self handleUrl:url];
  }

  + (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && (__IPHONE_OS_VERSION_MAX_ALLOWED >= 12000) /* __IPHONE_12_0 */
      (nonnull void (^)(NSArray<id <UIUserActivityRestoring>> *_Nullable))restorationHandler {
#else
    (nonnull void (^)(NSArray *_Nullable))restorationHandler {
#endif

    if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
      return [self handleUrl:userActivity.webpageURL];
    }

    return NO;
  }


#pragma mark -
#pragma mark FIRInviteDelegate

  - (void)inviteFinishedWithInvitations:(NSArray *)invitationIds error:(NSError *)error {
    if (error) {
      if (error.code == -402) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:_invitationsRejecter userInfo:[@{@"code": @"invitation-cancelled", @"message": @"Invitation cancelled"} mutableCopy]];
      } else if (error.code == -404) {
        [RNFBSharedUtils rejectPromiseWithUserInfo:_invitationsRejecter userInfo:[@{@"code": @"invitation-error", @"message": @"User must be signed in with GoogleSignIn"} mutableCopy]];
      } else {
        [RNFBSharedUtils rejectPromiseWithUserInfo:_invitationsRejecter userInfo:[@{@"code": @"invitation-error", @"message": @"Invitation failed to send"} mutableCopy]];
      }
    } else {
      _invitationsResolver(invitationIds);
    }

    _invitationsRejecter = nil;
    _invitationsResolver = nil;
  }

#pragma mark -
#pragma mark Firebase Invites Methods

  RCT_EXPORT_METHOD(getInitialInvitation:
    (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    NSURL *url = nil;

    if (self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey]) {
      url = (NSURL *) self.bridge.launchOptions[UIApplicationLaunchOptionsURLKey];
    } else if (self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey]) {
      NSDictionary *dictionary = self.bridge.launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey];
      if ([dictionary[UIApplicationLaunchOptionsUserActivityTypeKey] isEqual:NSUserActivityTypeBrowsingWeb]) {
        NSUserActivity *userActivity = (NSUserActivity *) dictionary[@"UIApplicationLaunchOptionsUserActivityKey"];
        url = userActivity.webpageURL;
      }
    }

    if (!url) return resolve(initialInvite);

    [FIRInvites handleUniversalLink:url completion:^(FIRReceivedInvite *_Nullable receivedInvite, NSError *_Nullable error) {
      if (error) {
        DLog(@"Failed to handle universal link: %@", [error localizedDescription]);
        return [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:[@{@"code": @"initial-invitation-error", @"message": @"Failed to handle invitation"} mutableCopy]];
      }

      if (receivedInvite && receivedInvite.inviteId) {
        resolve(@{
            @"deepLink": receivedInvite.deepLink,
            @"invitationId": receivedInvite.inviteId,
        });
      } else {
        resolve(initialInvite);
      }
    }];
  }

  RCT_EXPORT_METHOD(sendInvitation:
    (NSDictionary *) invitation
        resolve:
        (RCTPromiseResolveBlock) resolve
        reject:
        (RCTPromiseRejectBlock) reject) {
    id <FIRInviteBuilder> inviteDialog = [FIRInvites inviteDialog];

    [inviteDialog setInviteDelegate:self];
    [inviteDialog setMessage:invitation[@"message"]];
    [inviteDialog setTitle:invitation[@"title"]];

    if (invitation[@"androidClientId"]) {
      FIRInvitesTargetApplication *targetApplication = [[FIRInvitesTargetApplication alloc] init];
      targetApplication.androidClientID = invitation[@"androidClientId"];
      [inviteDialog setOtherPlatformsTargetApplication:targetApplication];
    }

    if (invitation[@"androidMinimumVersionCode"]) {
      [inviteDialog setAndroidMinimumVersionCode:[invitation[@"androidMinimumVersionCode"] integerValue]];
    }

    if (invitation[@"callToActionText"]) {
      [inviteDialog setCallToActionText:invitation[@"callToActionText"]];
    }

    if (invitation[@"customImage"]) {
      [inviteDialog setCustomImage:invitation[@"customImage"]];
    }

    if (invitation[@"deepLink"]) {
      [inviteDialog setDeepLink:invitation[@"deepLink"]];
    }

    _invitationsRejecter = reject;
    _invitationsResolver = resolve;

    dispatch_async(dispatch_get_main_queue(), ^{
      [inviteDialog open];
    });
  }

  + (BOOL)handleUrl:(NSURL *)url {
    return [FIRInvites handleUniversalLink:url completion:^(FIRReceivedInvite *_Nullable receivedInvite, NSError *_Nullable error) {
      if (error) {
        DLog(@"Failed to handle invitation: %@", [error localizedDescription]);
      } else if (receivedInvite && receivedInvite.inviteId) {
        [[RNFBRCTEventEmitter shared] sendEventWithName:@"invites_invitation_received" body:@{
            @"deepLink": receivedInvite.deepLink,
            @"invitationId": receivedInvite.inviteId,
        }];
      } else {
        // TODO(salakar) enable once Links module complete
        // [[RNFirebaseLinksModule instance] sendLink:receivedInvite.deepLink];
      }
    }];
  }

  - (NSArray<NSString *> *)supportedEvents {
    return @[@"invites_invitation_received"];
  }

@end
