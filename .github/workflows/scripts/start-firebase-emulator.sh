#!/bin/bash
if ! [ -x "$(command -v firebase)" ]; then
  echo "❌ Firebase-tools CLI is missing. Run 'npm i -g firebase-tools' or the equivalent"
  exit 1
fi

EMU_START_COMMAND="firebase emulators:start --only auth,database,firestore,functions,storage --project react-native-firebase-testing --debug"
#EMU_START_COMMAND="sleep 120"
MAX_RETRIES=3
MAX_CHECKATTEMPTS=60
CHECKATTEMPTS_WAIT=1

# Make sure functions are ready to go
pushd "$(dirname "$0")/functions" && yarn && yarn build && popd


RETRIES=1
while [ $RETRIES -le $MAX_RETRIES ]; do

  if [ "$1" == "--no-daemon" ]; then
    echo "Starting Firebase Emulator Suite in foreground."
    $EMU_START_COMMAND
    exit 0
  else
    echo "Starting Firebase Emulator Suite in background."
    $EMU_START_COMMAND &
    CHECKATTEMPTS=1
    while [ $CHECKATTEMPTS -le $MAX_CHECKATTEMPTS ]; do
      sleep $CHECKATTEMPTS_WAIT
      if curl --output /dev/null --silent --fail http://localhost:8080; then
        echo "Firebase Emulator Suite is online!"
        exit 0;
      fi
      echo "Waiting for Firebase Emulator Suite to come online, check $CHECKATTEMPTS of $MAX_CHECKATTEMPTS..."
      ((CHECKATTEMPTS = CHECKATTEMPTS + 1))
    done
  fi

  echo "Firebase Emulator Suite did not come online in $MAX_CHECKATTEMPTS checks. Try $RETRIES of $MAX_RETRIES."
  ((RETRIES = RETRIES + 1))

done
echo "Firebase Emulator Suite did not come online after $MAX_RETRIES attempts."
exit 1
