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

// See RNFBDatabaseModuleHelper.h for rationale: plain Objective-C helper
// that owns all `FIRDatabaseReference`/`FIRTransactionResult` calls and the
// pending-transaction bookkeeping for RNFBDatabaseTransactionModule.
@interface RNFBDatabaseTransactionHelper : NSObject

+ (void)transactionStart:(NSString *)app
                   dbURL:(NSString *)dbURL
                    path:(NSString *)path
           transactionId:(double)transactionId
            applyLocally:(BOOL)applyLocally;

+ (void)transactionTryCommit:(NSString *)app
                       dbURL:(NSString *)dbURL
               transactionId:(double)transactionId
                     updates:(NSDictionary *)updates;

+ (void)invalidate;

@end
