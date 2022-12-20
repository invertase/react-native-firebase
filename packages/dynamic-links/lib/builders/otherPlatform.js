import { isObject, isString } from '@react-native-firebase/app/lib/common';

export default function buildOtherPlatform(otherPlatformParameters) {
  if (!isObject(otherPlatformParameters)) {
    throw new Error("'dynamicLinksParams.otherPlatform' must be an object.");
  }

  const params = {};

  if (otherPlatformParameters.fallbackUrl) {
    if (!isString(otherPlatformParameters.fallbackUrl)) {
      throw new Error("'dynamicLinksParams.otherPlatform.fallbackUrl' must be a string.");
    }

    params.fallbackUrl = otherPlatformParameters.fallbackUrl;
  }

  return params;
}
