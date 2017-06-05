import { View, Text } from 'react-native';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RunStatus from '../../lib/RunStatus';
import Icon from './Icon';

class StatusIndicator extends Component {

  render() {
    const { status, progress } = this.props;

    switch (status) {
      case RunStatus.RUNNING:
        if (progress > 0) {
          return (
            <View style={{ width: 30, flex: 1, justifyContent: 'flex-end' }}>
              <Text style={{ fontSize: 11, marginBottom: 20 }}>
                {progress.toFixed(0)}%
              </Text>
            </View>
          );
        }

        return (
          <Icon color={'rgba(0, 0, 0, 0.2)'} name="autorenew" />
        );
      case RunStatus.OK:
        return (
          <Icon name={'done'} />
        );
      case RunStatus.ERR:
        return (
          <Icon color={'#f44336'} name="clear" />
        );
      default:
        return null;
    }
  }

}

StatusIndicator.propTypes = {
  status: PropTypes.oneOf(Object.values(RunStatus)),
  progress: PropTypes.number,
};

StatusIndicator.defaultProps = {
  status: null,
  progress: 0
};

module.exports = StatusIndicator;
