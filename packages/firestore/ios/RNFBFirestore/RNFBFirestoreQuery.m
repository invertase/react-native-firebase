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

#import "RNFBFirestoreQuery.h"

@implementation RNFBFirestoreQuery

- (id)initWithModifiers:(FIRFirestore *)firestore
                  query:(FIRQuery *)query
                filters:(NSArray *)filters
                 orders:(NSArray *)orders
                options:(NSDictionary *)options {
  self = [super init];

  if (self) {
    _firestore = firestore;
    _filters = filters;
    _orders = orders;
    _options = options;
    _query = query;
    [self buildQuery];
  }

  return self;
}

- (FIRQuery *)instance {
  return _query;
}

- (void)buildQuery {
  [self applyFilters];
  [self applyOrders];
  [self applyOptions];
}

- (void)applyFilters {
  for (NSDictionary *filter in _filters) {
    NSString *fieldPath = filter[@"fieldPath"];
    NSString *operator = filter[@"operator"];
    id value = [RNFBFirestoreSerialize parseTypeMap:_firestore typeMap:filter[@"value"]];

    if ([operator isEqualToString:@"EQUAL"]) {
      _query = [_query queryWhereField:fieldPath isEqualTo:value];
    } else if ([operator isEqualToString:@"GREATER_THAN"]) {
      _query = [_query queryWhereField:fieldPath isGreaterThan:value];
    } else if ([operator isEqualToString:@"GREATER_THAN_OR_EQUAL"]) {
      _query = [_query queryWhereField:fieldPath isGreaterThanOrEqualTo:value];
    } else if ([operator isEqualToString:@"LESS_THAN"]) {
      _query = [_query queryWhereField:fieldPath isLessThan:value];
    } else if ([operator isEqualToString:@"LESS_THAN_OR_EQUAL"]) {
      _query = [_query queryWhereField:fieldPath isLessThanOrEqualTo:value];
    } else if ([operator isEqualToString:@"ARRAY_CONTAINS"]) {
      _query = [_query queryWhereField:fieldPath arrayContains:value];
    }
  }
}

- (void)applyOrders {
  for (NSDictionary *order in _orders) {
    NSString *fieldPath = order[@"fieldPath"];
    NSString *direction = order[@"direction"];
    bool isDescending = [direction isEqualToString:@"DESCENDING"];

    _query = [_query queryOrderedByField:fieldPath descending:isDescending];
  }
}

- (void)applyOptions {
  if (_options[@"limit"]) {
    _query = [_query queryLimitedTo:[_options[@"limit"] intValue]];
  }

  if (_options[@"startAt"]) {
    NSArray *fieldList = [RNFBFirestoreSerialize parseNSArray:_firestore array:_options[@"startAt"]];
    _query = [_query queryStartingAtValues:fieldList];
  }

  if (_options[@"startAfter"]) {
    NSArray *fieldList = [RNFBFirestoreSerialize parseNSArray:_firestore array:_options[@"startAfter"]];
    _query = [_query queryStartingAfterValues:fieldList];
  }

  if (_options[@"endAt"]) {
    NSArray *fieldList = [RNFBFirestoreSerialize parseNSArray:_firestore array:_options[@"endAt"]];
    _query = [_query queryEndingAtValues:fieldList];
  }

  if (_options[@"endBefore"]) {
    NSArray *fieldList = [RNFBFirestoreSerialize parseNSArray:_firestore array:_options[@"endBefore"]];
    _query = [_query queryEndingBeforeValues:fieldList];
  }
}

@end