#import "RNFBTestingCoverageProfile.h"
#import "RNFBTestingCoverageConfig.h"

#import <mach-o/dyld.h>
#import <mach-o/loader.h>
#import <mach-o/nlist.h>
#import <stdlib.h>
#import <string.h>

extern "C" {
int __llvm_profile_write_file(void);
void __llvm_profile_set_filename(const char *Name);
const char *__llvm_profile_get_filename(void);
}

typedef int (*RNFBProfileWriteFn)(void);
typedef void (*RNFBProfileSetFilenameFn)(const char *);

typedef struct {
  const struct mach_header *header;
  intptr_t slide;
  RNFBProfileWriteFn writeFile;
} RNFBTrackedProfileImage;

enum { RNFBTestingMaxTrackedProfileImages = 64 };

static RNFBTrackedProfileImage gRNFBTrackedProfileImages[RNFBTestingMaxTrackedProfileImages];
static uint32_t gRNFBTrackedProfileImageCount = 0;

/**
 * `%m` expands to a unique module signature so each instrumented Mach-O image
 * (app + dynamic RNFB frameworks under SPM/use_frameworks dynamic) writes its
 * own profraw instead of overwriting a single shared file.
 */
static NSString *RNFBTestingCoverageProfilePattern(void)
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  return [[paths firstObject] stringByAppendingPathComponent:@RNFB_COVERAGE_PROFILE_FILE_PATTERN];
}

/**
 * clang_rt.profile symbols are linked into each RNFB framework as local (`t`)
 * symbols — dlsym cannot see them. Resolve via the on-disk symbol table mapped
 * through __LINKEDIT (stroff/symoff are file offsets, not header-relative).
 */
static const void *RNFBTestingFindSymbolInHeader(
    const struct mach_header *header, intptr_t slide, const char *symbolName)
{
  if (header == NULL || symbolName == NULL) {
    return NULL;
  }
  if (header->magic != MH_MAGIC_64 && header->magic != MH_CIGAM_64) {
    return NULL;
  }

  const struct mach_header_64 *header64 = (const struct mach_header_64 *)header;
  const uint8_t *cursor = (const uint8_t *)(header64 + 1);
  const struct symtab_command *symtab = NULL;
  const struct segment_command_64 *linkedit = NULL;

  for (uint32_t i = 0; i < header64->ncmds; i++) {
    const struct load_command *command = (const struct load_command *)cursor;
    if (command->cmd == LC_SYMTAB) {
      symtab = (const struct symtab_command *)command;
    } else if (command->cmd == LC_SEGMENT_64) {
      const struct segment_command_64 *segment = (const struct segment_command_64 *)command;
      if (strcmp(segment->segname, SEG_LINKEDIT) == 0) {
        linkedit = segment;
      }
    }
    cursor += command->cmdsize;
  }

  if (symtab == NULL || linkedit == NULL || symtab->nsyms == 0) {
    return NULL;
  }

  const uintptr_t linkeditBase =
      (uintptr_t)slide + (uintptr_t)linkedit->vmaddr - (uintptr_t)linkedit->fileoff;
  const char *strings = (const char *)(linkeditBase + symtab->stroff);
  const struct nlist_64 *symbols =
      (const struct nlist_64 *)(linkeditBase + symtab->symoff);
  const size_t nameLength = strlen(symbolName);

  for (uint32_t i = 0; i < symtab->nsyms; i++) {
    uint32_t stringIndex = symbols[i].n_un.n_strx;
    if (stringIndex == 0) {
      continue;
    }
    const char *name = strings + stringIndex;
    if (strncmp(name, symbolName, nameLength) != 0 || name[nameLength] != '\0') {
      continue;
    }
    if ((symbols[i].n_type & N_TYPE) == N_UNDF || symbols[i].n_value == 0) {
      continue;
    }
    return (const void *)((uintptr_t)symbols[i].n_value + (uintptr_t)slide);
  }

  return NULL;
}

static bool RNFBTestingIsConfiguredFrameworkImage(const char *imageName)
{
  // Match the framework *basename* against config prefixes (default RNFB), not a
  // path segment like ".../RNFB-worktrees/.../PackageFrameworks/FirebaseCore...".
  if (imageName == NULL) {
    return false;
  }
#if !RNFB_COVERAGE_ENABLED
  return false;
#endif
  const char *framework = strstr(imageName, ".framework");
  if (framework == NULL) {
    return false;
  }
  const char *basename = framework;
  while (basename > imageName && basename[-1] != '/') {
    basename -= 1;
  }
  for (int i = 0; i < RNFB_COVERAGE_FRAMEWORK_PREFIX_COUNT; i++) {
    const char *prefix = RNFB_COVERAGE_FRAMEWORK_PREFIXES[i];
    if (prefix == NULL) {
      continue;
    }
    size_t prefixLen = strlen(prefix);
    if (prefixLen > 0 && strncmp(basename, prefix, prefixLen) == 0) {
      return true;
    }
  }
  return false;
}

static const char *RNFBTestingImageNameForHeader(const struct mach_header *header)
{
  uint32_t imageCount = _dyld_image_count();
  for (uint32_t index = 0; index < imageCount; index += 1) {
    if (_dyld_get_image_header(index) == header) {
      return _dyld_get_image_name(index);
    }
  }
  return NULL;
}

static void RNFBTestingTrackProfileImage(const struct mach_header *header, intptr_t slide)
{
  const char *imageName = RNFBTestingImageNameForHeader(header);
  if (!RNFBTestingIsConfiguredFrameworkImage(imageName)) {
    return;
  }

  // Mach-O symbol table names include the leading underscore.
  RNFBProfileWriteFn writeFile = (RNFBProfileWriteFn)RNFBTestingFindSymbolInHeader(
      header, slide, "___llvm_profile_write_file");
  if (writeFile == NULL || writeFile == __llvm_profile_write_file) {
    NSLog(@"[ios-native-coverage] skip image (no profile runtime): %s", imageName);
    return;
  }

  for (uint32_t i = 0; i < gRNFBTrackedProfileImageCount; i++) {
    if (gRNFBTrackedProfileImages[i].writeFile == writeFile) {
      return;
    }
  }

  if (gRNFBTrackedProfileImageCount >= RNFBTestingMaxTrackedProfileImages) {
    NSLog(@"[ios-native-coverage] tracked profile image cap reached (%d)",
          RNFBTestingMaxTrackedProfileImages);
    return;
  }

  gRNFBTrackedProfileImages[gRNFBTrackedProfileImageCount].header = header;
  gRNFBTrackedProfileImages[gRNFBTrackedProfileImageCount].slide = slide;
  gRNFBTrackedProfileImages[gRNFBTrackedProfileImageCount].writeFile = writeFile;
  gRNFBTrackedProfileImageCount += 1;
  NSLog(@"[ios-native-coverage] tracked profile image[%u]: %s",
        gRNFBTrackedProfileImageCount - 1,
        imageName);
}

static void RNFBTestingOnAddImage(const struct mach_header *header, intptr_t slide)
{
  RNFBTestingTrackProfileImage(header, slide);
}

__attribute__((constructor)) static void RNFBTestingCoverageProfileInit(void)
{
  // Invoked immediately for every image already loaded, then for later loads.
  // Prefer this over a flush-time _dyld_image_count walk: Jet flush must dump
  // each dynamic RNFB profile runtime before pull, and load-time discovery is
  // reliable while the process is still starting.
  _dyld_register_func_for_add_image(RNFBTestingOnAddImage);
}

static int RNFBTestingFlushTrackedProfileImages(const char *pattern)
{
  int worstStatus = 0;
  int wrote = 0;

  for (uint32_t i = 0; i < gRNFBTrackedProfileImageCount; i++) {
    const struct mach_header *header = gRNFBTrackedProfileImages[i].header;
    intptr_t slide = gRNFBTrackedProfileImages[i].slide;
    RNFBProfileWriteFn writeFile = gRNFBTrackedProfileImages[i].writeFile;

    // Prefer set_filename when present. Many RNFB dylibs dead-strip it; fall back to
    // writing the INSTR_PROF_PROFILE_NAME pointer (__llvm_profile_filename, 8-byte data).
    RNFBProfileSetFilenameFn setFilename =
        (RNFBProfileSetFilenameFn)RNFBTestingFindSymbolInHeader(
            header, slide, "___llvm_profile_set_filename");
    if (setFilename != NULL && pattern != NULL) {
      setFilename(pattern);
    } else {
      char **filenameVar = (char **)RNFBTestingFindSymbolInHeader(
          header, slide, "___llvm_profile_filename");
      if (filenameVar != NULL && pattern != NULL) {
        *filenameVar = (char *)pattern;
      }
    }

    int status = writeFile();
    NSLog(@"[ios-native-coverage] flush tracked image[%u] status=%d", i, status);
    if (status != 0) {
      worstStatus = status;
    } else {
      wrote += 1;
    }
  }

  return wrote > 0 ? 0 : worstStatus;
}

extern "C" void RNFBTestingConfigureCoverageProfilePath(void)
{
  const char *pattern = RNFBTestingCoverageProfilePattern().UTF8String;
  // Dynamic RNFB frameworks link a private copy of the profile runtime that often
  // lacks __llvm_profile_set_filename (dead-stripped). getenv is consulted by every
  // runtime copy on write, so export the pattern for framework flushes too.
  setenv("LLVM_PROFILE_FILE", pattern, 1);
  __llvm_profile_set_filename(pattern);
}

/**
 * Dump profile data from every tracked RNFB*.framework image that linked the LLVM
 * profile runtime, then from the main executable. Dynamic frameworks keep a separate
 * copy of the runtime/counters; calling write_file only in the app image misses
 * packages/. Load-time dyld add-image registration discovers those images; atexit
 * alone is not enough because Jet pulls Documents/*.profraw before terminateApp.
 */
extern "C" int RNFBTestingFlushCoverageProfile(void)
{
  RNFBTestingConfigureCoverageProfilePath();
  const char *pattern = getenv("LLVM_PROFILE_FILE");

  // Catch any images loaded after our constructor (should be rare for linked pods).
  uint32_t imageCount = _dyld_image_count();
  for (uint32_t index = 0; index < imageCount; index += 1) {
    RNFBTestingTrackProfileImage(
        _dyld_get_image_header(index), _dyld_get_image_vmaddr_slide(index));
  }

  int trackedStatus = RNFBTestingFlushTrackedProfileImages(pattern);

  // Write the app image LAST so counters for this flush (including FindSymbol /
  // tracked-image iteration) are present in the app profraw Jet pulls.
  int status = __llvm_profile_write_file();
  NSLog(
      @"[ios-native-coverage] flush main status=%d tracked=%u trackedStatus=%d path=%@ runtimePath=%s",
      status,
      gRNFBTrackedProfileImageCount,
      trackedStatus,
      RNFBTestingCoverageProfilePattern(),
      __llvm_profile_get_filename() ?: "(null)");

  int wroteMain = (status == 0) ? 1 : 0;
  int wroteTracked = (trackedStatus == 0 && gRNFBTrackedProfileImageCount > 0) ? 1 : 0;
  NSLog(
      @"[ios-native-coverage] flush complete mainWrote=%d trackedOk=%d pattern=%s",
      wroteMain,
      wroteTracked,
      pattern ?: "(null)");

  if (wroteMain || gRNFBTrackedProfileImageCount > 0) {
    return (status == 0 || wroteTracked) ? 0 : status;
  }
  return status != 0 ? status : trackedStatus;
}
