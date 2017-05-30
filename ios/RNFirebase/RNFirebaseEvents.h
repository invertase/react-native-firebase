#ifndef RNFirebaseEvents_h
#define RNFirebaseEvents_h

#import <Foundation/Foundation.h>

#define SYSTEM_VERSION_EQUAL_TO(v)                  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedSame)
#define SYSTEM_VERSION_GREATER_THAN(v)              ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedDescending)
#define SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(v)  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN(v)                 ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN_OR_EQUAL_TO(v)     ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedDescending)
#define RNFIREBASE_QUEUE_NAME                        "com.invertase.firebase.WorkerQueue"

static NSString *const kRNFirebaseInitialized = @"RNFirebaseInitializedEvent";
static NSString *const INITIALIZED_EVENT = @"RNFirebaseInitialized";

static NSString *const AUTH_CHANGED_EVENT = @"onAuthStateChanged";
static NSString *const AUTH_ERROR_EVENT = @"authError";
static NSString *const AUTH_ANONYMOUS_ERROR_EVENT = @"authAnonymousError";
static NSString *const DEBUG_EVENT = @"debug";

// Database
static NSString *const DATABASE_DATA_EVENT = @"database_event";
static NSString *const DATABASE_ERROR_EVENT = @"database_error";
static NSString *const DATABASE_TRANSACTION_EVENT = @"database_transaction_event";

static NSString *const DATABASE_VALUE_EVENT = @"value";
static NSString *const DATABASE_CHILD_ADDED_EVENT = @"child_added";
static NSString *const DATABASE_CHILD_MODIFIED_EVENT = @"child_changed";
static NSString *const DATABASE_CHILD_REMOVED_EVENT = @"child_removed";
static NSString *const DATABASE_CHILD_MOVED_EVENT = @"child_moved";


// Storage
static NSString *const STORAGE_EVENT = @"storage_event";
static NSString *const STORAGE_ERROR = @"storage_error";

static NSString *const STORAGE_STATE_CHANGED = @"state_changed";
static NSString *const STORAGE_UPLOAD_SUCCESS = @"upload_success";
static NSString *const STORAGE_UPLOAD_FAILURE = @"upload_failure";
static NSString *const STORAGE_DOWNLOAD_SUCCESS = @"download_success";
static NSString *const STORAGE_DOWNLOAD_FAILURE = @"download_failure";

// Messaging
static NSString *const MESSAGING_TOKEN_REFRESHED = @"messaging_token_refreshed";
static NSString *const MESSAGING_NOTIFICATION_RECEIVED = @"messaging_notification_received";

#endif
