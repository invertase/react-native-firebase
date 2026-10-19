/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 */
#import <Firebase/Firebase.h>
#import <unistd.h>

NSString *const FIRFirestoreErrorDomain = @"FIRFirestoreErrorDomain";

@implementation FIRApp
- (instancetype)initWithName:(NSString *)name {
  self = [super init];
  if (self) {
    _name = [name copy];
  }
  return self;
}
@end

@implementation FIRConfiguration
static FIRLoggerLevel sLastLoggerLevel;

+ (instancetype)sharedInstance {
  static FIRConfiguration *shared;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    shared = [[FIRConfiguration alloc] init];
  });
  return shared;
}

- (void)setLoggerLevel:(FIRLoggerLevel)loggerLevel {
  sLastLoggerLevel = loggerLevel;
}

+ (FIRLoggerLevel)lastLoggerLevel {
  return sLastLoggerLevel;
}

+ (void)setLastLoggerLevel:(FIRLoggerLevel)lastLoggerLevel {
  sLastLoggerLevel = lastLoggerLevel;
}

+ (void)resetTestState {
  sLastLoggerLevel = FIRLoggerLevelMin;
}
@end

@implementation FIRPersistentCacheIndexManager
static NSInteger sLastRequestType = -1;

- (void)enableIndexAutoCreation {
  sLastRequestType = 0;
}
- (void)disableIndexAutoCreation {
  sLastRequestType = 1;
}
- (void)deleteAllIndexes {
  sLastRequestType = 2;
}
+ (NSInteger)lastRequestType {
  return sLastRequestType;
}
+ (void)setLastRequestType:(NSInteger)lastRequestType {
  sLastRequestType = lastRequestType;
}
+ (void)resetTestState {
  sLastRequestType = -1;
}
@end

@implementation FIRFirestoreSettings
@end

@implementation FIRListenerRegistrationStub
- (void)remove {
}
@end

@implementation FIRLoadBundleTaskProgress
@end

@implementation FIRAggregateField
+ (instancetype)aggregateFieldForCount {
  FIRAggregateField *field = [[FIRAggregateField alloc] init];
  field.kind = @"count";
  return field;
}
+ (instancetype)aggregateFieldForSumOfField:(NSString *)fieldPath {
  FIRAggregateField *field = [[FIRAggregateField alloc] init];
  field.kind = @"sum";
  field.fieldPath = fieldPath;
  return field;
}
+ (instancetype)aggregateFieldForAverageOfField:(NSString *)fieldPath {
  FIRAggregateField *field = [[FIRAggregateField alloc] init];
  field.kind = @"avg";
  field.fieldPath = fieldPath;
  return field;
}
@end

@implementation FIRAggregateQuerySnapshot
- (NSNumber *)valueForAggregateField:(FIRAggregateField *)field {
  if ([field.kind isEqualToString:@"sum"]) {
    return self.sumValue;
  }
  if ([field.kind isEqualToString:@"avg"]) {
    return self.averageValue;
  }
  return self.count;
}
@end

@implementation FIRAggregateQuery
static NSError *sAggregationError;
static FIRAggregateQuerySnapshot *sAggregationSnapshot;

+ (NSError *)aggregationError {
  return sAggregationError;
}
+ (void)setAggregationError:(NSError *)aggregationError {
  sAggregationError = aggregationError;
}
+ (FIRAggregateQuerySnapshot *)aggregationSnapshot {
  return sAggregationSnapshot;
}
+ (void)setAggregationSnapshot:(FIRAggregateQuerySnapshot *)aggregationSnapshot {
  sAggregationSnapshot = aggregationSnapshot;
}
+ (void)resetTestState {
  sAggregationError = nil;
  sAggregationSnapshot = nil;
}

- (void)aggregationWithSource:(FIRAggregateSource)source
                   completion:(void (^)(FIRAggregateQuerySnapshot *_Nullable,
                                        NSError *_Nullable))completion {
  (void)source;
  if (completion) {
    completion(sAggregationSnapshot, sAggregationError);
  }
}
@end

@implementation FIRSnapshotListenOptions
- (instancetype)optionsWithIncludeMetadataChanges:(BOOL)includeMetadataChanges {
  self.includeMetadataChanges = includeMetadataChanges;
  return self;
}
- (instancetype)optionsWithSource:(FIRListenSource)source {
  self.source = source;
  return self;
}
@end

@implementation FIRQuerySnapshot
@end

@implementation FIRDocumentChange
@end

@implementation FIRDocumentSnapshot
@end

@implementation FIRQuery
static void (^sLastSnapshotListener)(FIRQuerySnapshot *, NSError *);
static NSError *sGetDocumentsError;
static FIRQuerySnapshot *sGetDocumentsSnapshot;
static FIRFirestoreSource sLastGetDocumentsSource;

+ (void (^)(FIRQuerySnapshot *, NSError *))lastSnapshotListener {
  return sLastSnapshotListener;
}
+ (void)setLastSnapshotListener:(void (^)(FIRQuerySnapshot *, NSError *))lastSnapshotListener {
  sLastSnapshotListener = [lastSnapshotListener copy];
}
+ (NSError *)getDocumentsError {
  return sGetDocumentsError;
}
+ (void)setGetDocumentsError:(NSError *)getDocumentsError {
  sGetDocumentsError = getDocumentsError;
}
+ (FIRQuerySnapshot *)getDocumentsSnapshot {
  return sGetDocumentsSnapshot;
}
+ (void)setGetDocumentsSnapshot:(FIRQuerySnapshot *)getDocumentsSnapshot {
  sGetDocumentsSnapshot = getDocumentsSnapshot;
}
+ (FIRFirestoreSource)lastGetDocumentsSource {
  return sLastGetDocumentsSource;
}
+ (void)setLastGetDocumentsSource:(FIRFirestoreSource)lastGetDocumentsSource {
  sLastGetDocumentsSource = lastGetDocumentsSource;
}
+ (void)resetTestState {
  sLastSnapshotListener = nil;
  sGetDocumentsError = nil;
  sGetDocumentsSnapshot = nil;
  sLastGetDocumentsSource = FIRFirestoreSourceDefault;
}
+ (void)invokeLastSnapshotListenerWithSnapshot:(FIRQuerySnapshot *)snapshot error:(NSError *)error {
  if (sLastSnapshotListener) {
    sLastSnapshotListener(snapshot, error);
  }
}

- (FIRAggregateQuery *)count {
  return [[FIRAggregateQuery alloc] init];
}

- (FIRAggregateQuery *)aggregate:(NSArray<FIRAggregateField *> *)aggregateFields {
  (void)aggregateFields;
  return [[FIRAggregateQuery alloc] init];
}

- (id<FIRListenerRegistration>)addSnapshotListenerWithOptions:(FIRSnapshotListenOptions *)options
                                                     listener:(void (^)(FIRQuerySnapshot *,
                                                                        NSError *))listener {
  (void)options;
  sLastSnapshotListener = [listener copy];
  return [[FIRListenerRegistrationStub alloc] init];
}

- (void)getDocumentsWithSource:(FIRFirestoreSource)source
                    completion:(void (^)(FIRQuerySnapshot *, NSError *))completion {
  sLastGetDocumentsSource = source;
  if (completion) {
    completion(sGetDocumentsSnapshot ?: [[FIRQuerySnapshot alloc] init], sGetDocumentsError);
  }
}
@end

@implementation FIRDocumentReference
static void (^sDocLastSnapshotListener)(FIRDocumentSnapshot *, NSError *);
static NSError *sGetDocumentError;
static FIRDocumentSnapshot *sGetDocumentSnapshot;
static FIRFirestoreSource sLastGetDocumentSource;
static NSError *sWriteError;
static NSString *sLastWriteMode;
static NSDictionary *sLastWriteData;
static NSArray *sLastMergeFields;

+ (void (^)(FIRDocumentSnapshot *, NSError *))lastSnapshotListener {
  return sDocLastSnapshotListener;
}
+ (void)setLastSnapshotListener:(void (^)(FIRDocumentSnapshot *, NSError *))lastSnapshotListener {
  sDocLastSnapshotListener = [lastSnapshotListener copy];
}
+ (NSError *)getDocumentError {
  return sGetDocumentError;
}
+ (void)setGetDocumentError:(NSError *)getDocumentError {
  sGetDocumentError = getDocumentError;
}
+ (FIRDocumentSnapshot *)getDocumentSnapshot {
  return sGetDocumentSnapshot;
}
+ (void)setGetDocumentSnapshot:(FIRDocumentSnapshot *)getDocumentSnapshot {
  sGetDocumentSnapshot = getDocumentSnapshot;
}
+ (FIRFirestoreSource)lastGetDocumentSource {
  return sLastGetDocumentSource;
}
+ (void)setLastGetDocumentSource:(FIRFirestoreSource)lastGetDocumentSource {
  sLastGetDocumentSource = lastGetDocumentSource;
}
+ (NSError *)writeError {
  return sWriteError;
}
+ (void)setWriteError:(NSError *)writeError {
  sWriteError = writeError;
}
+ (NSString *)lastWriteMode {
  return sLastWriteMode;
}
+ (void)setLastWriteMode:(NSString *)lastWriteMode {
  sLastWriteMode = [lastWriteMode copy];
}
+ (NSDictionary *)lastWriteData {
  return sLastWriteData;
}
+ (void)setLastWriteData:(NSDictionary *)lastWriteData {
  sLastWriteData = [lastWriteData copy];
}
+ (NSArray *)lastMergeFields {
  return sLastMergeFields;
}
+ (void)setLastMergeFields:(NSArray *)lastMergeFields {
  sLastMergeFields = [lastMergeFields copy];
}
+ (void)resetTestState {
  sDocLastSnapshotListener = nil;
  sGetDocumentError = nil;
  sGetDocumentSnapshot = nil;
  sLastGetDocumentSource = FIRFirestoreSourceDefault;
  sWriteError = nil;
  sLastWriteMode = nil;
  sLastWriteData = nil;
  sLastMergeFields = nil;
}
+ (void)invokeLastSnapshotListenerWithSnapshot:(FIRDocumentSnapshot *)snapshot
                                         error:(NSError *)error {
  if (sDocLastSnapshotListener) {
    sDocLastSnapshotListener(snapshot, error);
  }
}

- (id<FIRListenerRegistration>)addSnapshotListenerWithOptions:(FIRSnapshotListenOptions *)options
                                                     listener:(void (^)(FIRDocumentSnapshot *,
                                                                        NSError *))listener {
  (void)options;
  sDocLastSnapshotListener = [listener copy];
  return [[FIRListenerRegistrationStub alloc] init];
}

- (void)getDocumentWithSource:(FIRFirestoreSource)source
                   completion:(void (^)(FIRDocumentSnapshot *, NSError *))completion {
  sLastGetDocumentSource = source;
  if (completion) {
    completion(sGetDocumentSnapshot ?: [[FIRDocumentSnapshot alloc] init], sGetDocumentError);
  }
}

- (void)deleteDocumentWithCompletion:(void (^)(NSError *))completion {
  sLastWriteMode = @"delete";
  if (completion) {
    completion(sWriteError);
  }
}

- (void)setData:(NSDictionary *)data completion:(void (^)(NSError *))completion {
  sLastWriteMode = @"set";
  sLastWriteData = [data copy];
  sLastMergeFields = nil;
  if (completion) {
    completion(sWriteError);
  }
}

- (void)setData:(NSDictionary *)data merge:(BOOL)merge completion:(void (^)(NSError *))completion {
  (void)merge;
  sLastWriteMode = @"set-merge";
  sLastWriteData = [data copy];
  sLastMergeFields = nil;
  if (completion) {
    completion(sWriteError);
  }
}

- (void)setData:(NSDictionary *)data
    mergeFields:(NSArray *)mergeFields
     completion:(void (^)(NSError *))completion {
  sLastWriteMode = @"set-mergeFields";
  sLastWriteData = [data copy];
  sLastMergeFields = [mergeFields copy];
  if (completion) {
    completion(sWriteError);
  }
}

- (void)updateData:(NSDictionary *)data completion:(void (^)(NSError *))completion {
  sLastWriteMode = @"update";
  sLastWriteData = [data copy];
  if (completion) {
    completion(sWriteError);
  }
}
@end

@implementation FIRWriteBatch
static NSError *sCommitError;
static NSMutableArray *sRecordedOperations;

+ (NSError *)commitError {
  return sCommitError;
}
+ (void)setCommitError:(NSError *)commitError {
  sCommitError = commitError;
}
+ (NSArray *)recordedOperations {
  return [sRecordedOperations copy];
}
+ (void)setRecordedOperations:(NSArray *)recordedOperations {
  sRecordedOperations = [recordedOperations mutableCopy];
}
+ (void)resetTestState {
  sCommitError = nil;
  sRecordedOperations = [NSMutableArray array];
}

- (instancetype)init {
  self = [super init];
  if (self && sRecordedOperations == nil) {
    sRecordedOperations = [NSMutableArray array];
  }
  return self;
}

- (FIRWriteBatch *)deleteDocument:(FIRDocumentReference *)document {
  [sRecordedOperations addObject:@{@"type" : @"DELETE", @"path" : document.path ?: @""}];
  return self;
}

- (FIRWriteBatch *)setData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document {
  [sRecordedOperations
      addObject:@{@"type" : @"SET", @"path" : document.path ?: @"", @"data" : data ?: @{}}];
  return self;
}

- (FIRWriteBatch *)setData:(NSDictionary *)data
               forDocument:(FIRDocumentReference *)document
                     merge:(BOOL)merge {
  (void)merge;
  [sRecordedOperations
      addObject:@{@"type" : @"SET-merge", @"path" : document.path ?: @"", @"data" : data ?: @{}}];
  return self;
}

- (FIRWriteBatch *)setData:(NSDictionary *)data
               forDocument:(FIRDocumentReference *)document
               mergeFields:(NSArray *)mergeFields {
  [sRecordedOperations addObject:@{
    @"type" : @"SET-mergeFields",
    @"path" : document.path ?: @"",
    @"data" : data ?: @{},
    @"mergeFields" : mergeFields ?: @[]
  }];
  return self;
}

- (FIRWriteBatch *)updateData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document {
  [sRecordedOperations
      addObject:@{@"type" : @"UPDATE", @"path" : document.path ?: @"", @"data" : data ?: @{}}];
  return self;
}

- (void)commitWithCompletion:(void (^)(NSError *))completion {
  if (completion) {
    completion(sCommitError);
  }
}
@end

@implementation FIRTransaction
static NSError *sTxnGetDocumentError;
static FIRDocumentSnapshot *sTxnGetDocumentSnapshot;

+ (NSError *)getDocumentError {
  return sTxnGetDocumentError;
}
+ (void)setGetDocumentError:(NSError *)getDocumentError {
  sTxnGetDocumentError = getDocumentError;
}
+ (FIRDocumentSnapshot *)getDocumentSnapshot {
  return sTxnGetDocumentSnapshot;
}
+ (void)setGetDocumentSnapshot:(FIRDocumentSnapshot *)getDocumentSnapshot {
  sTxnGetDocumentSnapshot = getDocumentSnapshot;
}
+ (void)resetTestState {
  sTxnGetDocumentError = nil;
  sTxnGetDocumentSnapshot = nil;
}

- (FIRDocumentSnapshot *)getDocument:(FIRDocumentReference *)document
                               error:(NSError *_Nullable *_Nullable)error {
  (void)document;
  if (error) {
    *error = sTxnGetDocumentError;
  }
  if (sTxnGetDocumentError != nil) {
    return nil;
  }
  return sTxnGetDocumentSnapshot ?: [[FIRDocumentSnapshot alloc] init];
}
- (void)deleteDocument:(FIRDocumentReference *)document {
  (void)document;
}
- (void)setData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document {
  (void)data;
  (void)document;
}
- (void)setData:(NSDictionary *)data
    forDocument:(FIRDocumentReference *)document
          merge:(BOOL)merge {
  (void)data;
  (void)document;
  (void)merge;
}
- (void)setData:(NSDictionary *)data
    forDocument:(FIRDocumentReference *)document
    mergeFields:(NSArray *)mergeFields {
  (void)data;
  (void)document;
  (void)mergeFields;
}
- (void)updateData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document {
  (void)data;
  (void)document;
}
@end

@implementation FIRTransactionOptions
@end

@implementation FIRFirestore
static FIRFirestore *sTestInstance;
static FIRQuery *sNamedQueryResult;
static NSString *sLastNamedQueryName;
static NSString *sLastEmulatorHost;
static NSInteger sLastEmulatorPort;
static NSError *sOperationError;
static NSError *sLoadBundleError;
static FIRLoadBundleTaskState sLoadBundleState = FIRLoadBundleTaskStateSuccess;
static NSInteger sTransactionUpdateBlockInvokeCount = 1;
static NSUInteger sTransactionRetryDelayUSec = 50000;

+ (FIRFirestore *)testInstance {
  return sTestInstance;
}

+ (void)setTestInstance:(FIRFirestore *)testInstance {
  sTestInstance = testInstance;
}

+ (FIRQuery *)namedQueryResult {
  return sNamedQueryResult;
}
+ (void)setNamedQueryResult:(FIRQuery *)namedQueryResult {
  sNamedQueryResult = namedQueryResult;
}
+ (NSString *)lastNamedQueryName {
  return sLastNamedQueryName;
}
+ (void)setLastNamedQueryName:(NSString *)lastNamedQueryName {
  sLastNamedQueryName = [lastNamedQueryName copy];
}
+ (NSString *)lastEmulatorHost {
  return sLastEmulatorHost;
}
+ (void)setLastEmulatorHost:(NSString *)lastEmulatorHost {
  sLastEmulatorHost = [lastEmulatorHost copy];
}
+ (NSInteger)lastEmulatorPort {
  return sLastEmulatorPort;
}
+ (void)setLastEmulatorPort:(NSInteger)lastEmulatorPort {
  sLastEmulatorPort = lastEmulatorPort;
}
+ (NSError *)operationError {
  return sOperationError;
}
+ (void)setOperationError:(NSError *)operationError {
  sOperationError = operationError;
}
+ (NSError *)loadBundleError {
  return sLoadBundleError;
}
+ (void)setLoadBundleError:(NSError *)loadBundleError {
  sLoadBundleError = loadBundleError;
}
+ (FIRLoadBundleTaskState)loadBundleState {
  return sLoadBundleState;
}
+ (void)setLoadBundleState:(FIRLoadBundleTaskState)loadBundleState {
  sLoadBundleState = loadBundleState;
}
+ (NSInteger)transactionUpdateBlockInvokeCount {
  return sTransactionUpdateBlockInvokeCount;
}
+ (void)setTransactionUpdateBlockInvokeCount:(NSInteger)transactionUpdateBlockInvokeCount {
  sTransactionUpdateBlockInvokeCount = MAX(transactionUpdateBlockInvokeCount, (NSInteger)1);
}
+ (NSUInteger)transactionRetryDelayUSec {
  return sTransactionRetryDelayUSec;
}
+ (void)setTransactionRetryDelayUSec:(NSUInteger)transactionRetryDelayUSec {
  sTransactionRetryDelayUSec = transactionRetryDelayUSec;
}

+ (void)resetTestState {
  sTestInstance = nil;
  sNamedQueryResult = nil;
  sLastNamedQueryName = nil;
  sLastEmulatorHost = nil;
  sLastEmulatorPort = 0;
  sOperationError = nil;
  sLoadBundleError = nil;
  sLoadBundleState = FIRLoadBundleTaskStateSuccess;
  sTransactionUpdateBlockInvokeCount = 1;
  sTransactionRetryDelayUSec = 50000;
  [FIRPersistentCacheIndexManager resetTestState];
  [FIRConfiguration resetTestState];
  [FIRQuery resetTestState];
  [FIRDocumentReference resetTestState];
  [FIRTransaction resetTestState];
  [FIRWriteBatch resetTestState];
  [FIRAggregateQuery resetTestState];
}

- (instancetype)init {
  self = [super init];
  if (self) {
    _settings = [[FIRFirestoreSettings alloc] init];
  }
  return self;
}

- (void)disableNetworkWithCompletion:(void (^)(NSError *_Nullable))completion {
  if (completion) {
    completion(sOperationError);
  }
}
- (void)enableNetworkWithCompletion:(void (^)(NSError *_Nullable))completion {
  if (completion) {
    completion(sOperationError);
  }
}
- (void)clearPersistenceWithCompletion:(void (^)(NSError *_Nullable))completion {
  if (completion) {
    completion(sOperationError);
  }
}
- (void)waitForPendingWritesWithCompletion:(void (^)(NSError *_Nullable))completion {
  if (completion) {
    completion(sOperationError);
  }
}
- (void)terminateWithCompletion:(void (^)(NSError *_Nullable))completion {
  if (completion) {
    completion(sOperationError);
  }
}
- (void)useEmulatorWithHost:(NSString *)host port:(NSInteger)port {
  sLastEmulatorHost = [host copy];
  sLastEmulatorPort = port;
}
- (void)loadBundle:(NSData *)bundleData
        completion:(void (^)(FIRLoadBundleTaskProgress *_Nullable, NSError *_Nullable))completion {
  (void)bundleData;
  if (completion) {
    if (sLoadBundleError != nil) {
      completion(nil, sLoadBundleError);
      return;
    }
    FIRLoadBundleTaskProgress *progress = [[FIRLoadBundleTaskProgress alloc] init];
    progress.state = sLoadBundleState;
    progress.bytesLoaded = 1;
    progress.documentsLoaded = 2;
    progress.totalBytes = 3;
    progress.totalDocuments = 4;
    completion(progress, nil);
  }
}
- (id<FIRListenerRegistration>)addSnapshotsInSyncListener:(void (^)(void))listener {
  if (listener) {
    listener();
  }
  return [[FIRListenerRegistrationStub alloc] init];
}
- (void)rnfb_invokeTransactionBlock:(id (^)(FIRTransaction *, NSError **))block
                         completion:(void (^)(id _Nullable, NSError *_Nullable))completion {
  if (block == nil) {
    if (completion) {
      completion(nil, nil);
    }
    return;
  }

  if (sTransactionUpdateBlockInvokeCount <= 1) {
    NSError *error = nil;
    id result = block([[FIRTransaction alloc] init], &error);
    if (completion) {
      completion(result, error);
    }
    return;
  }

  // Concurrent second invocation mimics an SDK retry while the first update block is still
  // waiting — the first wait then observes a replaced semaphore (stale).
  dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
  dispatch_group_t group = dispatch_group_create();
  __block id finalResult = nil;
  __block NSError *finalError = nil;

  dispatch_group_async(group, queue, ^{
    NSError *error = nil;
    id result = block([[FIRTransaction alloc] init], &error);
    @synchronized(self) {
      finalResult = result;
      finalError = error;
    }
  });
  dispatch_group_async(group, queue, ^{
    usleep((useconds_t)sTransactionRetryDelayUSec);
    NSError *error = nil;
    id result = block([[FIRTransaction alloc] init], &error);
    @synchronized(self) {
      finalResult = result;
      finalError = error;
    }
  });
  dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
  if (completion) {
    completion(finalResult, finalError);
  }
}

- (void)runTransactionWithBlock:(id (^)(FIRTransaction *, NSError **))block
                     completion:(void (^)(id _Nullable, NSError *_Nullable))completion {
  [self rnfb_invokeTransactionBlock:block completion:completion];
}
- (void)runTransactionWithOptions:(FIRTransactionOptions *)options
                            block:(id (^)(FIRTransaction *, NSError **))block
                       completion:(void (^)(id _Nullable, NSError *_Nullable))completion {
  (void)options;
  [self rnfb_invokeTransactionBlock:block completion:completion];
}
- (void)getQueryNamed:(NSString *)name completion:(void (^)(FIRQuery *_Nullable))completion {
  sLastNamedQueryName = [name copy];
  if (completion) {
    completion(sNamedQueryResult);
  }
}
- (FIRWriteBatch *)batch {
  return [[FIRWriteBatch alloc] init];
}
- (FIRDocumentReference *)documentWithPath:(NSString *)path {
  FIRDocumentReference *ref = [[FIRDocumentReference alloc] init];
  ref.path = path;
  return ref;
}
@end
