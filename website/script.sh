#!/bin/bash
# As we currently have two deployments of react-native-firebase. 
# One is one producetion https://vercel.com/invertase/react-native-firebase
# Another is new modules located at https://vercel.com/invertase/react-native-firebase-next

# This script when combined with the ignore build step command https://vercel.com/invertase/react-native-firebase-next/settings/git
# ensures that only the @invertase/next will cause a build on the new modules deployments.

# This does not affect the main production deployment.

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "@invertase/next"  ]] ; then
  # Proceed with the build
    echo "✅ - Detected this is a build of @invertase/next - build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - This is not a build of @invertase/next build cancelled"
  exit 0;
fi
 