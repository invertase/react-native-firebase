import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

function Banner({ type, children, style, textStyle }) {
  return (
    <View style={[styles.banner, styles[type || 'default'], style]}>
      <Text
        numberOfLines={1}
        style={[styles.bannerText, textStyle]}
      >
        {children}
      </Text>
    </View>
  );
}

Banner.propTypes = {
  type: React.PropTypes.oneOf([
    'success',
    'warning',
    'error',
    'info',
  ]),
  children: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.array,
  ]).isRequired,
  style: View.propTypes.style,
  textStyle: Text.propTypes.style,
};

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    elevation: 3,
  },
  bannerText: {
    color: '#ffffff',
  },
  warning: {
    backgroundColor: '#FFC107',
  },
  error: {
    backgroundColor: '#f44336',
  },
  success: {
    backgroundColor: '#4CAF50',
  },
});

export default Banner;
