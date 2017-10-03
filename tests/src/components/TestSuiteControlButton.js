import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// import Toast from 'react-native-simple-toast';

import RunStatus from '../../lib/RunStatus';
import { runTests } from '../tests/index';

import Icon from './Icon';

class TestSuiteControlButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.toggleOnlyShowFailingTests = this.toggleOnlyShowFailingTests.bind(this);
    this.startTestSuite = this.startTestSuite.bind(this);
  }

  startTestSuite() {
    const { testSuite: { name, testIds }, tests, focusedTestIds, pendingTestIds } = this.props;

    const testSuiteTests = testIds.reduce((memo, testId) => {
      // eslint-disable-next-line no-param-reassign
      memo[testId] = tests[testId];
      return memo;
    }, {});

    runTests(testSuiteTests, { focusedTestIds, pendingTestIds });

    // Toast.show(`Running ${name} tests.`);
  }

  toggleOnlyShowFailingTests() {
    const { onlyShowFailingTests, onFilterChange } = this.props;
    onFilterChange({ onlyShowFailingTests: !onlyShowFailingTests });
  }

  render() {
    const { testSuite: { status }, onlyShowFailingTests } = this.props;

    if (status === RunStatus.ERR) {
      return (
        <Icon
          color={onlyShowFailingTests ? '#ffffff' : 'rgba(255, 255, 255, 0.54)'}
          size={28}
          name="error outline"
          onPress={this.toggleOnlyShowFailingTests}
        />
      );
    } else if (status !== RunStatus.RUNNING) {
      return (
        <Icon
          color={'#ffffff'}
          size={28}
          name="play circle filled"
          onPress={this.startTestSuite}
        />
      );
    }

    return null;
  }

}

TestSuiteControlButton.propTypes = {
  testSuite: PropTypes.shape({
    status: PropTypes.oneOf(Object.values(RunStatus)),
  }).isRequired,

  tests: PropTypes.objectOf(PropTypes.object).isRequired,
  focusedTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,
  pendingTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,

  onlyShowFailingTests: PropTypes.bool,

  onFilterChange: PropTypes.func.isRequired,
};

TestSuiteControlButton.defaultProps = {
  onlyShowFailingTests: false,
};


function mapStateToProps({ tests, testSuites, focusedTestIds, pendingTestIds }, { testSuiteId }) {
  const testSuite = testSuites[testSuiteId];

  return {
    tests,
    testSuite,
    focusedTestIds,
    pendingTestIds,
  };
}

module.exports = connect(mapStateToProps)(TestSuiteControlButton);
