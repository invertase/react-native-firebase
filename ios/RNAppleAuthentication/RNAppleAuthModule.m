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

#import "RNAppleAuthModule.h"
#import "RNAppleAuthASAuthorizationDelegates.h"

@implementation RNAppleAuthModule

#pragma mark - Module Setup

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"RNAppleAuth.onCredentialRevoked"];
}

- (NSDictionary *)constantsToExport {
  return @{
      @"isSupported": @available(iOS 13.0, *) ? @(YES) : @(NO),
      @"isSignUpButtonSupported": @available(iOS 13.2, *) ? @(YES) : @(NO),
  };
}

- (void)startObserving {
  [
      [NSNotificationCenter defaultCenter]
      addObserver:self
         selector:@selector(onCredentialRevoked)
             name:ASAuthorizationAppleIDProviderCredentialRevokedNotification
           object:nil
  ];
}

- (void)stopObserving {
  [
      [NSNotificationCenter defaultCenter]
      removeObserver:self
                name:ASAuthorizationAppleIDProviderCredentialRevokedNotification
              object:nil
  ];
}

#pragma mark - Module Methods

RCT_EXPORT_METHOD(getCredentialStateForUser:
  (NSString *) user
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  ASAuthorizationAppleIDProvider *appleIdProvider = [[ASAuthorizationAppleIDProvider alloc] init];
  id completionBlock = ^(ASAuthorizationAppleIDProviderCredentialState credentialState, NSError *_Nullable error) {
    if (error) {
      return reject([@(error.code) stringValue], error.localizedDescription, error);
    } else {
      resolve(@(credentialState));
    }
  };
  [appleIdProvider getCredentialStateForUserID:user completion:completionBlock];
}

RCT_EXPORT_METHOD(performRequest:
  (ASAuthorizationAppleIDRequest *) appleIdRequest
    :(RCTPromiseResolveBlock) resolve
    :(RCTPromiseRejectBlock) reject
) {
  ASAuthorizationController *authorizationController = [
      [ASAuthorizationController alloc] initWithAuthorizationRequests:@[
          appleIdRequest
      ]
  ];

  NSString *rawNonce = nil;
  if (appleIdRequest.nonce) {
    rawNonce = appleIdRequest.nonce;
    appleIdRequest.nonce = [RNAppleAuthUtils stringBySha256HashingString:rawNonce];
  }

  __block RNAppleAuthASAuthorizationDelegates *delegates = [
      [RNAppleAuthASAuthorizationDelegates alloc]
      initWithCompletion:^(NSError *error, NSDictionary *authorizationCredential) {
        if (error) {
          reject([@(error.code) stringValue], error.localizedDescription, error);
        } else {
          resolve(authorizationCredential);
        }
        delegates = nil;
      }
      andNonce:rawNonce
  ];

  [delegates performRequestsForAuthorizationController:authorizationController];
}

- (void)onCredentialRevoked {
  [self sendEventWithName:@"RNAppleAuth.onCredentialRevoked" body:[NSNull null]];
}

@end
