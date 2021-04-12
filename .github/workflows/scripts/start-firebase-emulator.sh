#!/bin/bash
if ! [ -x "$(command -v firebase)" ]; then
  echo "❌ Firebase-tools CLI is missing. Run 'npm i -g firebase-tools' or the equivalent"
  exit 1
fi

EMU_START_COMMAND="firebase emulators:start --only firestore,auth --project react-native-firebase-testing"

if [ "$1" == "--no-daemon" ]; then
  $EMU_START_COMMAND
else
  $EMU_START_COMMAND &
  until curl --output /dev/null --silent --fail http://localhost:8080; do
    echo "Waiting for Firestore emulator to come online..."
    sleep 2
  done
  echo "Firestore emulator is online!"
fi
