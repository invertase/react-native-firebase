import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import Toast from 'react-native-simple-toast';

import RunStatus from '../../lib/RunStatus';
import { runTest } from '../tests/index';

import Icon from './Icon';

class TestControlButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleOnPress = this.handleOnPress.bind(this);
  }

  testIsPending() {
    const { test: { id }, pendingTestIds } = this.props;
    return !!pendingTestIds[id];
  }

  handleOnPress() {
    const { test: { id, description } } = this.props;

    runTest(id);
    // Toast.show(`Running ${description}.`);
  }

  render() {
    const { test: { status } } = this.props;

    if (status !== RunStatus.STARTED && !this.testIsPending()) {
      return (
        <Icon
          color={'#ffffff'}
          size={28}
          name="play circle filled"
          onPress={this.handleOnPress}
        />
      );
    }

    return null;
  }

}

TestControlButton.propTypes = {
  test: PropTypes.shape({
    id: PropTypes.number.isRequired,
    status: PropTypes.string,
    description: PropTypes.string.isRequired,
  }).isRequired,

  pendingTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,
};

TestControlButton.defaultProps = {

};

function mapStateToProps({ tests, pendingTestIds }, { testId }) {
  const test = tests[testId];

  return {
    test,
    pendingTestIds,
  };
}

module.exports = connect(mapStateToProps)(TestControlButton);
