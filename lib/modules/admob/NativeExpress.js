import React from 'react';
import AdMobComponent from './AdMobComponent';

function NativeExpress({ ...props }) {
  return (
    <AdMobComponent
      {...props}
      class={'RNFirebaseAdMobNativeExpress'}
    />
  );
}

NativeExpress.propTypes = AdMobComponent.propTypes;

NativeExpress.defaultProps = {
  // unitId: 'ca-app-pub-3940256099942544/2177258514',
  unitId: 'ca-app-pub-3940256099942544/8897359316',
  size: 'SMART_BANNER',
};

export default NativeExpress;
