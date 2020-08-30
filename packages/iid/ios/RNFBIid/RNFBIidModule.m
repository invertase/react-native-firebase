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

#import "RNFBIidModule.h"
#import "RNFBApp/RNFBSharedUtils.h"

#if __has_include(<FirebaseMessaging/FirebaseMessaging.h>)
#define HAS_MESSAGING
#endif

@implementation RNFBIidModule
#pragma mark -
#pragma mark Module Setup

  RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase Iid Methods

  RCT_EXPORT_METHOD(get:
    (FIRApp *) firebaseApp // unused, iOS does not have multi-app support per instance, keep for android
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    [[FIRInstanceID instanceID] getIDWithHandler:^(NSString *_Nullable identity, NSError *_Nullable error) {
      if (error) {
        [self rejectErrorWithCode:error reject:reject];
      } else {
        resolve(identity);
      }
    }];
  }

  RCT_EXPORT_METHOD(getToken:
    (FIRApp *) firebaseApp // unused, iOS does not have multi-app support per instance, keep for android
        authorizedEntity:
        (NSString *) authorizedEntity
        scope:
        (NSString *) scope
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    NSDictionary *options = nil;
#ifdef HAS_MESSAGING
    if ([FIRMessaging messaging].APNSToken) {
      options = @{@"apns_token": [FIRMessaging messaging].APNSToken};
    }
#endif
    [[FIRInstanceID instanceID] tokenWithAuthorizedEntity:authorizedEntity scope:scope options:options handler:^(NSString *_Nullable identity, NSError *_Nullable error) {
      if (error) {
        [self rejectErrorWithCode:error reject:reject];
      } else {
        resolve(identity);
      }
    }];
  }

  RCT_EXPORT_METHOD(delete:
    (FIRApp *) firebaseApp // unused, iOS does not have multi-app support per instance, keep for android
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    [[FIRInstanceID instanceID] deleteIDWithHandler:^(NSError *_Nullable error) {
      if (error) {
        [self rejectErrorWithCode:error reject:reject];
      } else {
        resolve([NSNull null]);
      }
    }];
  }

  RCT_EXPORT_METHOD(deleteToken:
    (FIRApp *) firebaseApp // unused, iOS does not have multi-app support per instance, keep for android
        authorizedEntity:
        (NSString *) authorizedEntity
        scope:
        (NSString *) scope
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    [[FIRInstanceID instanceID] deleteTokenWithAuthorizedEntity:authorizedEntity scope:scope handler:^(NSError *_Nullable error) {
      if (error) {
        [self rejectErrorWithCode:error reject:reject];
      } else {
        resolve([NSNull null]);
      }
    }];
  }

  - (void)rejectErrorWithCode:(NSError *)error reject:(RCTPromiseRejectBlock)reject {
    NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
    userInfo[@"code"] = [self getErrorCodeName:error];
    userInfo[@"message"] = [error localizedDescription];
    [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:userInfo];
  }

  - (NSString *)getErrorCodeName:(NSError *)error {
    NSString *code = @"iid/unknown";
    switch (error.code) {
      case FIRInstanceIDErrorAuthentication:
        code = @"iid/failed-gcm-auth";
        break;
      case FIRInstanceIDErrorNoAccess:
        code = @"iid/no-access";
        break;
      case FIRInstanceIDErrorTimeout:
        code = @"iid/timeout";
        break;
      case FIRInstanceIDErrorNetwork:
        code = @"iid/no-network";
        break;
      case FIRInstanceIDErrorOperationInProgress:
        code = @"iid/operation-in-progress";
        break;
      case FIRInstanceIDErrorInvalidRequest:
        code = @"iid/invalid-request";
        break;
      default:
        break;
    }

    return code;
  }

@end
