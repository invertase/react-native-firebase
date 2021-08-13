//
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

#import <Firebase/Firebase.h>
#import <RNFBFirestoreSerialize.h>
#import <React/RCTBridgeModule.h>

@interface RNFBFirestoreQuery : NSObject

@property FIRFirestore *firestore;
@property NSArray *filters;
@property NSArray *orders;
@property NSDictionary *options;
@property FIRQuery *query;

- (FIRQuery *)instance;

- (id)initWithModifiers:(FIRFirestore *)firestore
                  query:(FIRQuery *)query
                filters:(NSArray *)filters
                 orders:(NSArray *)orders
                options:(NSDictionary *)options;

@end
