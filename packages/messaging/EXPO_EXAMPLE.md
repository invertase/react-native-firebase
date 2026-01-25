# @react-native-firebase/messaging Expo Configuration Example

This example demonstrates how to configure Firebase Cloud Messaging notification icons and colors in an Expo managed workflow project.

## Configuration

Add the following to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "name": "Firebase Messaging Example",
    "slug": "firebase-messaging-example",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF6B35"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@react-native-firebase/messaging"
    ]
  }
}
```

## Key Points

1. **Notification Icon**: Must be a pure white PNG icon on a transparent background
2. **Notification Color**: Hex color code that will be used to tint notification elements
3. **Plugin**: The `@react-native-firebase/messaging` plugin is automatically applied when the package is installed
4. **Android Only**: iOS uses the app icon for notifications by default

## Creating the Notification Icon

Your notification icon should be:
- **Pure white** silhouette on a transparent background
- **Square** aspect ratio
- **High resolution** (recommended 192x192px or higher)
- **Simple design** that's recognizable at small sizes

Example using ImageMagick to convert a regular icon:
```bash
convert your-icon.png -colorspace Gray -threshold 50% -negate notification-icon.png
```

## Verification

When you run `expo prebuild`, you should see these messages:
```
[@react-native-firebase/messaging] Android notification icon configured from app.json
[@react-native-firebase/messaging] Android notification color configured from app.json
```

If you don't have notification configuration, you'll see a warning with instructions on how to add it.

## Testing

Send a test notification to verify your configuration:
```javascript
import messaging from '@react-native-firebase/messaging';

// Request permission (iOS)
await messaging().requestPermission();

// Get FCM token
const token = await messaging().getToken();
console.log('FCM Token:', token);

// Listen for messages
messaging().onMessage(async remoteMessage => {
  console.log('Received message:', remoteMessage);
});
```