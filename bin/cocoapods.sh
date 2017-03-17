#!/bin/sh

ios_dir=`pwd`/ios
if [ -d ios_dir ]
  then
  exit 0
fi

podfile="$ios_dir/Podfile"
template=`pwd`/node_modules/react-native-firebase/Podfile.template

project_name=$(node -pe "require('./package.json').name")

echo "Checking Podfile in iOS project $project_name ($podfile)"

if [ -f $podfile ]
  then
  echo ""
  echo "Found an existing Podfile, Do you want to override it? [N/y]"
  read generate_env_file

  if [ "$generate_env_file" != "y" ]
    then
    echo "Add the following pods":
    echo ""
    echo ""
    cat $template
    echo ""
    echo ""
    echo "and run 'pod install' to install RNFirebase for iOS"
    exit 0
  fi

  rm -f $podfile
  rm -f "$podfile.lock"
fi

echo "Adding Podfile to iOS project"

touch ios/Podfile
cat >ios/Podfile <<EOL
target '${project_name}' do
  # Uncomment the next line if you're using Swift or would like to use dynamic frameworks
  # use_frameworks!
  # Pods for '${project_name}'
end

# RNFirebase
pod 'Firebase/Auth'
pod 'Firebase/Analytics'
pod 'Firebase/AppIndexing'
pod 'Firebase/Core'
pod 'Firebase/Crash'
pod 'Firebase/Database'
pod 'Firebase/DynamicLinks'
pod 'Firebase/Messaging'
pod 'Firebase/RemoteConfig'
pod 'Firebase/Storage'
EOL

echo "Installing Pods"

pod install --project-directory=ios
