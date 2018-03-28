import React from 'react';
import AdMobComponent from './AdMobComponent';

function NativeExpress({ ...props }) {
  return <AdMobComponent {...props} class="RNFirebaseAdMobNativeExpress" />;
}

NativeExpress.propTypes = AdMobComponent.propTypes;

NativeExpress.defaultProps = {
  size: 'SMART_BANNER',
};

export default NativeExpress;
