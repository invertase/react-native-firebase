#ifndef RNFirebaseStorage_h
#define RNFirebaseStorage_h

#import "Firebase.h"
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNFirebaseStorage : RCTEventEmitter <RCTBridgeModule> {

}

@property (nonatomic) NSString *_storageUrl;

@end

#endif
