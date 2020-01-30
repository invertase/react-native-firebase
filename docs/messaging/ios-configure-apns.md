---
title: Configure Apple Push Notification service for FCM
description: Create an Apple Push Notification authentication key, a provisioning profile and an App ID to use with FCM on iOS.
---

# Configure APNs for FCM

### Setup Certificates

#### Step 1:

Navigate to Certificates, Identifiers and Profiles.

![Step 1](https://images.prismic.io/invertase/b498548c-de02-42bd-a7cf-e2b9a78f3803_FCM+-+step+1.png?auto=compress,format)

#### Step 2:

Navigate to keys & click the `plus` button to create a new key.

![Step 2](https://images.prismic.io/invertase/784f9941-efb2-4dd8-b74c-bd40f7ea0b0b_FCM+-+step+2.png?auto=compress,format)

#### Step 3:

Enter a name for your key & ensure you've enabled `Apple Push Notiffications service (APNs)`.

![Step 3](https://images.prismic.io/invertase/8e1ba901-ec90-43d2-ae14-3681c9030610_FCM+-+step+3.png?auto=compress,format)

#### Step 4:

Register your key, ensure you download it & keep safe.

![Step 4](https://images.prismic.io/invertase/ac5070c4-87ec-427a-ba6d-590f5feddbc8_FCM+-+step+4.png?auto=compress,format)

#### Step 5:

Register your key, ensure you download it & keep safe.

![Step 5](https://images.prismic.io/invertase/ac5070c4-87ec-427a-ba6d-590f5feddbc8_FCM+-+step+4.png?auto=compress,format)


Congratulations. You've setup the authentication key necessary for push notifications. You now need to create an App ID for your app via the Apple developer console.

### Create an App ID

#### Step 1:

Navigate to Certificates, Identifiers and Profiles.

![Step 1](https://images.prismic.io/invertase/b498548c-de02-42bd-a7cf-e2b9a78f3803_FCM+-+step+1.png?auto=compress,format)

#### Step 2:

Navigate to Identifiers & click the plus button to create a new App ID (identifier).

![Step 2](https://images.prismic.io/invertase/47f748c2-e4fb-4b50-83bb-c04e0ea4a9ac_App+ID+-+Step+2.png?auto=compress,format)

#### Step 3:

Register a new `App ID` identifier & click `continue`.

![Step 3](https://images.prismic.io/invertase/09f583e3-4c0a-4bb4-9b09-e32cf6565940_App+ID+-+Step+3.png?auto=compress,format)

#### Step 4:

Select `iOS, tvOS, watchOS` platform & add whatever description you would like. Explicity set you `Bundle ID`, we recommend opening your project in Xcode
and retrieving your Bundle Identifier from there as demonstrated below.

![Step 4](https://images.prismic.io/invertase/4be07992-afbd-4ae8-b5a4-475d70221f88_App+ID+-+Step+4.png?auto=compress,format)

#### Step 5:

Select `Push Notifications` from the list and press `continue`. Then click `Register` on the next screen. 

![Step 5](https://images.prismic.io/invertase/473d1a5f-cbff-4d1f-946f-8ee4984c38ec_App+ID+-+Step+5.png?auto=compress,format)

Congratulations. You've registered your App ID. You now need to create a provisioning profile via the Apple developer console. This is needed to test your app whilst under development and 
not yet published on the App Store.

### Create a Provisioning Profile

#### Step 1:

Navigate to Certificates, Identifiers and Profiles.

![Step 1](https://images.prismic.io/invertase/b498548c-de02-42bd-a7cf-e2b9a78f3803_FCM+-+step+1.png?auto=compress,format)

#### Step 2:

Navigate to Profiles & click the plus button to create a new Provisioning Profile.

![Step 2](https://images.prismic.io/invertase/4d7093e7-0129-48e9-aa23-4de6ed8d0b15_Provision+Profile+-+Step+2+.png?auto=compress,format)

#### Step 3:

Select `iOS App development` and click `continue`.

![Step 3](https://images.prismic.io/invertase/158750da-8a8c-4498-a021-bf84637dcd45_Provision+Profile+-+Step+3.png?auto=compress,format)

#### Step 4:

Select your `App ID` & click `continue`.

![Step 4](https://images.prismic.io/invertase/540891a7-f9a2-4052-b12b-b3e1ff30f87d_Provision+Profile+-+Step+4.png?auto=compress,format)

#### Step 5:

Select the certificate you created earlier, & click `continue`. In the next view, select `iPhone` & click `continue`.

![Step 5](https://images.prismic.io/invertase/1f0ad823-03b6-4b45-853f-b15594894505_Provision+Profile+-+Step+5.png?auto=compress,format)


#### Step 6:

Create a `Provisioning Profile Name` & click `generate`. Then `Download` & keep it safe.You should now see your newly generated provisioning profile in the profiles tab.

![Step 6](https://images.prismic.io/invertase/df020fa5-b3a1-45db-8c3c-e3e7868ba09c_Provision+Profile+-+Step+6.png?auto=compress,format)

Congratulations. You have now completed configuring Apple Push Notification service with Firebase Cloud Messaging. You have setup the certificates.
---

## Next

<Grid>
	<Block
		title="Configure Xcode Project notification capabilities"
		to="/messaging/ios-xcode-project-capabilities"
		icon="tool"
		color="#2196F3"
	>
		Configure your Xcode Project capabilities to support Remote Notifications for FCM.
  	</Block>
</Grid>
