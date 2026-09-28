import { getApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';

// Referencing both native modules here (not just declaring them as
// dependencies) keeps the JS graph from tree-shaking/dead-code-eliminating
// the native dependency before it ever reaches the linker. This fixture
// still exercises the native iOS link step for GitHub #9158 (missing
// app-target FirebaseCore) and #9202 (duplicate Firebase symbols from
// static RNFB archives) under SPM + dynamic frameworks.
getMessaging(getApp());
