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
#import <React/RCTUtils.h>

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBInstallationsModule.h"

#import "FirebaseInstallations/FIRInstallations.h"

@implementation RNFBInstallationsModule
#pragma mark -
#pragma mark Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#pragma mark -
#pragma mark Firebase Installations Methods

RCT_EXPORT_METHOD(delete
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRInstallations *installations = [FIRInstallations installationsWithApp:firebaseApp];
  [installations deleteWithCompletion:^(NSError *_Nullable error) {
    if (error != nil) {
      // Handle any errors if the delete failed
      DLog(@"Unable to delete Installations ID: %@", error);
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"delete-error",
                                          @"message" : [error localizedDescription],
                                        }];
      return;
    }

    resolve([NSNull null]);
  }];
}

RCT_EXPORT_METHOD(getId
                  : (FIRApp *)firebaseApp
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRInstallations *installations = [FIRInstallations installationsWithApp:firebaseApp];
  [installations installationIDWithCompletion:^(NSString *_Nullable id, NSError *_Nullable error) {
    if (error != nil) {
      // Handle any errors if the id was not retrieved.
      DLog(@"Unable to retrieve Installations ID: %@", error);
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"id-error",
                                          @"message" : [error localizedDescription],
                                        }];
      return;
    }
    if (id == nil) {
      DLog(@"Unable to retrieve Installations ID.");
      [RNFBSharedUtils rejectPromiseWithUserInfo:reject
                                        userInfo:(NSMutableDictionary *)@{
                                          @"code" : @"id-null",
                                          @"message" : @"no id fetched",
                                        }];
      return;
    }

    resolve(id);
  }];
}

RCT_EXPORT_METHOD(getToken
                  : (FIRApp *)firebaseApp
                  : (BOOL)forceRefresh
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject) {
  FIRInstallations *installations = [FIRInstallations installationsWithApp:firebaseApp];
  [installations authTokenForcingRefresh:forceRefresh
                              completion:^(FIRInstallationsAuthTokenResult *_Nullable token,
                                           NSError *_Nullable error) {
                                if (error != nil) {
                                  // Handle any errors if the token was not retrieved.
                                  DLog(@"Unable to retrieve Installations auth token: %@", error);
                                  [RNFBSharedUtils
                                      rejectPromiseWithUserInfo:reject
                                                       userInfo:(NSMutableDictionary *)@{
                                                         @"code" : @"token-error",
                                                         @"message" : [error localizedDescription],
                                                       }];
                                  return;
                                }
                                if (token == nil) {
                                  DLog(@"Unable to retrieve Installations auth token.");
                                  [RNFBSharedUtils
                                      rejectPromiseWithUserInfo:reject
                                                       userInfo:(NSMutableDictionary *)@{
                                                         @"code" : @"token-null",
                                                         @"message" : @"no token fetched",
                                                       }];
                                  return;
                                }

                                resolve(token.authToken);
                              }];
}

@end
