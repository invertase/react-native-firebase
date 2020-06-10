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

#import <Foundation/Foundation.h>
#import <React/RCTUtils.h>
#import <React/RCTBridgeModule.h>

@import AuthenticationServices;

@interface RNAppleAuthASAuthorizationDelegates : NSObject <ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding>

@property(nonatomic, strong, nullable) NSString *nonce;
@property(nonatomic, strong, nullable) void (^completion)(NSError *, NSDictionary *);

- (instancetype)initWithCompletion:(void (^)(NSError *error, NSDictionary *authorizationCredential))completion andNonce:(NSString *)nonce;

- (void)performRequestsForAuthorizationController:(ASAuthorizationController *)authorizationController;

@end

