#import "RNFirebaseFirestoreDocumentReference.h"

@implementation RNFirebaseFirestoreDocumentReference

#if __has_include(<FirebaseFirestore/FirebaseFirestore.h>)

  static NSMutableDictionary *_listeners;
  static NSString *const typeKey = @"type";
  static NSString *const keyPath = @"path";
  static NSString *const keyData = @"data";
  static NSString *const keyError = @"error";
  static NSString *const valueKey = @"value";
  static NSString *const keyMerge = @"merge";
  static NSString *const keyAppName = @"appName";
  static NSString *const keySeconds = @"seconds";
  static NSString *const keyLatitude = @"latitude";
  static NSString *const keyMetadata = @"metadata";
  static NSString *const keyLongitude = @"longitude";
  static NSString *const keyFromCache = @"fromCache";
  static NSString *const keyListenerId = @"listenerId";
  static NSString *const keyNanoSeconds = @"nanoseconds";
  static NSString *const keyDocumentSnapshot = @"documentSnapshot";
  static NSString *const keyHasPendingWrites = @"hasPendingWrites";
  static NSString *const keyIncludeMetaChanges = @"includeMetadataChanges";

  static NSString *const typeNaN = @"nan";
  static NSString *const typeNull = @"null";
  static NSString *const typeBlob = @"blob";
  static NSString *const typeDate = @"date";
  static NSString *const typeArray = @"array";
  static NSString *const typeObject = @"object";
  static NSString *const typeString = @"string";
  static NSString *const typeNumber = @"number";
  static NSString *const typeDelete = @"delete";
  static NSString *const typeBoolean = @"boolean";
  static NSString *const typeInfinity = @"infinity";
  static NSString *const typeGeoPoint = @"geopoint";
  static NSString *const typeTimestamp = @"timestamp";
  static NSString *const typeReference = @"reference";
  static NSString *const typeDocumentId = @"documentid";
  static NSString *const typeFieldValue = @"fieldvalue";
  static NSString *const typeFieldValueUnion = @"union";
  static NSString *const typeFieldValueRemove = @"remove";
  static NSString *const typeFieldValueType = @"type";
  static NSString *const typeFieldValueElements = @"elements";
  static NSString *const typeFieldValueIncrement = @"increment";


  - (id)initWithPath:(RCTEventEmitter *)emitter
      appDisplayName:(NSString *)appDisplayName
                path:(NSString *)path {
    self = [super init];

    if (self) {
      _emitter = emitter;
      _appDisplayName = appDisplayName;
      _path = path;
      _ref = [[RNFirebaseFirestore getFirestoreForApp:_appDisplayName] documentWithPath:_path];
    }

    // Initialise the static listeners object if required
    if (!_listeners) {
      _listeners = [[NSMutableDictionary alloc] init];
    }

    return self;
  }

  - (void)delete:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject {
    [_ref deleteDocumentWithCompletion:^(NSError *_Nullable error) {
      [RNFirebaseFirestoreDocumentReference handleWriteResponse:error resolver:resolve rejecter:reject];
    }];
  }

  - (void)get:(NSDictionary *)getOptions
     resolver:(RCTPromiseResolveBlock)resolve
     rejecter:(RCTPromiseRejectBlock)reject {
    FIRFirestoreSource source;
    if (getOptions && getOptions[@"source"]) {
      if ([getOptions[@"source"] isEqualToString:@"server"]) {
        source = FIRFirestoreSourceServer;
      } else if ([getOptions[@"source"] isEqualToString:@"cache"]) {
        source = FIRFirestoreSourceCache;
      } else {
        source = FIRFirestoreSourceDefault;
      }
    } else {
      source = FIRFirestoreSourceDefault;
    }
    [_ref getDocumentWithSource:source completion:^(FIRDocumentSnapshot *_Nullable snapshot, NSError *_Nullable error) {
      if (error) {
        [RNFirebaseFirestore promiseRejectException:reject error:error];
      } else {
        NSDictionary *data = [RNFirebaseFirestoreDocumentReference snapshotToDictionary:snapshot];
        resolve(data);
      }
    }];
  }

  + (void)offSnapshot:(NSString *)listenerId {
    id <FIRListenerRegistration> listener = _listeners[listenerId];
    if (listener) {
      [_listeners removeObjectForKey:listenerId];
      [listener remove];
    }
  }

  - (void)onSnapshot:(NSString *)listenerId
    docListenOptions:(NSDictionary *)docListenOptions {
    if (_listeners[listenerId] == nil) {
      id listenerBlock = ^(FIRDocumentSnapshot *_Nullable snapshot, NSError *_Nullable error) {
        if (error) {
          id <FIRListenerRegistration> listener = _listeners[listenerId];
          if (listener) {
            [_listeners removeObjectForKey:listenerId];
            [listener remove];
          }
          [self handleDocumentSnapshotError:listenerId error:error];
        } else {
          [self handleDocumentSnapshotEvent:listenerId documentSnapshot:snapshot];
        }
      };
      bool includeMetadataChanges;
      if (docListenOptions && docListenOptions[keyIncludeMetaChanges]) {
        includeMetadataChanges = true;
      } else {
        includeMetadataChanges = false;
      }
      id <FIRListenerRegistration>
          listener = [_ref addSnapshotListenerWithIncludeMetadataChanges:includeMetadataChanges listener:listenerBlock];
      _listeners[listenerId] = listener;
    }
  }

  - (void)set:(NSDictionary *)data
      options:(NSDictionary *)options
     resolver:(RCTPromiseResolveBlock)resolve
     rejecter:(RCTPromiseRejectBlock)reject {
    NSDictionary *dictionary =
        [RNFirebaseFirestoreDocumentReference parseJSMap:[RNFirebaseFirestore getFirestoreForApp:_appDisplayName] jsMap:data];
    if (options && options[keyMerge]) {
      [_ref setData:dictionary merge:true completion:^(NSError *_Nullable error) {
        [RNFirebaseFirestoreDocumentReference handleWriteResponse:error resolver:resolve rejecter:reject];
      }];
    } else {
      [_ref setData:dictionary completion:^(NSError *_Nullable error) {
        [RNFirebaseFirestoreDocumentReference handleWriteResponse:error resolver:resolve rejecter:reject];
      }];
    }
  }

  - (void)update:(NSDictionary *)data
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject {
    NSDictionary *dictionary =
        [RNFirebaseFirestoreDocumentReference parseJSMap:[RNFirebaseFirestore getFirestoreForApp:_appDisplayName] jsMap:data];
    [_ref updateData:dictionary completion:^(NSError *_Nullable error) {
      [RNFirebaseFirestoreDocumentReference handleWriteResponse:error resolver:resolve rejecter:reject];
    }];
  }

  + (void)handleWriteResponse:(NSError *)error
                     resolver:(RCTPromiseResolveBlock)resolve
                     rejecter:(RCTPromiseRejectBlock)reject {
    if (error) {
      [RNFirebaseFirestore promiseRejectException:reject error:error];
    } else {
      resolve(nil);
    }
  }

  + (NSDictionary *)snapshotToDictionary:(FIRDocumentSnapshot *)documentSnapshot {
    NSMutableDictionary *snapshot = [[NSMutableDictionary alloc] init];
    [snapshot setValue:documentSnapshot.reference.path forKey:keyPath];
    if (documentSnapshot.exists) {
      [snapshot setValue:[RNFirebaseFirestoreDocumentReference buildNativeMap:documentSnapshot.data] forKey:keyData];
    }
    if (documentSnapshot.metadata) {
      NSMutableDictionary *metadata = [[NSMutableDictionary alloc] init];
      [metadata setValue:@(documentSnapshot.metadata.fromCache) forKey:keyFromCache];
      [metadata setValue:@(documentSnapshot.metadata.hasPendingWrites) forKey:keyHasPendingWrites];
      [snapshot setValue:metadata forKey:keyMetadata];
    }
    return snapshot;
  }

  - (void)handleDocumentSnapshotError:(NSString *)listenerId
                                error:(NSError *)error {
    NSMutableDictionary *event = [[NSMutableDictionary alloc] init];
    [event setValue:_path forKey:keyPath];
    [event setValue:listenerId forKey:keyListenerId];
    [event setValue:_appDisplayName forKey:keyAppName];
    [event setValue:[RNFirebaseFirestore getJSError:error] forKey:keyError];

    [RNFirebaseUtil sendJSEvent:self.emitter name:FIRESTORE_DOCUMENT_SYNC_EVENT body:event];
  }

  - (void)handleDocumentSnapshotEvent:(NSString *)listenerId
                     documentSnapshot:(FIRDocumentSnapshot *)documentSnapshot {
    NSMutableDictionary *event = [[NSMutableDictionary alloc] init];
    [event setValue:_path forKey:keyPath];
    [event setValue:listenerId forKey:keyListenerId];
    [event setValue:_appDisplayName forKey:keyAppName];
    [event setValue:[RNFirebaseFirestoreDocumentReference snapshotToDictionary:documentSnapshot] forKey:keyDocumentSnapshot];

    [RNFirebaseUtil sendJSEvent:self.emitter name:FIRESTORE_DOCUMENT_SYNC_EVENT body:event];
  }

  + (NSDictionary *)buildNativeMap:(NSDictionary *)nativeMap {
    NSMutableDictionary *map = [[NSMutableDictionary alloc] init];
    [nativeMap enumerateKeysAndObjectsUsingBlock:^(id _Nonnull key, id _Nonnull obj, BOOL *_Nonnull stop) {
      NSDictionary *typeMap = [RNFirebaseFirestoreDocumentReference buildTypeMap:obj];
      map[key] = typeMap;
    }];

    return map;
  }

  + (NSArray *)buildNativeArray:(NSArray *)nativeArray {
    NSMutableArray *array = [[NSMutableArray alloc] init];
    [nativeArray enumerateObjectsUsingBlock:^(id _Nonnull obj, NSUInteger idx, BOOL *_Nonnull stop) {
      NSDictionary *typeMap = [RNFirebaseFirestoreDocumentReference buildTypeMap:obj];
      [array addObject:typeMap];
    }];

    return array;
  }

  + (NSDictionary *)buildTypeMap:(id)value {
    NSMutableDictionary *typeMap = [[NSMutableDictionary alloc] init];

    // null
    if (value == nil || [value isKindOfClass:[NSNull class]]) {
      typeMap[typeKey] = typeNull;
      return typeMap;
    }

    // strings
    if ([value isKindOfClass:[NSString class]]) {
      typeMap[typeKey] = typeString;
      typeMap[valueKey] = value;
      return typeMap;
    }

    // objects
    if ([value isKindOfClass:[NSDictionary class]]) {
      typeMap[typeKey] = typeObject;
      typeMap[valueKey] = [RNFirebaseFirestoreDocumentReference buildNativeMap:value];
      return typeMap;
    }

    // array
    if ([value isKindOfClass:[NSArray class]]) {
      typeMap[typeKey] = typeArray;
      typeMap[valueKey] = [RNFirebaseFirestoreDocumentReference buildNativeArray:value];
      return typeMap;
    }

    // reference
    if ([value isKindOfClass:[FIRDocumentReference class]]) {
      typeMap[typeKey] = typeReference;
      FIRDocumentReference *ref = (FIRDocumentReference *) value;
      typeMap[valueKey] = [ref path];
      return typeMap;
    }

    // geopoint
    if ([value isKindOfClass:[FIRGeoPoint class]]) {
      typeMap[typeKey] = typeGeoPoint;
      FIRGeoPoint *point = (FIRGeoPoint *) value;
      NSMutableDictionary *geopoint = [[NSMutableDictionary alloc] init];
      geopoint[keyLatitude] = @([point latitude]);
      geopoint[keyLongitude] = @([point longitude]);
      typeMap[valueKey] = geopoint;
      return typeMap;
    }

    // date
    if ([value isKindOfClass:[NSDate class]]) {
      typeMap[typeKey] = typeDate;
      // round is required otherwise iOS ends up with .999 and loses a millisecond
      // when going between native and JS
      typeMap[valueKey] = @(round([(NSDate *) value timeIntervalSince1970] * 1000.0));
      return typeMap;
    }

    // FIRTimestamps
    if ([value isKindOfClass:[FIRTimestamp class]]) {
      typeMap[typeKey] = typeTimestamp;
      FIRTimestamp *firTimestamp = (FIRTimestamp *) value;
      NSMutableDictionary *timestamp = [NSMutableDictionary dictionary];
      int64_t seconds = (int64_t) firTimestamp.seconds;
      int32_t nanoseconds = (int32_t) firTimestamp.nanoseconds;
      timestamp[keySeconds] = @(seconds);
      timestamp[keyNanoSeconds] = @(nanoseconds);
      typeMap[valueKey] = timestamp;
      return typeMap;
    }

    // number / boolean / infinity / nan
    if ([value isKindOfClass:[NSNumber class]]) {
      NSNumber *number = (NSNumber *) value;

      // infinity
      if ([number isEqual:@(INFINITY)]) {
        typeMap[typeKey] = typeInfinity;
        return typeMap;
      }

      // boolean
      if (number == [NSValue valueWithPointer:(void *) kCFBooleanFalse]
          || number == [NSValue valueWithPointer:(void *) kCFBooleanTrue]) {
        typeMap[typeKey] = typeBoolean;
        typeMap[valueKey] = value;
        return typeMap;
      }

      // nan
      if ([[value description].lowercaseString isEqual:@"nan"]) {
        typeMap[typeKey] = typeNaN;
        return typeMap;
      }

      // number
      typeMap[typeKey] = typeNumber;
      typeMap[valueKey] = value;
      return typeMap;
    }

    // blobs (converted to base64)
    if ([value isKindOfClass:[NSData class]]) {
      NSData *blob = (NSData *) value;
      typeMap[typeKey] = typeBlob;
      typeMap[valueKey] = [blob base64EncodedStringWithOptions:0];
      return typeMap;
    }

    DLog(@"RNFirebaseFirestore: Unsupported value sent to buildTypeMap - class type is %@",
        NSStringFromClass([value class]));

    typeMap[typeKey] = typeNull;
    return typeMap;
  }

  + (NSDictionary *)parseJSMap:(FIRFirestore *)firestore
                         jsMap:(NSDictionary *)jsMap {
    NSMutableDictionary *map = [[NSMutableDictionary alloc] init];

    if (jsMap) {
      [jsMap enumerateKeysAndObjectsUsingBlock:^(id _Nonnull key, id _Nonnull obj, BOOL *_Nonnull stop) {
        map[key] = [RNFirebaseFirestoreDocumentReference parseJSTypeMap:firestore jsTypeMap:obj];
      }];
    }

    return map;
  }

  + (NSArray *)parseJSArray:(FIRFirestore *)firestore
                    jsArray:(NSArray *)jsArray {
    NSMutableArray *array = [[NSMutableArray alloc] init];

    if (jsArray) {
      [jsArray enumerateObjectsUsingBlock:^(id _Nonnull obj, NSUInteger idx, BOOL *_Nonnull stop) {
        [array addObject:[RNFirebaseFirestoreDocumentReference parseJSTypeMap:firestore jsTypeMap:obj]];
      }];
    }

    return array;
  }

  + (id)parseJSTypeMap:(FIRFirestore *)firestore
             jsTypeMap:(NSDictionary *)jsTypeMap {
    id value = jsTypeMap[valueKey];
    NSString *type = jsTypeMap[typeKey];

    if ([type isEqualToString:typeArray]) {
      return [self parseJSArray:firestore jsArray:value];
    }

    if ([type isEqualToString:typeObject]) {
      return [self parseJSMap:firestore jsMap:value];
    }

    if ([type isEqualToString:typeReference]) {
      return [firestore documentWithPath:value];
    }

    if ([type isEqualToString:typeBlob]) {
      return [[NSData alloc] initWithBase64EncodedString:(NSString *) value options:0];
    }

    if ([type isEqualToString:typeGeoPoint]) {
      NSDictionary *geopoint = (NSDictionary *) value;
      NSNumber *latitude = geopoint[keyLatitude];
      NSNumber *longitude = geopoint[keyLongitude];
      return [[FIRGeoPoint alloc] initWithLatitude:[latitude doubleValue] longitude:[longitude doubleValue]];
    }

    if ([type isEqualToString:typeDate]) {
      return [NSDate dateWithTimeIntervalSince1970:([(NSNumber *) value doubleValue] / 1000.0)];
    }

    if ([type isEqualToString:typeTimestamp]) {
      NSDictionary *timestampDict = (NSDictionary *) value;
      int64_t seconds = [timestampDict[keySeconds] longLongValue];
      int32_t nanoseconds = [timestampDict[keyNanoSeconds] intValue];
      return [[FIRTimestamp alloc] initWithSeconds:seconds nanoseconds:nanoseconds];
    }

    if ([type isEqualToString:typeDocumentId]) {
      return [FIRFieldPath documentID];
    }

    if ([type isEqualToString:typeFieldValue]) {
      NSDictionary *fieldValueMap = (NSDictionary *) value;
      NSString *string = (NSString *) fieldValueMap[typeFieldValueType];

      if ([string isEqualToString:typeDelete]) {
        return [FIRFieldValue fieldValueForDelete];
      }

      if ([string isEqualToString:typeTimestamp]) {
        return [FIRFieldValue fieldValueForServerTimestamp];
      }
      
      if ([string isEqualToString:typeFieldValueIncrement]) {
        double doubleValue = [value[typeFieldValueElements] doubleValue];
        return [FIRFieldValue fieldValueForDoubleIncrement:doubleValue];
      }

      if ([string isEqualToString:typeFieldValueUnion]) {
        NSArray *elements = [self parseJSArray:firestore jsArray:value[typeFieldValueElements]];
        return [FIRFieldValue fieldValueForArrayUnion:elements];
      }

      if ([string isEqualToString:typeFieldValueRemove]) {
        NSArray *elements = [self parseJSArray:firestore jsArray:value[typeFieldValueElements]];
        return [FIRFieldValue fieldValueForArrayRemove:elements];
      }

      DLog(@"RNFirebaseFirestore: Unsupported field-value sent to parseJSTypeMap - value is %@", NSStringFromClass([value class]));
      return nil;
    }

    if ([type isEqualToString:typeInfinity]) {
      return @(INFINITY);
    }

    if ([type isEqualToString:typeNaN]) {
      return [NSDecimalNumber notANumber];
    }

    if ([type isEqualToString:typeBoolean] || [type isEqualToString:typeNumber] || [type isEqualToString:typeString]
        || [type isEqualToString:typeNull]) {
      return value;
    }

    return nil;
  }

#endif

@end
