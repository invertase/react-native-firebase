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

#import "RNFBSharedUtils.h"

#pragma mark -
#pragma mark Constants

NSString *const DEFAULT_APP_DISPLAY_NAME = @"[DEFAULT]";
NSString *const DEFAULT_APP_NAME = @"__FIRAPP_DEFAULT";

@implementation RNFBSharedUtils
  static NSString *const RNFBErrorDomain = @"RNFBErrorDomain";

#pragma mark -
#pragma mark Methods

  + (NSDictionary *)firAppToDictionary:(FIRApp *)firApp {
    FIROptions *firOptions = [firApp options];
    NSMutableDictionary *firAppDictionary = [NSMutableDictionary new];
    NSMutableDictionary *firAppOptions = [NSMutableDictionary new];
    NSMutableDictionary *firAppConfig = [NSMutableDictionary new];

    NSString *name = [firApp name];
    if ([name isEqualToString:DEFAULT_APP_NAME]) {
      name = DEFAULT_APP_DISPLAY_NAME;
    }

    firAppConfig[@"name"] = name;
    firAppConfig[@"automaticDataCollectionEnabled"] = @([firApp isDataCollectionDefaultEnabled]);

    firAppOptions[@"apiKey"] = firOptions.APIKey;
    firAppOptions[@"appId"] = firOptions.googleAppID;
    firAppOptions[@"projectId"] = firOptions.projectID;
    firAppOptions[@"databaseURL"] = firOptions.databaseURL;
    firAppOptions[@"gaTrackingId"] = firOptions.trackingID;
    firAppOptions[@"storageBucket"] = firOptions.storageBucket;
    firAppOptions[@"messagingSenderId"] = firOptions.GCMSenderID;
    // missing from android sdk - ios only:
    firAppOptions[@"clientId"] = firOptions.clientID;
    firAppOptions[@"androidClientID"] = firOptions.androidClientID;
    firAppOptions[@"deepLinkUrlScheme"] = firOptions.deepLinkURLScheme;

    firAppDictionary[@"options"] = firAppOptions;
    firAppDictionary[@"appConfig"] = firAppConfig;

    return firAppDictionary;
  }

  + (void)rejectPromiseWithExceptionDict:(RCTPromiseRejectBlock)reject exception:(NSException *)exception; {
    NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];

    [userInfo setValue:@(YES) forKey:@"fatal"];
    [userInfo setValue:@"unknown" forKey:@"code"];
    [userInfo setValue:exception.reason forKey:@"message"];
    [userInfo setValue:exception.name forKey:@"nativeErrorCode"];
    [userInfo setValue:exception.reason forKey:@"nativeErrorMessage"];

    NSError *error = [NSError errorWithDomain:RNFBErrorDomain code:666 userInfo:userInfo];

    // TODO hook into crashlytics - report as handled exception?

    reject(exception.name, exception.reason, error);
  }

  + (void)rejectPromiseWithUserInfo:(RCTPromiseRejectBlock)reject userInfo:(NSMutableDictionary *)userInfo; {
    NSError *error = [NSError errorWithDomain:RNFBErrorDomain code:666 userInfo:userInfo];

    // TODO hook into crashlytics - report as handled exception?

    reject(userInfo[@"code"], userInfo[@"message"], error);
  }
@end