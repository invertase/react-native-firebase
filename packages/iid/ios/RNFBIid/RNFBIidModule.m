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


@implementation RNFBIidModule
#pragma mark -
#pragma mark Module Setup

  RCT_EXPORT_MODULE();

#pragma mark -
#pragma mark Firebase Iid Methods

  RCT_EXPORT_METHOD(get:
    (FIRApp *) firebaseApp // unused, iOS does not have multi-app support per instance
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    [[FIRInstanceID instanceID] getIDWithHandler:^(NSString *_Nullable identity, NSError *_Nullable error) {
      if (error) {
        NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
        userInfo[@"code"] = [self getErrorCodeName:error];
        userInfo[@"message"] = [error localizedDescription];
        [RNFBSharedUtils rejectPromiseWithUserInfo:reject userInfo:userInfo];
      } else {
        resolve(identity);
      }
    }];
  }

  - (NSString *)getErrorCodeName:(NSError *)error {
    NSString *code = @"UNKNOWN";
    switch (error.code) {
      case FIRInstanceIDErrorUnknown:
        code = @"UNKNOWN";
        break;
      case FIRInstanceIDErrorAuthentication:
        code = @"FAILED-GCM-AUTH";
        break;
      case FIRInstanceIDErrorNoAccess:
        code = @"NO-ACCESS";
        break;
      case FIRInstanceIDErrorTimeout:
        code = @"TIMEOUT";
        break;
      case FIRInstanceIDErrorNetwork:
        code = @"NO-NETWORK";
        break;
      case FIRInstanceIDErrorOperationInProgress:
        code = @"OPERATION-IN-PROGRESS";
        break;
      case FIRInstanceIDErrorInvalidRequest:
        code = @"INVALID-REQUEST";
        break;
      default:
        break;
    }

    return code;
  }

@end
