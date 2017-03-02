#!/bin/sh

## https://github.com/auth0/react-native-lock/blob/master/bin/cocoapods.sh

ios_dir=`pwd`/ios
if [ -d ios_dir ]
  then
  exit 0
fi

podfile="$ios_dir/Podfile"
template=`pwd`/node_modules/react-native-firebase/ios/Podfile.template

echo "Checking Podfile in iOS project ($podfile)"

if [ -f $podfile ]
  then
  echo ""
  echo "Found an existing Podfile, Do you want to override it? [N/y]"
  read generate_env_file

  if [ "$generate_env_file" != "y" ]
    then

    # pod outdated | grep "The following pod updates are available:"
    # status=$?
    # if [ $status -eq 0 ]; then
    #   echo "From what I can tell, there look to be updates available..."
    #   echo "Do you want to update your cocoapods? [N/y]"
    #   read update_pods
    #   if [ "$update_pods" != "y" ]
    #     then
    #       pod update --project-directory=ios
    #       exit 0
    #     else
    #       exit 0
    #   fi
    # fi

    echo "Add the following pods":
    echo ""
    echo ""
    cat $template
    echo ""
    echo ""
    echo "and run 'pod install' to install Firestack for iOS"
    exit 0
  fi

  rm -f $podfile
  rm -f "$podfile.lock"
fi

echo "Adding Podfile to iOS project"

cd ios
pod init >/dev/null 2>&1
cat $template >> $podfile
cd ..

echo "Installing Pods"

pod install --project-directory=ios
