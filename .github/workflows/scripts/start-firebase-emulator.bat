@REM this pushd is likely not needed, but just in case
pushd "%~dp0"
@REM this is just to see what our current directory is. Should be .github/workflow/scripts
echo %cd%
@REM strangely, unless you specify the config file as being right in the current directory, it won't find it, and everything fails
yarn firebase emulators:start --config %cd%\firebase.json --only auth,database,firestore,functions,storage --project react-native-firebase-testing