import { PropTypes } from 'react';
import { requireNativeComponent, View } from 'react-native';

const Banner = {
  name: 'Banner',
  propTypes: {
    src: PropTypes.string,
  },
};

module.exports = requireNativeComponent('RNFirebaseAdMobBanner', Banner);
