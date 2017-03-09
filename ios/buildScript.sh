#!/bin/sh

frameworks="Firebase FirebaseAnalytics"

source "${SRCROOT}/Pods/Target Support Files/Pods-Firestack/Pods-Firestack-frameworks.sh"
FRAMEWORKS_FOLDER_PATH=""

for framework in $frameworks
do

install_framework "${SRCROOT}/Pods/$framework"

done
