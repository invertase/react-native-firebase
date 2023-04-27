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
    if (filter[@"fieldPath"]) {
      NSArray *fieldPathArray = filter[@"fieldPath"];

      FIRFieldPath *fieldPath = [[FIRFieldPath alloc] initWithFields:fieldPathArray];
      NSString *operator= filter[@"operator"];
      id value = [RNFBFirestoreSerialize parseTypeMap:_firestore typeMap:filter[@"value"]];
      if ([operator isEqualToString:@"EQUAL"]) {
        _query = [_query queryWhereFieldPath:fieldPath isEqualTo:value];
      } else if ([operator isEqualToString:@"NOT_EQUAL"]) {
        _query = [_query queryWhereFieldPath:fieldPath isNotEqualTo:value];
      } else if ([operator isEqualToString:@"GREATER_THAN"]) {
        _query = [_query queryWhereFieldPath:fieldPath isGreaterThan:value];
      } else if ([operator isEqualToString:@"GREATER_THAN_OR_EQUAL"]) {
        _query = [_query queryWhereFieldPath:fieldPath isGreaterThanOrEqualTo:value];
      } else if ([operator isEqualToString:@"LESS_THAN"]) {
        _query = [_query queryWhereFieldPath:fieldPath isLessThan:value];
      } else if ([operator isEqualToString:@"LESS_THAN_OR_EQUAL"]) {
        _query = [_query queryWhereFieldPath:fieldPath isLessThanOrEqualTo:value];
      } else if ([operator isEqualToString:@"ARRAY_CONTAINS"]) {
        _query = [_query queryWhereFieldPath:fieldPath arrayContains:value];
      } else if ([operator isEqualToString:@"IN"]) {
        _query = [_query queryWhereFieldPath:fieldPath in:value];
      } else if ([operator isEqualToString:@"ARRAY_CONTAINS_ANY"]) {
        _query = [_query queryWhereFieldPath:fieldPath arrayContainsAny:value];
      } else if ([operator isEqualToString:@"NOT_IN"]) {
        _query = [_query queryWhereFieldPath:fieldPath notIn:value];
      }
    } else if (filter[@"operator"] && filter[@"queries"]) {
      // Filter query
      FIRFilter *generatedFilter = [self _applyFilterQueries:filter];
      _query = [_query queryWhereFilter:generatedFilter];
    } else {
      @throw
          [NSException exceptionWithName:@"InvalidOperator"
                                  reason:@"The correct signature for a filter has not been parsed"
                                userInfo:nil];
    }
  }
}

- (FIRFilter *)_applyFilterQueries:(NSDictionary<NSString *, id> *)map {
  if ([map objectForKey:@"fieldPath"]) {
    NSString *operator= map[@"operator"];
    NSArray *fieldPathArray = map[@"fieldPath"][@"_segments"];

    FIRFieldPath *fieldPath = [[FIRFieldPath alloc] initWithFields:fieldPathArray];
    id value = [RNFBFirestoreSerialize parseTypeMap:_firestore typeMap:map[@"value"]];

    if ([operator isEqualToString:@"EQUAL"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath isEqualTo:value];
    } else if ([operator isEqualToString:@"NOT_EQUAL"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath isNotEqualTo:value];
    } else if ([operator isEqualToString:@"LESS_THAN"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath isLessThan:value];
    } else if ([operator isEqualToString:@"LESS_THAN_OR_EQUAL"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath isLessThanOrEqualTo:value];
    } else if ([operator isEqualToString:@"GREATER_THAN"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath isGreaterThan:value];
    } else if ([operator isEqualToString:@"GREATER_THAN_OR_EQUAL"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath isGreaterThanOrEqualTo:value];
    } else if ([operator isEqualToString:@"ARRAY_CONTAINS"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath arrayContains:value];
    } else if ([operator isEqualToString:@"ARRAY_CONTAINS_ANY"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath arrayContainsAny:value];
    } else if ([operator isEqualToString:@"IN"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath in:value];
    } else if ([operator isEqualToString:@"NOT_IN"]) {
      return [FIRFilter filterWhereFieldPath:fieldPath notIn:value];
    } else {
      @throw [NSException exceptionWithName:@"InvalidOperator"
                                     reason:@"Invalid operator"
                                   userInfo:nil];
    }
  }

  NSString *op = map[@"operator"];
  NSArray<NSDictionary<NSString *, id> *> *queries = map[@"queries"];
  NSMutableArray<FIRFilter *> *parsedFilters = [NSMutableArray array];

  for (NSDictionary *query in queries) {
    [parsedFilters addObject:[self _applyFilterQueries:query]];
  }

  if ([op isEqual:@"AND"]) {
    return [FIRFilter andFilterWithFilters:parsedFilters];
  }

  if ([op isEqualToString:@"OR"]) {
    return [FIRFilter orFilterWithFilters:parsedFilters];
  }

  @throw [NSException exceptionWithName:@"InvalidOperator" reason:@"Invalid operator" userInfo:nil];
}

- (void)applyOrders {
  for (NSDictionary *order in _orders) {
    if ([order[@"fieldPath"] isKindOfClass:[NSArray class]]) {
      NSArray *fieldPathArray = order[@"fieldPath"];
      NSString *direction = order[@"direction"];
      bool isDescending = [direction isEqualToString:@"DESCENDING"];

      FIRFieldPath *fieldPath = [[FIRFieldPath alloc] initWithFields:fieldPathArray];

      _query = [_query queryOrderedByFieldPath:fieldPath descending:isDescending];

    } else {
      NSString *fieldPath = order[@"fieldPath"];
      NSString *direction = order[@"direction"];
      bool isDescending = [direction isEqualToString:@"DESCENDING"];

      _query = [_query queryOrderedByField:fieldPath descending:isDescending];
    }
  }
}

- (void)applyOptions {
  if (_options[@"limit"]) {
    _query = [_query queryLimitedTo:[_options[@"limit"] intValue]];
  }

  if (_options[@"limitToLast"]) {
    _query = [_query queryLimitedToLast:[_options[@"limitToLast"] intValue]];
  }

  if (_options[@"startAt"]) {
    NSArray *fieldList = [RNFBFirestoreSerialize parseNSArray:_firestore
                                                        array:_options[@"startAt"]];
    _query = [_query queryStartingAtValues:fieldList];
  }

  if (_options[@"startAfter"]) {
    NSArray *fieldList = [RNFBFirestoreSerialize parseNSArray:_firestore
                                                        array:_options[@"startAfter"]];
    _query = [_query queryStartingAfterValues:fieldList];
  }

  if (_options[@"endAt"]) {
    NSArray *fieldList = [RNFBFirestoreSerialize parseNSArray:_firestore array:_options[@"endAt"]];
    _query = [_query queryEndingAtValues:fieldList];
  }

  if (_options[@"endBefore"]) {
    NSArray *fieldList = [RNFBFirestoreSerialize parseNSArray:_firestore
                                                        array:_options[@"endBefore"]];
    _query = [_query queryEndingBeforeValues:fieldList];
  }
}

@end
