import { describe, expect, it } from '@jest/globals';
import { setFireBaseMessagingAndroidManifest } from '../src/android/setupFirebaseNotifationIcon';
import { ExpoConfig } from '@expo/config-types';
import { ManifestApplication } from '@expo/config-plugins/build/android/Manifest';

// Test to understand current functionality and identify improvements needed
describe('Enhanced Firebase Messaging Plugin Tests', function () {
  
  // Test case 1: Standard Expo notification configuration
  it('handles standard Expo notification configuration', async function () {
    const config: ExpoConfig = {
      name: 'Test App',
      slug: 'test-app',
      notification: {
        icon: './assets/notification-icon.png',
        color: '#FF0000'
      }
    };
    
    const manifestApplication: ManifestApplication = {
      $: { 'android:name': '' },
      'meta-data': []
    };
    
    setFireBaseMessagingAndroidManifest(config, manifestApplication);
    
    // Should set notification icon
    expect(manifestApplication['meta-data']).toContainEqual({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_icon',
        'android:resource': '@drawable/notification_icon',
      },
    });
    
    // Should set notification color
    expect(manifestApplication['meta-data']).toContainEqual({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_color',
        'android:resource': '@color/notification_icon_color',
        'tools:replace': 'android:resource',
      },
    });
  });

  // Test case 2: Custom icon path
  it('handles different icon path formats', async function () {
    const config: ExpoConfig = {
      name: 'Test App',
      slug: 'test-app',
      notification: {
        icon: './custom/path/icon.png'
      }
    };
    
    const manifestApplication: ManifestApplication = {
      $: { 'android:name': '' },
      'meta-data': []
    };
    
    setFireBaseMessagingAndroidManifest(config, manifestApplication);
    
    // Currently hardcodes to @drawable/notification_icon regardless of path
    expect(manifestApplication['meta-data']).toContainEqual({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_icon',
        'android:resource': '@drawable/notification_icon',
      },
    });
  });

  // Test case 3: Missing notification config
  it('warns when notification config is missing', async function () {
    const warnOrig = console.warn;
    let warnCalled = false;
    console.warn = (_: string) => {
      warnCalled = true;
    };
    
    const config: ExpoConfig = {
      name: 'Test App',
      slug: 'test-app'
      // No notification config
    };
    
    const manifestApplication: ManifestApplication = {
      $: { 'android:name': '' },
      'meta-data': []
    };
    
    setFireBaseMessagingAndroidManifest(config, manifestApplication);
    
    expect(warnCalled).toBeTruthy();
    console.warn = warnOrig;
  });
});