// Subclass FIRAppCheckDebugProvider here
// https://developer.apple.com/library/archive/documentation/General/Conceptual/DevPedia-CocoaCore/MethodOverriding.html

// 1. have a new nullable configuredDebugToken property
// 2. override implementation of currentDebutToken to:
//   - return configuredDebugToken if it exists,
//   - else return [super currentDebugToken] if not
