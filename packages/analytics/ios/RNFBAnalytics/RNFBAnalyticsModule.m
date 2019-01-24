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

#import "RNFBAnalyticsModule.h"
#import "RNFBApp/RNFBRCTEventEmitter.h"
#import "RNFBApp/RNFBSharedUtils.h"


@implementation RNFBAnalyticsModule

#pragma mark -
#pragma mark Module Setup

  RCT_EXPORT_MODULE();

  - (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
  }

#pragma mark -
#pragma mark Firebase Analytics Methods

  // TODO Promises

  RCT_EXPORT_METHOD(logEvent:(NSString *)name props:(NSDictionary *)props) {
    [FIRAnalytics logEventWithName:name parameters:props];
  }

  RCT_EXPORT_METHOD(setAnalyticsCollectionEnabled:(BOOL) enabled) {
    [[FIRAnalyticsConfiguration sharedInstance] setAnalyticsCollectionEnabled:enabled];
  }

  RCT_EXPORT_METHOD(setCurrentScreen:(NSString *) screenName screenClass:(NSString *) screenClassOverview) {
    RCTUnsafeExecuteOnMainQueueSync(^{
      [FIRAnalytics setScreenName:screenName screenClass:screenClassOverview];
    });
  }

  RCT_EXPORT_METHOD(setUserId: (NSString *) id) {
    [FIRAnalytics setUserID:id];
  }

  RCT_EXPORT_METHOD(setUserProperty: (NSString *) name value:(NSString *) value) {
    [FIRAnalytics setUserPropertyString:value forName:name];
  }

  RCT_EXPORT_METHOD(setUserProperties:(NSDictionary *)properties) {
//    [FIRAnalytics setUserPropertyString:value forName:name];
  }

  // TODO setMinimumSessionDuration
  // TODO setSessionTimeoutDuration

@end
