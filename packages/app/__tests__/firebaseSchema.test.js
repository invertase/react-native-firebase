const schema = require('../firebase-schema.json');

describe('firebase-schema.json', () => {
  it('defines messaging_installation_id_enabled as a boolean react-native config key', () => {
    const key = schema.properties['react-native'].properties.messaging_installation_id_enabled;
    expect(key).toBeDefined();
    expect(key.type).toBe('boolean');
    expect(key.description).toMatch(/Installation ID|FID/i);
    expect(key.description).toMatch(/mutual exclusion|token/i);
  });

  it('defines analytics_without_ad_id_support as a boolean react-native config key', () => {
    const key = schema.properties['react-native'].properties.analytics_without_ad_id_support;
    expect(key).toBeDefined();
    expect(key.type).toBe('boolean');
    expect(key.description).toMatch(/FirebaseAnalyticsCore|ad ?id/i);
  });

  it('defines analytics_enable_ad_support as a boolean react-native config key', () => {
    const key = schema.properties['react-native'].properties.analytics_enable_ad_support;
    expect(key).toBeDefined();
    expect(key.type).toBe('boolean');
    expect(key.description).toMatch(/AdSupport/);
    expect(key.description).toMatch(/\$RNFirebaseAnalyticsEnableAdSupport/);
  });

  it('defines analytics_google_app_measurement_on_device_conversion as a boolean react-native config key', () => {
    const key =
      schema.properties['react-native'].properties
        .analytics_google_app_measurement_on_device_conversion;
    expect(key).toBeDefined();
    expect(key.type).toBe('boolean');
    expect(key.description).toMatch(/GoogleAdsOnDeviceConversion/);
    expect(key.description).toMatch(/\$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion/);
  });
});
