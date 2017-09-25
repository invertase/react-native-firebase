#ifndef RNFirebaseEvents_h
#define RNFirebaseEvents_h

#import <Foundation/Foundation.h>

static NSString *const AUTH_CHANGED_EVENT = @"onAuthStateChanged";
static NSString *const AUTH_ERROR_EVENT = @"authError";
static NSString *const AUTH_ANONYMOUS_ERROR_EVENT = @"authAnonymousError";

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

// AdMob
static NSString *const ADMOB_INTERSTITIAL_EVENT = @"interstitial_event";
static NSString *const ADMOB_REWARDED_VIDEO_EVENT = @"rewarded_video_event";

// Links
static NSString *const LINKS_DYNAMIC_LINK_RECEIVED = @"dynamic_link_received";

#endif
