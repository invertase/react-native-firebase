---
title: GoogleService-Info.plist was not recognized
description: Your GoogleService-Info.plist file needs to be registered within XCode before using React Native Firebase with iOS.
tags:
    - build
    - ios
---

# GoogleService-Info.plist was not recognized

The GoogleService-Info.plist file provides Firebase with your projects credentials to connect
to your Firebase Project. Without this file, your app will crash right after booting.

Unfortunatly, the file needs to be registered with XCode in order to be recognised. Even with the file
present within your projects `/ios` directory, XCode will ignore it if it has not been registered.

## Registering the plist file

To register the file, open XCode and select your projects `/ios` directory. Ensure your GoogleService-Info.plist
file has been downloaded and added to this directory.

> Can't find the plist file? Follow the [iOS installation guide](/{{ latest_version }}/installation/ios).

- At the top left of Xcode,select the directory listing icon (folder icon).
- Right click on your project name and select `Add files to [project]`.
- Select the GoogleService-Info.plist file.
- Click "Add".

Now rebuild your project, XCode should successfully recognise the file.
