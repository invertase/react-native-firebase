import React, { Component } from 'react';
import PropTypes from 'prop-types';
import some from 'lodash.some';
import { connect } from 'react-redux';

// import Toast from 'react-native-simple-toast';

import { runTests } from '../tests/index';
import RunStatus from '../../lib/RunStatus';

import Icon from '../components/Icon';

class OverviewControlButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleOnPress = this.handleOnPress.bind(this);
  }

  testSuitesAreRunning() {
    const { testSuites } = this.props;

    return some(Object.values(testSuites), ({ status }) => status === RunStatus.RUNNING);
  }

  handleOnPress() {
    const { focusedTestIds, pendingTestIds, tests } = this.props;
    runTests(tests, { focusedTestIds, pendingTestIds });
    // Toast.show('Running all suite tests.');
  }

  render() {
    if (this.testSuitesAreRunning()) {
      return (
        <Icon
          color={'#ffffff'}
          size={28}
          name="autorenew"
        />
      );
    }

    return (
      <Icon
        color={'#ffffff'}
        size={28}
        name="play circle filled"
        onPress={this.handleOnPress}
      />
    );
  }
}

OverviewControlButton.propTypes = {
  tests: PropTypes.objectOf(PropTypes.object).isRequired,
  testSuites: PropTypes.objectOf(PropTypes.object).isRequired,
  focusedTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,
  pendingTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,
};


function mapStateToProps({ tests, testSuites, focusedTestIds, pendingTestIds }) {
  return {
    tests,
    testSuites,
    focusedTestIds,
    pendingTestIds,
  };
}

export default connect(mapStateToProps)(OverviewControlButton);
