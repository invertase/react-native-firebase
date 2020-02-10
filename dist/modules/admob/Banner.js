import React from 'react';
import AdMobComponent from './AdMobComponent';

function Banner({ ...props
}) {
  return <AdMobComponent {...props} class="RNFirebaseAdMobBanner" />;
}

Banner.propTypes = AdMobComponent.propTypes;
Banner.defaultProps = {
  size: 'SMART_BANNER'
};
export default Banner;