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
#import <React/RCTEventEmitter.h>


/**
 * Listeners for Firebase events and emits them to the JS layer
 */
@interface RNFBRCTEventEmitter : NSObject

/**
 * The RCTBridge. Assigned by `RNFBAppModule`
 */
@property(nonatomic, weak) RCTBridge *bridge;

/**
 * Returns the shared instance
 *
 * @returns RNFBRCTEventEmitter.
 */
+ (RNFBRCTEventEmitter *)shared;

/**
 * Add an event listener
 *
 * @param eventName NSString event name.
 */
- (void)addListener:(NSString *)eventName;

/**
 * Removes event listeners
 */
- (void)removeListeners:(NSString *)eventName all:(BOOL)all;

/**
 * Send an event to JS with the specified name and body
 *
 */
- (void)sendEventWithName:(NSString *)eventName body:(id)body;

/**
 * Notify the event emitter that JS has loaded and is ready to receive events.
 *
 */
- (void)notifyJsReady:(BOOL)ready;

/**
 * Returns a dictionary of all registered events & counts. Mainly for testing.
 *
 * @return NSDictionary
 */
- (NSDictionary *)getListenersDictionary;
@end
