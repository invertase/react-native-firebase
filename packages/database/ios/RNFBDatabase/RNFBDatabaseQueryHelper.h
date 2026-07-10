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
#import <React/RCTBridgeModule.h>

// See RNFBDatabaseModuleHelper.h for rationale: plain Objective-C helper
// that owns all `FIRDatabaseQuery`/`FIRDataSnapshot` calls and the query
// listener bookkeeping for RNFBDatabaseQueryModule.
@interface RNFBDatabaseQueryHelper : NSObject

+ (void)once:(NSString *)app
        dbURL:(NSString *)dbURL
         path:(NSString *)path
    modifiers:(NSArray *)modifiers
    eventType:(NSString *)eventType
      resolve:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject;

+ (void)on:(NSString *)app dbURL:(NSString *)dbURL props:(NSDictionary *)props;

+ (void)off:(NSString *)queryKey eventRegistrationKey:(NSString *)eventRegistrationKey;

+ (void)keepSynced:(NSString *)app
             dbURL:(NSString *)dbURL
               key:(NSString *)key
              path:(NSString *)path
         modifiers:(NSArray *)modifiers
           enabled:(BOOL)value
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;

+ (void)invalidate;

@end
