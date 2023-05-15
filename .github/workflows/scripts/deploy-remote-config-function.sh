#!/bin/bash
yarn firebase -c "$(pwd)/firebase.json" --project react-native-firebase-testing deploy --only functions:testFunctionRemoteConfigUpdate