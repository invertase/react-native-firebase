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

#import "RNFBFirestoreSerialize.h"
#import "RNFBFirestoreCommon.h"
#import "RNFBPreferences.h"

@implementation RNFBFirestoreSerialize

static NSString *const KEY_PATH = @"path";
static NSString *const KEY_DATA = @"data";
static NSString *const KEY_EXISTS = @"exists";
static NSString *const KEY_CHANGES = @"changes";
static NSString *const KEY_METADATA = @"metadata";
static NSString *const KEY_DOCUMENTS = @"documents";
static NSString *const KEY_DOC_CHANGE_TYPE = @"type";
static NSString *const KEY_DOC_CHANGE_DOCUMENT = @"doc";
static NSString *const KEY_DOC_CHANGE_NEW_INDEX = @"ni";
static NSString *const KEY_DOC_CHANGE_OLD_INDEX = @"oi";

// Document Change Types
static NSString *const CHANGE_ADDED = @"a";
static NSString *const CHANGE_MODIFIED = @"m";
static NSString *const CHANGE_REMOVED = @"r";

enum TYPE_MAP {
  INT_NAN,
  INT_NEGATIVE_INFINITY,
  INT_POSITIVE_INFINITY,
  INT_NULL,
  INT_DOCUMENTID,
  INT_BOOLEAN_TRUE,
  INT_BOOLEAN_FALSE,
  INT_DOUBLE,
  INT_STRING,
  INT_STRING_EMPTY,
  INT_ARRAY,
  INT_REFERENCE,
  INT_GEOPOINT,
  INT_TIMESTAMP,
  INT_BLOB,
  INT_FIELDVALUE,
  INT_OBJECT,
  INT_INTEGER,
  INT_NEGATIVE_ZERO,
  INT_UNKNOWN = -999,
};

// Native QuerySnapshot -> NSDictionary (for JS)
+ (NSDictionary *)querySnapshotToDictionary:(NSString *)source
                                   snapshot:(FIRQuerySnapshot *)snapshot
                     includeMetadataChanges:(BOOL)includeMetadataChanges
                                    appName:(NSString *)appName {
  NSMutableArray *metadata = [[NSMutableArray alloc] init];
  NSMutableDictionary *snapshotMap = [[NSMutableDictionary alloc] init];

  snapshotMap[@"source"] = source;

  NSMutableArray *changes = [[NSMutableArray alloc] init];

  FIRSnapshotMetadata *snapshotMetadata = snapshot.metadata;
  NSArray *documentSnapshots = snapshot.documents;
  NSArray *documentChangesList = snapshot.documentChanges;

  if (includeMetadataChanges == false) {
    // If not listening to metadata changes, send the data back to JS land with a flag
    // indicating the data does not include these changes
    snapshotMap[@"excludesMetadataChanges"] = @(true);
    for (FIRDocumentChange *documentChange in documentChangesList) {
      [changes addObject:[self documentChangeToDictionary:documentChange
                                         isMetadataChange:false
                                                  appName:appName]];
    }
  } else {
    // If listening to metadata changes, get the changes list with document changes array.
    // To indicate whether a document change was because of metadata change, we check whether
    // its in the raw list by document key.
    snapshotMap[@"excludesMetadataChanges"] = @(false);
    NSArray *documentMetadataChangesList =
        [snapshot documentChangesWithIncludeMetadataChanges:true];

    for (FIRDocumentChange *documentMetadataChange in documentMetadataChangesList) {
      bool isMetadataChange = NO;

      NSPredicate *predicate = [NSPredicate
          predicateWithBlock:^BOOL(FIRDocumentChange *docChange, NSDictionary *bindings) {
            if ([[[docChange document] documentID]
                    isEqualToString:[[documentMetadataChange document] documentID]] &&
                [docChange newIndex] == [documentMetadataChange newIndex] &&
                [docChange oldIndex] == [documentMetadataChange oldIndex] &&
                [docChange type] == [documentMetadataChange type]) {
              return YES;
            }

            return NO;
          }];

      FIRDocumentChange *exists =
          [documentChangesList filteredArrayUsingPredicate:predicate].firstObject;

      if (exists == nil) {
        isMetadataChange = YES;
      }

      [changes addObject:[self documentChangeToDictionary:documentMetadataChange
                                         isMetadataChange:isMetadataChange
                                                  appName:appName]];
    }
  }

  snapshotMap[KEY_CHANGES] = changes;

  // set documents
  NSMutableArray *documents = [[NSMutableArray alloc] init];
  for (FIRDocumentSnapshot *documentSnapshot in documentSnapshots) {
    [documents addObject:[self documentSnapshotToDictionary:documentSnapshot appName:appName]];
  }
  snapshotMap[KEY_DOCUMENTS] = documents;

  // set metadata
  // build metadata array: 0 = fromCache, 1 = hasPendingWrites
  metadata[0] = @(snapshotMetadata.fromCache);
  metadata[1] = @(snapshotMetadata.hasPendingWrites);
  snapshotMap[KEY_METADATA] = metadata;

  return snapshotMap;
}

+ (NSDictionary *)documentChangeToDictionary:(FIRDocumentChange *)documentChange
                            isMetadataChange:(BOOL)isMetadataChange
                                     appName:(NSString *)appName {
  NSMutableDictionary *changeMap = [[NSMutableDictionary alloc] init];
  changeMap[@"isMetadataChange"] = @(isMetadataChange);

  if (documentChange.type == FIRDocumentChangeTypeAdded) {
    changeMap[KEY_DOC_CHANGE_TYPE] = CHANGE_ADDED;
  } else if (documentChange.type == FIRDocumentChangeTypeModified) {
    changeMap[KEY_DOC_CHANGE_TYPE] = CHANGE_MODIFIED;
  } else {
    changeMap[KEY_DOC_CHANGE_TYPE] = CHANGE_REMOVED;
  }

  changeMap[KEY_DOC_CHANGE_DOCUMENT] = [self documentSnapshotToDictionary:documentChange.document
                                                                  appName:appName];

  // Note the Firestore C++ SDK here returns a maxed UInt that is != NSUIntegerMax, so we make one
  // ourselves so we can convert to -1 for JS land
  NSUInteger MAX_VAL = (NSUInteger)[@(-1) integerValue];
  if (documentChange.newIndex == NSNotFound || documentChange.newIndex == 4294967295 ||
      documentChange.newIndex == MAX_VAL) {
    changeMap[KEY_DOC_CHANGE_NEW_INDEX] = @([@(-1) doubleValue]);
  } else {
    changeMap[KEY_DOC_CHANGE_NEW_INDEX] = @([@(documentChange.newIndex) doubleValue]);
  }

  if (documentChange.oldIndex == NSNotFound || documentChange.oldIndex == 4294967295 ||
      documentChange.oldIndex == MAX_VAL) {
    changeMap[KEY_DOC_CHANGE_OLD_INDEX] = @([@(-1) doubleValue]);
  } else {
    changeMap[KEY_DOC_CHANGE_OLD_INDEX] = @([@(documentChange.oldIndex) doubleValue]);
  }

  return changeMap;
}

// Native DocumentSnapshot -> NSDictionary (for JS)
+ (NSDictionary *)documentSnapshotToDictionary:(FIRDocumentSnapshot *)snapshot
                                       appName:(NSString *)appName {
  NSMutableArray *metadata = [[NSMutableArray alloc] init];
  NSMutableDictionary *documentMap = [[NSMutableDictionary alloc] init];

  // build metadata array: 0 = fromCache, 1 = hasPendingWrites
  metadata[0] = @(snapshot.metadata.fromCache);
  metadata[1] = @(snapshot.metadata.hasPendingWrites);
  documentMap[KEY_METADATA] = metadata;

  documentMap[KEY_PATH] = snapshot.reference.path;
  documentMap[KEY_EXISTS] = @(snapshot.exists);

  if (snapshot.exists) {
    NSString *key =
        [NSString stringWithFormat:@"%@_%@", FIRESTORE_SERVER_TIMESTAMP_BEHAVIOR, appName];
    NSString *behavior = [[RNFBPreferences shared] getStringValue:key defaultValue:@"none"];

    FIRServerTimestampBehavior serverTimestampBehavior;

    if ([behavior isEqualToString:@"estimate"]) {
      serverTimestampBehavior = FIRServerTimestampBehaviorEstimate;
    } else if ([behavior isEqualToString:@"previous"]) {
      serverTimestampBehavior = FIRServerTimestampBehaviorPrevious;
    } else {
      serverTimestampBehavior = FIRServerTimestampBehaviorNone;
    }

    NSDictionary *data = [snapshot dataWithServerTimestampBehavior:serverTimestampBehavior];
    documentMap[KEY_DATA] = [self serializeDictionary:data];
  }

  return documentMap;
}

// Converts a Native Dictionary to JS map
+ (NSDictionary *)serializeDictionary:(NSDictionary *)dictionary {
  NSMutableDictionary *dictValues = [[NSMutableDictionary alloc] init];

  [dictionary
      enumerateKeysAndObjectsUsingBlock:^(id _Nonnull key, id _Nonnull obj, BOOL *_Nonnull stop) {
        dictValues[key] = [self buildTypeMap:obj];
      }];

  return dictValues;
}

+ (NSArray *)serializeArray:(NSArray *)array {
  NSMutableArray *arrayValues = [[NSMutableArray alloc] init];

  [array enumerateObjectsUsingBlock:^(id _Nonnull obj, NSUInteger idx, BOOL *_Nonnull stop) {
    arrayValues[idx] = [self buildTypeMap:obj];
  }];

  return arrayValues;
}

// Native value to JS map
+ (NSArray *)buildTypeMap:(id)value {
  NSMutableArray *typeArray = [[NSMutableArray alloc] init];

  // null
  if (value == nil || [value isKindOfClass:[NSNull class]]) {
    typeArray[0] = @(INT_NULL);
    return typeArray;
  }

  // String
  if ([value isKindOfClass:[NSString class]]) {
    if ([value length] == 0) {
      typeArray[0] = @(INT_STRING_EMPTY);
    } else {
      typeArray[0] = @(INT_STRING);
      typeArray[1] = value;
    }
    return typeArray;
  }

  // Object
  if ([value isKindOfClass:[NSDictionary class]]) {
    typeArray[0] = @(INT_OBJECT);
    typeArray[1] = [self serializeDictionary:value];
    return typeArray;
  }

  // Array
  if ([value isKindOfClass:[NSArray class]]) {
    typeArray[0] = @(INT_ARRAY);
    typeArray[1] = [self serializeArray:value];
    return typeArray;
  }

  // DocumentReference
  if ([value isKindOfClass:[FIRDocumentReference class]]) {
    typeArray[0] = @(INT_REFERENCE);
    FIRDocumentReference *ref = (FIRDocumentReference *)value;
    typeArray[1] = [ref path];
    return typeArray;
  }

  // GeoPoint
  if ([value isKindOfClass:[FIRGeoPoint class]]) {
    typeArray[0] = @(INT_GEOPOINT);
    NSMutableArray *geoPointArray = [[NSMutableArray alloc] init];
    FIRGeoPoint *geoPoint = (FIRGeoPoint *)value;
    geoPointArray[0] = @([geoPoint latitude]);
    geoPointArray[1] = @([geoPoint longitude]);
    typeArray[1] = geoPointArray;
    return typeArray;
  }

  // Timestamp
  if ([value isKindOfClass:[FIRTimestamp class]]) {
    typeArray[0] = @(INT_TIMESTAMP);
    NSMutableArray *timestampArray = [[NSMutableArray alloc] init];
    FIRTimestamp *firTimestamp = (FIRTimestamp *)value;
    int64_t seconds = (int64_t)firTimestamp.seconds;
    int32_t nanoseconds = (int32_t)firTimestamp.nanoseconds;
    timestampArray[0] = @(seconds);
    timestampArray[1] = @(nanoseconds);
    typeArray[1] = timestampArray;
    return typeArray;
  }

  // number / boolean / infinity / nan
  if ([value isKindOfClass:[NSNumber class]]) {
    NSNumber *number = (NSNumber *)value;

    // Infinity
    if ([number isEqual:@(INFINITY)]) {
      typeArray[0] = @(INT_POSITIVE_INFINITY);
      return typeArray;
    }

    // -Infinity
    if ([number isEqual:@(-INFINITY)]) {
      typeArray[0] = @(INT_NEGATIVE_INFINITY);
      return typeArray;
    }

    // Boolean True
    if (number == [NSValue valueWithPointer:(void *)kCFBooleanTrue]) {
      typeArray[0] = @(INT_BOOLEAN_TRUE);
      return typeArray;
    }

    // Boolean False
    if (number == [NSValue valueWithPointer:(void *)kCFBooleanFalse]) {
      typeArray[0] = @(INT_BOOLEAN_FALSE);
      return typeArray;
    }

    // NaN
    if ([[value description].lowercaseString isEqual:@"nan"]) {
      typeArray[0] = @(INT_NAN);
      return typeArray;
    }

    // Number
    typeArray[0] = @(INT_DOUBLE);
    typeArray[1] = value;
    return typeArray;
  }

  // Blob / Base64
  if ([value isKindOfClass:[NSData class]]) {
    NSData *blob = (NSData *)value;
    typeArray[0] = @(INT_BLOB);
    typeArray[1] = [blob base64EncodedStringWithOptions:0];
    return typeArray;
  }

  typeArray[0] = @(INT_UNKNOWN);
  return typeArray;
}

// Parses JS Object into Native Dict
+ (NSDictionary *)parseNSDictionary:(FIRFirestore *)firestore
                         dictionary:(NSDictionary *)dictionary {
  NSMutableDictionary *dictValues = [[NSMutableDictionary alloc] init];

  if (dictionary == nil) return dictValues;

  [dictionary
      enumerateKeysAndObjectsUsingBlock:^(id _Nonnull key, id _Nonnull obj, BOOL *_Nonnull stop) {
        dictValues[key] = [self parseTypeMap:firestore typeMap:obj];
      }];

  return dictValues;
}

// Parses JS Array to Native Array
+ (NSArray *)parseNSArray:(FIRFirestore *)firestore array:(NSArray *)array {
  NSMutableArray *arrayValues = [[NSMutableArray alloc] init];

  if (array == nil) return arrayValues;

  [array enumerateObjectsUsingBlock:^(id _Nonnull obj, NSUInteger idx, BOOL *_Nonnull stop) {
    [arrayValues addObject:[self parseTypeMap:firestore typeMap:obj]];
  }];

  return arrayValues;
}

// Converts a JS array [INT, value] to native value
+ (id)parseTypeMap:(FIRFirestore *)firestore typeMap:(NSArray *)typeMap {
  NSInteger value = [typeMap[0] integerValue];

  switch (value) {
    case INT_NAN:
      return @(NAN);
    case INT_NEGATIVE_INFINITY:
      return @(-INFINITY);
    case INT_POSITIVE_INFINITY:
      return @(INFINITY);
    case INT_NULL:
      return [NSNull null];
    case INT_DOCUMENTID:
      return [FIRFieldPath documentID];
    case INT_BOOLEAN_TRUE:
      return @(YES);
    case INT_BOOLEAN_FALSE:
      return @(NO);
    case INT_NEGATIVE_ZERO:
      return @(-0.0);
    case INT_INTEGER:
      return @([typeMap[1] longLongValue]);
    case INT_DOUBLE:
      return @([typeMap[1] doubleValue]);
    case INT_STRING:
      return typeMap[1];
    case INT_STRING_EMPTY:
      return @"";
    case INT_ARRAY:
      return [self parseNSArray:firestore array:typeMap[1]];
    case INT_REFERENCE:
      return [firestore documentWithPath:typeMap[1]];
    case INT_GEOPOINT: {
      NSArray *geopoint = typeMap[1];
      return [[FIRGeoPoint alloc] initWithLatitude:[geopoint[0] doubleValue]
                                         longitude:[geopoint[1] doubleValue]];
    }
    case INT_TIMESTAMP: {
      NSArray *timestamp = typeMap[1];
      int64_t seconds = [timestamp[0] longLongValue];
      int32_t nanoseconds = [timestamp[1] intValue];
      return [[FIRTimestamp alloc] initWithSeconds:seconds nanoseconds:nanoseconds];
    }
    case INT_BLOB:
      return [[NSData alloc] initWithBase64EncodedData:typeMap[1] options:0];
    case INT_FIELDVALUE: {
      NSArray *fieldValueArray = typeMap[1];
      NSString *fieldValueType = fieldValueArray[0];

      if ([fieldValueType isEqualToString:@"timestamp"]) {
        return [FIRFieldValue fieldValueForServerTimestamp];
      }

      if ([fieldValueType isEqualToString:@"increment"]) {
        return [FIRFieldValue fieldValueForDoubleIncrement:[fieldValueArray[1] doubleValue]];
      }

      if ([fieldValueType isEqualToString:@"delete"]) {
        return [FIRFieldValue fieldValueForDelete];
      }

      if ([fieldValueType isEqualToString:@"array_union"]) {
        NSArray *elements = [self parseNSArray:firestore array:fieldValueArray[1]];
        return [FIRFieldValue fieldValueForArrayUnion:elements];
      }

      if ([fieldValueType isEqualToString:@"array_remove"]) {
        NSArray *elements = [self parseNSArray:firestore array:fieldValueArray[1]];
        return [FIRFieldValue fieldValueForArrayRemove:elements];
      }

      return nil;
    }
    case INT_OBJECT:
      return [self parseNSDictionary:firestore dictionary:typeMap[1]];
    case INT_UNKNOWN:
    default:
      return nil;
  }
}

@end
