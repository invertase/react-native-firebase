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

#import "RNFBStorageTask.h"
#import <Foundation/Foundation.h>


@implementation RNFBStorageTask

  static RNFBStorageTask *sharedInstance_;
  static NSMutableDictionary *pendingTasks_;

  + (void)load {
    sharedInstance_ = [[RNFBStorageTask alloc] init];
    pendingTasks_ = [[NSMutableDictionary alloc] init];
  }

  + (RNFBStorageTask *)shared {
    return sharedInstance_;
  }

  - (void)pauseTaskById:(int)id {
  }

  - (void)resumeTaskById:(int)id {
  }

  -(void)cancelTaskById:(int)id {
  }

@end