/**
 * Host-only stub for macOS XCTest. Not shipped in the production pod.
 * Enough of Firebase Core / Firestore for compiling Module / Collection /
 * Document / Transaction helpers without linking the SDK.
 */
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, FIRLoggerLevel) {
  FIRLoggerLevelMin = 0,
  FIRLoggerLevelDebug = 1,
};

typedef NS_ENUM(NSInteger, FIRFirestoreSource) {
  FIRFirestoreSourceDefault = 0,
  FIRFirestoreSourceServer = 1,
  FIRFirestoreSourceCache = 2,
};

typedef NS_ENUM(NSInteger, FIRListenSource) {
  FIRListenSourceDefault = 0,
  FIRListenSourceCache = 1,
};

typedef NS_ENUM(NSInteger, FIRLoadBundleTaskState) {
  FIRLoadBundleTaskStateError = 0,
  FIRLoadBundleTaskStateSuccess = 1,
  FIRLoadBundleTaskStateInProgress = 2,
};

typedef NS_ENUM(NSInteger, FIRFirestoreErrorCode) {
  FIRFirestoreErrorCodeAborted = 10,
};

typedef NS_ENUM(NSInteger, FIRAggregateSource) {
  FIRAggregateSourceServer = 0,
};

FOUNDATION_EXPORT NSString *const FIRFirestoreErrorDomain;

@interface FIRApp : NSObject
@property(nonatomic, copy) NSString *name;
- (instancetype)initWithName:(NSString *)name;
@end

@interface FIRConfiguration : NSObject
+ (instancetype)sharedInstance;
- (void)setLoggerLevel:(FIRLoggerLevel)loggerLevel;
@property(class, nonatomic, assign) FIRLoggerLevel lastLoggerLevel;
+ (void)resetTestState;
@end

@interface FIRPersistentCacheIndexManager : NSObject
- (void)enableIndexAutoCreation;
- (void)disableIndexAutoCreation;
- (void)deleteAllIndexes;
@property(class, nonatomic, assign) NSInteger lastRequestType;
+ (void)resetTestState;
@end

@interface FIRFirestoreSettings : NSObject
@property(nonatomic, assign) BOOL sslEnabled;
@end

@protocol FIRListenerRegistration <NSObject>
- (void)remove;
@end

@interface FIRListenerRegistrationStub : NSObject <FIRListenerRegistration>
@end

@interface FIRLoadBundleTaskProgress : NSObject
@property(nonatomic, assign) int64_t bytesLoaded;
@property(nonatomic, assign) int32_t documentsLoaded;
@property(nonatomic, assign) int64_t totalBytes;
@property(nonatomic, assign) int32_t totalDocuments;
@property(nonatomic, assign) FIRLoadBundleTaskState state;
@end

@interface FIRAggregateField : NSObject
@property(nonatomic, copy) NSString *kind;
@property(nonatomic, copy, nullable) NSString *fieldPath;
+ (instancetype)aggregateFieldForCount;
+ (instancetype)aggregateFieldForSumOfField:(NSString *)field;
+ (instancetype)aggregateFieldForAverageOfField:(NSString *)field;
@end

@interface FIRAggregateQuerySnapshot : NSObject
@property(nonatomic, strong, nullable) NSNumber *count;
@property(nonatomic, strong, nullable) NSNumber *sumValue;
@property(nonatomic, strong, nullable) NSNumber *averageValue;
- (nullable NSNumber *)valueForAggregateField:(FIRAggregateField *)field;
@end

@class FIRQuery;
@interface FIRAggregateQuery : NSObject
@property(class, nonatomic, strong, nullable) NSError *aggregationError;
@property(class, nonatomic, strong, nullable) FIRAggregateQuerySnapshot *aggregationSnapshot;
+ (void)resetTestState;
- (void)aggregationWithSource:(FIRAggregateSource)source
                   completion:(void (^)(FIRAggregateQuerySnapshot *_Nullable snapshot,
                                        NSError *_Nullable error))completion;
@end

@interface FIRSnapshotListenOptions : NSObject
@property(nonatomic, assign) BOOL includeMetadataChanges;
@property(nonatomic, assign) FIRListenSource source;
- (instancetype)optionsWithIncludeMetadataChanges:(BOOL)includeMetadataChanges;
- (instancetype)optionsWithSource:(FIRListenSource)source;
@end

@interface FIRQuerySnapshot : NSObject
@end

@interface FIRDocumentChange : NSObject
@end

@interface FIRDocumentSnapshot : NSObject
@end

@interface FIRQuery : NSObject
@property(class, nonatomic, copy, nullable) void (^lastSnapshotListener)
    (FIRQuerySnapshot *_Nullable snapshot, NSError *_Nullable error);
@property(class, nonatomic, strong, nullable) NSError *getDocumentsError;
@property(class, nonatomic, strong, nullable) FIRQuerySnapshot *getDocumentsSnapshot;
@property(class, nonatomic, assign) FIRFirestoreSource lastGetDocumentsSource;
+ (void)resetTestState;
+ (void)invokeLastSnapshotListenerWithSnapshot:(nullable FIRQuerySnapshot *)snapshot
                                         error:(nullable NSError *)error;

- (FIRAggregateQuery *)count;
- (FIRAggregateQuery *)aggregate:(NSArray<FIRAggregateField *> *)aggregateFields;
- (id<FIRListenerRegistration>)addSnapshotListenerWithOptions:(FIRSnapshotListenOptions *)options
                                                     listener:
                                                         (void (^)(FIRQuerySnapshot *_Nullable,
                                                                   NSError *_Nullable))listener;
- (void)getDocumentsWithSource:(FIRFirestoreSource)source
                    completion:(void (^)(FIRQuerySnapshot *_Nullable snapshot,
                                         NSError *_Nullable error))completion;
@end

@interface FIRDocumentReference : NSObject
@property(nonatomic, copy) NSString *path;
@property(class, nonatomic, copy, nullable) void (^lastSnapshotListener)
    (FIRDocumentSnapshot *_Nullable snapshot, NSError *_Nullable error);
@property(class, nonatomic, strong, nullable) NSError *getDocumentError;
@property(class, nonatomic, strong, nullable) FIRDocumentSnapshot *getDocumentSnapshot;
@property(class, nonatomic, assign) FIRFirestoreSource lastGetDocumentSource;
@property(class, nonatomic, strong, nullable) NSError *writeError;
@property(class, nonatomic, copy, nullable) NSString *lastWriteMode;
@property(class, nonatomic, copy, nullable) NSDictionary *lastWriteData;
@property(class, nonatomic, copy, nullable) NSArray *lastMergeFields;
+ (void)resetTestState;
+ (void)invokeLastSnapshotListenerWithSnapshot:(nullable FIRDocumentSnapshot *)snapshot
                                         error:(nullable NSError *)error;

- (id<FIRListenerRegistration>)addSnapshotListenerWithOptions:(FIRSnapshotListenOptions *)options
                                                     listener:
                                                         (void (^)(FIRDocumentSnapshot *_Nullable,
                                                                   NSError *_Nullable))listener;
- (void)getDocumentWithSource:(FIRFirestoreSource)source
                   completion:(void (^)(FIRDocumentSnapshot *_Nullable snapshot,
                                        NSError *_Nullable error))completion;
- (void)deleteDocumentWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)setData:(NSDictionary *)data completion:(void (^)(NSError *_Nullable error))completion;
- (void)setData:(NSDictionary *)data
          merge:(BOOL)merge
     completion:(void (^)(NSError *_Nullable error))completion;
- (void)setData:(NSDictionary *)data
    mergeFields:(NSArray *)mergeFields
     completion:(void (^)(NSError *_Nullable error))completion;
- (void)updateData:(NSDictionary *)data completion:(void (^)(NSError *_Nullable error))completion;
@end

@interface FIRWriteBatch : NSObject
@property(class, nonatomic, strong, nullable) NSError *commitError;
@property(class, nonatomic, copy, nullable) NSArray *recordedOperations;
+ (void)resetTestState;
- (FIRWriteBatch *)deleteDocument:(FIRDocumentReference *)document;
- (FIRWriteBatch *)setData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document;
- (FIRWriteBatch *)setData:(NSDictionary *)data
               forDocument:(FIRDocumentReference *)document
                     merge:(BOOL)merge;
- (FIRWriteBatch *)setData:(NSDictionary *)data
               forDocument:(FIRDocumentReference *)document
               mergeFields:(NSArray *)mergeFields;
- (FIRWriteBatch *)updateData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document;
- (void)commitWithCompletion:(void (^)(NSError *_Nullable error))completion;
@end

@interface FIRTransaction : NSObject
- (FIRDocumentSnapshot *)getDocument:(FIRDocumentReference *)document
                               error:(NSError *_Nullable *_Nullable)error;
- (void)deleteDocument:(FIRDocumentReference *)document;
- (void)setData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document;
- (void)setData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document merge:(BOOL)merge;
- (void)setData:(NSDictionary *)data
    forDocument:(FIRDocumentReference *)document
    mergeFields:(NSArray *)mergeFields;
- (void)updateData:(NSDictionary *)data forDocument:(FIRDocumentReference *)document;
@end

@interface FIRTransactionOptions : NSObject
@property(nonatomic, assign) NSInteger maxAttempts;
@end

@interface FIRFirestore : NSObject
@property(nonatomic, strong, nullable) FIRPersistentCacheIndexManager *persistentCacheIndexManager;
@property(nonatomic, strong) FIRFirestoreSettings *settings;

/** Test seam: instance returned by host-stub Common. */
@property(class, nonatomic, strong, nullable) FIRFirestore *testInstance;
@property(class, nonatomic, strong, nullable) FIRQuery *namedQueryResult;
@property(class, nonatomic, copy, nullable) NSString *lastNamedQueryName;
@property(class, nonatomic, copy, nullable) NSString *lastEmulatorHost;
@property(class, nonatomic, assign) NSInteger lastEmulatorPort;
@property(class, nonatomic, strong, nullable) NSError *operationError;
@property(class, nonatomic, strong, nullable) NSError *loadBundleError;
@property(class, nonatomic, assign) FIRLoadBundleTaskState loadBundleState;
+ (void)resetTestState;

- (void)disableNetworkWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)enableNetworkWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)clearPersistenceWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)waitForPendingWritesWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)terminateWithCompletion:(void (^)(NSError *_Nullable error))completion;
- (void)useEmulatorWithHost:(NSString *)host port:(NSInteger)port;
- (void)loadBundle:(NSData *)bundleData
        completion:(void (^)(FIRLoadBundleTaskProgress *_Nullable progress,
                             NSError *_Nullable error))completion;
- (id<FIRListenerRegistration>)addSnapshotsInSyncListener:(void (^)(void))listener;
- (void)runTransactionWithBlock:(id (^)(FIRTransaction *transaction, NSError **errorPointer))block
                     completion:(void (^)(id _Nullable result, NSError *_Nullable error))completion;
- (void)runTransactionWithOptions:(FIRTransactionOptions *)options
                            block:(id (^)(FIRTransaction *transaction, NSError **errorPointer))block
                       completion:
                           (void (^)(id _Nullable result, NSError *_Nullable error))completion;
- (void)getQueryNamed:(NSString *)name completion:(void (^)(FIRQuery *_Nullable query))completion;
- (FIRWriteBatch *)batch;
- (FIRDocumentReference *)documentWithPath:(NSString *)path;
@end

NS_ASSUME_NONNULL_END
