import React, { PropTypes } from 'react';
import { requireNativeComponent, View } from 'react-native';

class Banner extends React.Component {

  static propTypes = {
    ...View.propTypes,
    size: PropTypes.string,
    unitId: PropTypes.string,
    onAdLoaded: PropTypes.func,
  };

  static defaultProps = {
    size: 'SMART_BANNER',
    unitId: 'ca-app-pub-3940256099942544/6300978111', // Testing
  };

  constructor() {
    super();
    this.state = {
      width: 0,
      height: 0,
    };
  }

  onBannerEvent = ({ nativeEvent }) => {
    if (this.props[nativeEvent.type]) {
      if (nativeEvent.type === 'onAdFailedToLoad') {
        const error = new Error(nativeEvent.payload.message);
        error.code = nativeEvent.payload.code;
        this.props[nativeEvent.type](error);
      } else {
        this.props[nativeEvent.type](nativeEvent.payload || {});
      }
    }

    if (nativeEvent.type === 'onSizeChange') this.updateSize(nativeEvent.payload);
  };

  updateSize = ({ width, height }) => {
    this.setState({ width, height });
  };

  render() {
    return (
      <RNFirebaseAdMobBanner
        {...this.props}
        style={[this.props.style, { ...this.state }]}
        bannerEvent={this.onBannerEvent}
      />
    );
  }

}

const RNFirebaseAdMobBanner = requireNativeComponent('RNFirebaseAdMobBanner', Banner);

export default Banner;
