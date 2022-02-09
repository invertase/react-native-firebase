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

@interface RNFBPreferences : NSObject

- (BOOL)contains:(NSString *)key;

- (BOOL)getBooleanValue:(NSString *)key defaultValue:(BOOL)defaultValue;

- (void)setBooleanValue:(NSString *)key boolValue:(BOOL)boolValue;

- (void)setIntegerValue:(NSString *)key integerValue:(NSInteger)integerValue;

- (void)setStringValue:(NSString *)key stringValue:(NSString *)stringValue;

- (NSString *)getStringValue:(NSString *)key defaultValue:(NSString *)defaultValue;

- (NSInteger)getIntegerValue:(NSString *)key defaultValue:(NSInteger)defaultValue;

- (NSDictionary *)getAll;

- (void)clearAll;

- (void)remove:(NSString *)key;

+ (RNFBPreferences *)shared;

@end
