#import "RNFBTestingCoverageProfile.h"

extern "C" {
int __llvm_profile_write_file(void);
void __llvm_profile_set_filename(const char *Name);
const char *__llvm_profile_get_filename(void);
}

static NSString *RNFBTestingCoverageProfilePath(void)
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  return [[paths firstObject] stringByAppendingPathComponent:@"coverage.profraw"];
}

extern "C" void RNFBTestingConfigureCoverageProfilePath(void)
{
  __llvm_profile_set_filename(RNFBTestingCoverageProfilePath().UTF8String);
}

extern "C" int RNFBTestingFlushCoverageProfile(void)
{
  RNFBTestingConfigureCoverageProfilePath();
  int status = __llvm_profile_write_file();
  NSLog(
      @"[ios-native-coverage] flush status=%d path=%@ runtimePath=%s",
      status,
      RNFBTestingCoverageProfilePath(),
      __llvm_profile_get_filename() ?: "(null)");
  return status;
}
