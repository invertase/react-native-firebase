#ifndef RNFirebaseStorage_h
#define RNFirebaseStorage_h

#import "Firebase.h"
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"

@interface RNFirebaseStorage : RCTEventEmitter <RCTBridgeModule> {

}

@property (nonatomic) NSString *_storageUrl;

@end

#endif
