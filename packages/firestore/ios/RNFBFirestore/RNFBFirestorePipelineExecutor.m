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

#import "RNFBFirestorePipelineExecutor.h"

@interface RNFBFirestorePipelineExecutor ()

@property(nonatomic, strong) FIRFirestore *firestore;

@end

@implementation RNFBFirestorePipelineExecutor

- (instancetype)initWithFirestore:(FIRFirestore *)firestore {
  self = [super init];
  if (self) {
    _firestore = firestore;
  }
  return self;
}

- (void)executeWithPipeline:(NSDictionary *)pipeline
                    options:(NSDictionary *)options
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  (void)resolve;
  (void)_firestore;

  NSString *validationError = [self validatePipeline:pipeline options:options];
  if (validationError != nil) {
    reject(@"firestore/invalid-argument", validationError, nil);
    return;
  }

  reject(@"firestore/unsupported", [self createUnsupportedMessage:pipeline], nil);
}

- (nullable NSString *)validatePipeline:(NSDictionary *)pipeline options:(NSDictionary *)options {
  if (pipeline == nil || ![pipeline isKindOfClass:[NSDictionary class]]) {
    return @"pipelineExecute() expected a pipeline object.";
  }

  id source = pipeline[@"source"];
  if (![source isKindOfClass:[NSDictionary class]]) {
    return @"pipelineExecute() expected pipeline.source to be an object.";
  }

  id stages = pipeline[@"stages"];
  if (![stages isKindOfClass:[NSArray class]]) {
    return @"pipelineExecute() expected pipeline.stages to be an array.";
  }

  NSString *sourceValidationError = [self validateSource:(NSDictionary *)source];
  if (sourceValidationError != nil) {
    return sourceValidationError;
  }

  NSString *stagesValidationError = [self validateStages:(NSArray *)stages];
  if (stagesValidationError != nil) {
    return stagesValidationError;
  }

  return [self validateOptions:options];
}

- (nullable NSString *)validateSource:(NSDictionary *)source {
  NSString *sourceType = source[@"source"];
  if (sourceType == nil || ![sourceType isKindOfClass:[NSString class]]) {
    return @"pipelineExecute() expected pipeline.source.source to be a string.";
  }

  NSSet *supportedSources = [NSSet setWithArray:@[
    @"collection",
    @"collectionGroup",
    @"database",
    @"documents",
    @"query"
  ]];
  if (![supportedSources containsObject:sourceType]) {
    return @"pipelineExecute() received an unknown source type.";
  }

  if ([sourceType isEqualToString:@"collection"]) {
    return [self validateNonEmptyStringInMap:source key:@"path" fieldName:@"pipeline.source.path"];
  }

  if ([sourceType isEqualToString:@"collectionGroup"]) {
    return [self validateNonEmptyStringInMap:source
                                         key:@"collectionId"
                                   fieldName:@"pipeline.source.collectionId"];
  }

  if ([sourceType isEqualToString:@"documents"]) {
    id documents = source[@"documents"];
    if (![documents isKindOfClass:[NSArray class]]) {
      return @"pipelineExecute() expected pipeline.source.documents to be an array.";
    }

    NSArray *documentPaths = (NSArray *)documents;
    if (documentPaths.count == 0) {
      return @"pipelineExecute() expected pipeline.source.documents to contain at least one document path.";
    }

    for (id documentPath in documentPaths) {
      if (![documentPath isKindOfClass:[NSString class]]) {
        return @"pipelineExecute() expected pipeline.source.documents entries to be strings.";
      }
    }
  }

  if ([sourceType isEqualToString:@"query"]) {
    NSString *pathError =
        [self validateNonEmptyStringInMap:source key:@"path" fieldName:@"pipeline.source.path"];
    if (pathError != nil) {
      return pathError;
    }

    NSString *queryTypeError = [self validateNonEmptyStringInMap:source
                                                             key:@"queryType"
                                                       fieldName:@"pipeline.source.queryType"];
    if (queryTypeError != nil) {
      return queryTypeError;
    }

    if (![source[@"filters"] isKindOfClass:[NSArray class]]) {
      return @"pipelineExecute() expected pipeline.source.filters to be an array.";
    }

    if (![source[@"orders"] isKindOfClass:[NSArray class]]) {
      return @"pipelineExecute() expected pipeline.source.orders to be an array.";
    }

    if (![source[@"options"] isKindOfClass:[NSDictionary class]]) {
      return @"pipelineExecute() expected pipeline.source.options to be an object.";
    }
  }

  return nil;
}

- (nullable NSString *)validateStages:(NSArray *)stages {
  NSSet *knownStages = [NSSet setWithArray:@[
    @"where",       @"select",    @"addFields", @"removeFields", @"sort",
    @"limit",       @"offset",    @"aggregate", @"distinct",     @"findNearest",
    @"replaceWith", @"sample",    @"union",     @"unnest",       @"rawStage",
  ]];

  for (id stage in stages) {
    if (![stage isKindOfClass:[NSDictionary class]]) {
      return @"pipelineExecute() expected each pipeline stage to be an object.";
    }

    NSDictionary *stageMap = (NSDictionary *)stage;
    NSString *stageName = stageMap[@"stage"];
    if (stageName == nil || ![stageName isKindOfClass:[NSString class]]) {
      return @"pipelineExecute() expected each stage.stage to be a string.";
    }

    if (stageName.length == 0) {
      return @"pipelineExecute() expected each stage.stage to be a non-empty string.";
    }

    if (![knownStages containsObject:stageName]) {
      return [NSString stringWithFormat:@"pipelineExecute() received an unknown stage: %@.",
                                        stageName];
    }

    if (![stageMap[@"options"] isKindOfClass:[NSDictionary class]]) {
      return @"pipelineExecute() expected each stage.options to be an object.";
    }
  }

  return nil;
}

- (nullable NSString *)validateOptions:(NSDictionary *)options {
  if (options == nil) {
    return nil;
  }

  id indexModeValue = options[@"indexMode"];
  if (indexModeValue != nil && ![indexModeValue isKindOfClass:[NSString class]]) {
    return @"pipelineExecute() expected options.indexMode to be a string.";
  }

  NSString *indexMode = (NSString *)indexModeValue;
  if (indexMode != nil && ![indexMode isEqualToString:@"recommended"]) {
    return @"pipelineExecute() only supports options.indexMode=\"recommended\".";
  }

  id rawOptions = options[@"rawOptions"];
  if (rawOptions != nil && ![rawOptions isKindOfClass:[NSDictionary class]]) {
    return @"pipelineExecute() expected options.rawOptions to be an object.";
  }

  return nil;
}

- (NSString *)createUnsupportedMessage:(NSDictionary *)pipeline {
  NSArray *stages = pipeline[@"stages"];
  if ([stages isKindOfClass:[NSArray class]] && stages.count > 0) {
    id firstStageValue = stages.firstObject;
    if ([firstStageValue isKindOfClass:[NSDictionary class]]) {
      NSString *stageName = ((NSDictionary *)firstStageValue)[@"stage"];
      if ([stageName isKindOfClass:[NSString class]] && stageName.length > 0) {
        return [NSString
            stringWithFormat:@"Firestore pipelines are not supported by this native implementation yet. Unsupported stage: %@.",
                             stageName];
      }
    }
  }

  NSDictionary *source = pipeline[@"source"];
  if ([source isKindOfClass:[NSDictionary class]]) {
    NSString *sourceType = source[@"source"];
    if ([sourceType isKindOfClass:[NSString class]] && sourceType.length > 0) {
      return [NSString
          stringWithFormat:@"Firestore pipelines are not supported by this native implementation yet. Unsupported source: %@.",
                           sourceType];
    }
  }

  return @"Firestore pipelines are not supported by this native implementation yet.";
}

- (nullable NSString *)validateNonEmptyStringInMap:(NSDictionary *)map
                                               key:(NSString *)key
                                         fieldName:(NSString *)fieldName {
  id value = map[key];
  if (![value isKindOfClass:[NSString class]]) {
    return [NSString stringWithFormat:@"pipelineExecute() expected %@ to be a string.", fieldName];
  }

  if ([(NSString *)value length] == 0) {
    return
        [NSString stringWithFormat:@"pipelineExecute() expected %@ to be a non-empty string.", fieldName];
  }

  return nil;
}

@end
