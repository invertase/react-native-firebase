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

#import "RCTConvert+ASAuthorizationAppleIDRequest.h"
#import "RNAppleAuthUtils.h"

@implementation RCTConvert (ASAuthorizationAppleIDRequest)
+ (ASAuthorizationAppleIDRequest *)appIdRequestFromDictionary:(NSDictionary *)requestOptions {
  ASAuthorizationAppleIDProvider *appleIdProvider = [[ASAuthorizationAppleIDProvider alloc] init];
  ASAuthorizationAppleIDRequest *appleIdRequest = [appleIdProvider createRequest];

  appleIdRequest.requestedOperation = [
      self authorizationOperationForInteger:[requestOptions valueForKey:@"requestedOperation"]
  ];

  appleIdRequest.requestedScopes = [
      self authorizationScopesForNSArray:[
          requestOptions valueForKey:@"requestedScopes"
      ]
  ];

  if ([requestOptions valueForKey:@"state"] != nil) {
    appleIdRequest.state = [requestOptions valueForKey:@"state"];
  }

  if ([requestOptions valueForKey:@"user"] != nil) {
    appleIdRequest.user = [requestOptions valueForKey:@"user"];
  }

  if (![[requestOptions valueForKey:@"nonceEnabled"] isEqual:@(NO)]) {
    if ([requestOptions valueForKey:@"nonce"] != nil) {
      appleIdRequest.nonce = [requestOptions valueForKey:@"nonce"];
    } else {
      appleIdRequest.nonce = [RNAppleAuthUtils randomNonce:32];
    }
  }

  return appleIdRequest;
}

+ (ASAuthorizationOpenIDOperation)authorizationOperationForInteger:(NSNumber *)operationInteger {
  if ([operationInteger intValue] == 0) {
    return ASAuthorizationOperationImplicit;
  } else if ([operationInteger intValue] == 1) {
    return ASAuthorizationOperationLogin;
  } else if ([operationInteger intValue] == 2) {
    return ASAuthorizationOperationRefresh;
  } else if ([operationInteger intValue] == 3) {
    return ASAuthorizationOperationLogout;
  }

  NSLog(@"RNAppleAuth -> Unknown operationInteger, defaulting to ASAuthorizationOperationImplicit");
  return ASAuthorizationOperationImplicit;
}

+ (NSArray<ASAuthorizationScope> *)authorizationScopesForNSArray:(NSArray *)scopesArray {
  NSMutableArray *scopesArrayConverted = [NSMutableArray arrayWithCapacity:scopesArray.count];
  [scopesArray enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
    int scopeInt = [obj intValue];
    if (scopeInt == 0) {
      [scopesArrayConverted addObject:ASAuthorizationScopeEmail];
    } else if (scopeInt == 1) {
      [scopesArrayConverted addObject:ASAuthorizationScopeFullName];
    } else {
      NSLog(@"RNAppleAuth -> Unknown scopeInt, excluding scope from authorizationScopesForNSArray output");
    }
  }];
  return scopesArrayConverted;
}

RCT_CUSTOM_CONVERTER(ASAuthorizationAppleIDRequest *, ASAuthorizationAppleIDRequest, [self appIdRequestFromDictionary:[self NSDictionary:json]]);

@end
