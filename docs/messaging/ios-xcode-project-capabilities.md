---
title: Configure Xcode Project notification capabilities
description: Configure your Xcode Project capabilities to support Remote Notifications for FCM.
---

# Configure Xcode Project notification capabilities

### Enable Capabilities

After you have set up the certificates, you have to enable push notifications in Xcode. 

#### Step 1:

Open your react native project in Xcode. Click `Open another project...`

![Step 1](https://images.prismic.io/invertase/58bd0c99-7c42-4f7f-b18b-2d729901dda4_capabilities+-+1.png?auto=compress,format)

#### Step 2:

Open `path/to/project/testIos/ios/testIos.xcworkspace` and click `open`

![Step 2](https://images.prismic.io/invertase/d7fa08c0-1eac-4920-a2b3-70770e48d716_capabilities+-+2.png?auto=compress,format)


#### Step 3:

Click the target which is the name of the project, in this instance, the name is `testIos`. Then click `+ Capability`.

![Step 3](https://images.prismic.io/invertase/3378457a-cd17-4528-ac27-38cb0528a1bc_Capabilities+-+3.png?auto=compress,format)
---

#### Step 4:

Select `Background Modes` & `Push Notifications` (Not shown on screenshot).

![Step 4](https://images.prismic.io/invertase/f3033f4d-6d1a-4117-81f6-279f8ced2791_Capabilities+-+4.png?auto=compress,format)

#### Step 5:

Your screen ought to have `Background Modes` & `Push Notifications` as highlighted. Please select `Remote notifications`.

![Step 5](https://images.prismic.io/invertase/8ca4a09f-d686-4b32-9d39-f42fa0f144aa_Capabilities+-+5.png?auto=compress,format)

Congratulations. You have now configured Xcode for push notifications.

### Debugging

If you're having problems with messages not being received, check out the following blog post for help:
https://firebase.googleblog.com/2017/01/debugging-firebase-cloud-messaging-on.html


