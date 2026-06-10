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

#import "RNFBApp/RNFBSharedUtils.h"
#import "RNFBPnvModule.h"

static NSString *const UNSUPPORTED_MSG =
    @"Firebase Phone Number Verification is only supported on Android.";

@implementation RNFBPnvModule

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(enableTestSession
                  : (NSString *)token
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  reject(@"unsupported", UNSUPPORTED_MSG, nil);
}

RCT_EXPORT_METHOD(getVerificationSupportInfo
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  reject(@"unsupported", UNSUPPORTED_MSG, nil);
}

RCT_EXPORT_METHOD(getVerifiedPhoneNumber
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  reject(@"unsupported", UNSUPPORTED_MSG, nil);
}

RCT_EXPORT_METHOD(getDigitalCredentialPayload
                  : (NSString *)nonce
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  reject(@"unsupported", UNSUPPORTED_MSG, nil);
}

RCT_EXPORT_METHOD(exchangeCredentialResponseForPhoneNumber
                  : (NSString *)dcApiResponse
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject) {
  reject(@"unsupported", UNSUPPORTED_MSG, nil);
}

@end
