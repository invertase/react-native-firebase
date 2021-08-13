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

#import "RNFBDatabaseQuery.h"

@implementation RNFBDatabaseQuery

- (RNFBDatabaseQuery *)initWithReferenceAndModifiers:(FIRDatabaseReference *)reference
                                           modifiers:(NSArray *)modifiers {
  self = [super init];

  if (self) {
    _query = [self buildQueryWithModifiers:reference modifiers:modifiers];
    _listeners = [NSMutableDictionary dictionary];
  }

  return self;
}

- (FIRDatabaseQuery *)buildQueryWithModifiers:(FIRDatabaseReference *)reference
                                    modifiers:(NSArray *)modifiers {
  FIRDatabaseQuery *query = reference;

  for (NSDictionary *modifier in modifiers) {
    NSString *type = [modifier valueForKey:@"type"];
    NSString *name = [modifier valueForKey:@"name"];

    if ([type isEqualToString:@"orderBy"]) {
      if ([name isEqualToString:@"orderByKey"]) {
        query = [query queryOrderedByKey];
      } else if ([name isEqualToString:@"orderByPriority"]) {
        query = [query queryOrderedByPriority];
      } else if ([name isEqualToString:@"orderByValue"]) {
        query = [query queryOrderedByValue];
      } else if ([name isEqualToString:@"orderByChild"]) {
        NSString *key = [modifier valueForKey:@"key"];
        query = [query queryOrderedByChild:key];
      }
    } else if ([type isEqualToString:@"limit"]) {
      NSUInteger limit = [[modifier valueForKey:@"value"] unsignedIntValue];

      if ([name isEqualToString:@"limitToLast"]) {
        query = [query queryLimitedToLast:limit];
      } else if ([name isEqualToString:@"limitToFirst"]) {
        query = [query queryLimitedToFirst:limit];
      }
    } else if ([type isEqualToString:@"filter"]) {
      NSString *valueType = [modifier valueForKey:@"valueType"];
      NSString *key = [modifier valueForKey:@"key"];

      if ([name isEqualToString:@"startAt"]) {
        if ([valueType isEqualToString:@"null"]) {
          if (key != nil) {
            query = [query queryStartingAtValue:[NSNull null] childKey:key];
          } else {
            query = [query queryStartingAtValue:[NSNull null]];
          }
        } else {
          id value = [self getIdValue:[modifier valueForKey:@"value"] type:valueType];

          if (key != nil) {
            query = [query queryStartingAtValue:value childKey:key];
          } else {
            query = [query queryStartingAtValue:value];
          }
        }
      } else if ([name isEqualToString:@"endAt"]) {
        if ([valueType isEqualToString:@"null"]) {
          if (key != nil) {
            query = [query queryEndingAtValue:[NSNull null] childKey:key];
          } else {
            query = [query queryEndingAtValue:[NSNull null]];
          }
        } else {
          id value = [self getIdValue:[modifier valueForKey:@"value"] type:valueType];

          if (key != nil) {
            query = [query queryEndingAtValue:value childKey:key];
          } else {
            query = [query queryEndingAtValue:value];
          }
        }
      }
    }
  }

  return query;
}

- (id)getIdValue:(NSString *)value type:(NSString *)type {
  if ([type isEqualToString:@"number"]) {
    return @(value.doubleValue);
  } else if ([type isEqualToString:@"boolean"]) {
    return @(value.boolValue);
  } else {
    return value;
  }
}

- (void)addEventListener:(NSString *)eventRegistrationKey:(FIRDatabaseHandle)listener {
  _listeners[eventRegistrationKey] = @(listener);
}

- (void)removeEventListener:(NSString *)eventRegistrationKey {
  FIRDatabaseHandle handle = (FIRDatabaseHandle)[_listeners[eventRegistrationKey] integerValue];
  if (handle) {
    [_query removeObserverWithHandle:handle];
    [_listeners removeObjectForKey:eventRegistrationKey];
  }
}

- (void)removeAllEventListeners {
  NSArray *eventRegistrationKeys = [_listeners allKeys];

  for (NSString *eventRegistrationKey in eventRegistrationKeys) {
    [self removeEventListener:eventRegistrationKey];
  }
}

- (BOOL)hasEventListener:(NSString *)eventRegistrationKey {
  return _listeners[eventRegistrationKey] != nil;
}

- (BOOL)hasListeners {
  return [[_listeners allKeys] count] > 0;
}

@end
