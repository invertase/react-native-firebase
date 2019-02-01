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

  RCT_EXPORT_METHOD(logEvent:
    (NSString *) name
        params:
        (NSDictionary *) params
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    @try {
      [FIRAnalytics logEventWithName:name parameters:params];
    } @catch (NSException *exception) {
      return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
    }

    return resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(setAnalyticsCollectionEnabled:
    (BOOL) enabled
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    @try {
      [[FIRAnalyticsConfiguration sharedInstance] setAnalyticsCollectionEnabled:enabled];
    } @catch (NSException *exception) {
      return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
    }

    return resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(setCurrentScreen:
    (NSString *) screenName
        screenClass:
        (NSString *) screenClassOverview
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    RCTUnsafeExecuteOnMainQueueSync(^{
      @try {
        [FIRAnalytics setScreenName:screenName screenClass:screenClassOverview];
      } @catch (NSException *exception) {
        return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
      }
      return resolve([NSNull null]);
    });
  }

  RCT_EXPORT_METHOD(setUserId:
    (NSString *) id
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    @try {
      [FIRAnalytics setUserID:id];
    } @catch (NSException *exception) {
      return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
    }
    return resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(setUserProperty:
    (NSString *) name
        value:
        (NSString *) value
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    @try {
      [FIRAnalytics setUserPropertyString:value forName:name];
    } @catch (NSException *exception) {
      return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
    }
    return resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(setUserProperties:
    (NSDictionary *) properties
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    @try {
      [properties enumerateKeysAndObjectsUsingBlock:^(id key, id value, BOOL *stop) {
        [FIRAnalytics setUserPropertyString:value forName:key];
      }];
    } @catch (NSException *exception) {
      return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
    }
    return resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(resetAnalyticsData:
    (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    @try {
      [FIRAnalytics resetAnalyticsData];
    } @catch (NSException *exception) {
      return [RNFBSharedUtils rejectPromiseWithExceptionDict:reject exception:exception];
    }
    return resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(setMinimumSessionDuration:
    (double) milliseconds
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    // Do nothing - this only exists in android
    return resolve([NSNull null]);
  }

  RCT_EXPORT_METHOD(setSessionTimeoutDuration:
    (double) milliseconds
        resolver:
        (RCTPromiseResolveBlock) resolve
        rejecter:
        (RCTPromiseRejectBlock) reject) {
    // Do nothing - this only exists in android
    return resolve([NSNull null]);
  }

@end
