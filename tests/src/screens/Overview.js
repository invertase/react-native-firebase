import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, ListView, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import some from 'lodash.some';

import RunStatus from '../../lib/RunStatus';

import Banner from '../components/Banner';
import StatusIndicator from '../components/StatusIndicator';
import OverviewControlButton from '../components/OverviewControlButton';

class Overview extends React.Component {
  // noinspection JSUnusedGlobalSymbols
  static navigationOptions = {
    title: 'Test Suites',
    headerTintColor: '#ffffff',
    headerStyle: { backgroundColor: '#1976D2' },
    headerRight: (
      <View style={{ marginRight: 8 }}>
        <OverviewControlButton />
      </View>
    ),
  };

  /**
   * Renders separator between ListView sections
   * @param {String} sectionID
   * @param {String} rowID
   * @returns {XML} JSX component used as ListView separator
   */
  static renderSeparator(sectionID, rowID) {
    return (
      <View
        key={`separator_${sectionID}_${rowID}`}
        style={styles.separator}
      />
    );
  }

  /**
   * Filters test suites to those that have one or more tests that should be visible.
   * If one or more tests are focused it only returns test suites with focused tests,
   * otherwise, it returns all test suites.
   * @param {IndexedTestSuiteGroup} testSuites - group of available test suites
   * @param {IdLookup} focusedTestIds - lookup for focused tests
   * @returns {IndexedTestSuiteGroup} - indexed group of test suites that should be shown
   */
  static testSuitesToShow({ testSuites, focusedTestIds }) {
    if (Object.keys(focusedTestIds).length > 0) {
      return Object.keys(testSuites).reduce((memo, testSuiteId) => {
        const testSuite = testSuites[testSuiteId];

        const testSuiteHasFocusedTests = some(testSuite.testIds, (testId) => {
          return focusedTestIds[testId];
        });

        if (testSuiteHasFocusedTests) {
          // eslint-disable-next-line no-param-reassign
          memo[testSuiteId] = testSuite;
        }

        return memo;
      }, {});
    }

    return testSuites;
  }

  /**
   * Copies initial values for test suites from props into state, so they may be
   * rendered as a ListView
   * @param {Object} props - props used to render component
   * @param {Object} context - context used to render component
   */
  constructor(props, context) {
    super(props, context);

    this.dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2),
    });

    this.state = {
      dataBlob: this.dataSource.cloneWithRows(Overview.testSuitesToShow(props)),
    };
  }


  /**
   * Copies latest test suite status into state so they may be rendered as a ListView
   * @param {Object} nextProps - next props used to render component
   * @param {Object.<number,TestSuite>} nextProps.testSuites - test suites to render
   * @param {IdLookup} nextProps.focusedTestIds - lookup for focus tests
   */
  componentWillReceiveProps({ testSuites, focusedTestIds }) {
    this.setState({
      dataBlob: this.dataSource.cloneWithRows(Overview.testSuitesToShow({ testSuites, focusedTestIds })),
    });
  }

  /**
   * Navigate to test suite screen
   * @param {TestSuiteId} testSuiteId - id of test suite to navigate to
   */
  goToTestSuite(testSuite) {
    const { navigation: { navigate } } = this.props;

    navigate('Suite', { testSuiteId: testSuite.id, title: testSuite.name });
  }

  /**
   *
   * @param testSuite
   * @param sectionId
   * @param rowId
   * @param highlight
   * @returns {XML}
   */
  renderRow(testSuite, sectionId, rowId, highlight) {
    const { description, name, status, progress } = testSuite;

    return (
      <TouchableHighlight
        key={`row_${rowId}`}
        underlayColor={'rgba(0, 0, 0, 0.054)'}
        onPress={() => {
          this.goToTestSuite(testSuite);
          highlight();
        }}
      >
        <View style={[styles.row, status === RunStatus.ERR ? styles.error : null]}>
          <View>
            <Text style={styles.title}>{name}</Text>
            <Text
              style={styles.description}
              numberOfLines={1}
            >
              {description}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <StatusIndicator status={status} progress={progress} />
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  /**
   * Renders a warning toast banner if there are one or more tests that are pending
   * @returns {null|XML} Toast banner if there are test pending, else null
   */
  renderPendingTestsBanner() {
    const { pendingTestIds } = this.props;

    const pendingTestsCount = Object.keys(pendingTestIds).length;

    if (pendingTestsCount > 0) {
      return (
        <Banner type="warning">
          {pendingTestsCount} pending test(s).
        </Banner>
      );
    }

    return null;
  }

  renderStatusBanner() {
    const { testSuites } = this.props;

    let totalProgress = 0;
    let isRunning = false;
    let isErrors = false;
    let totalTime = 0;

    Object.values(testSuites).forEach(({ progress, status, time }) => {
      totalProgress += progress;
      totalTime += time;

      if (status === RunStatus.RUNNING) {
        isRunning = true;
      } else if (status === RunStatus.ERR) {
        isErrors = true;
      }
    });

    totalProgress /= Object.keys(testSuites).length;

    if (isRunning) {
      return (
        <Banner type={isErrors ? 'error' : 'warning'}>Running ({(totalTime / 1000).toFixed(0)}s) {totalProgress.toFixed(2)}%</Banner>
      );
    } else if (totalProgress > 0) {
      if (isErrors) {
        return (
          <Banner type={'error'}>Tests Complete with errors</Banner>
        );
      }

      return (
        <Banner type={'success'}>Tests Complete</Banner>
      );
    }

    return null;
  }


  /**
   * Renders ListView of test suites that should be visible, taking into consideration
   * any focused tests
   * @returns {XML} ListView of test suites
   */
  render() {
    return (
      <View style={styles.container}>
        { this.renderPendingTestsBanner() }
        { this.renderStatusBanner() }
        <ListView
          enableEmptySections
          dataSource={this.state.dataBlob}
          renderRow={(...args) => this.renderRow(...args)}
          renderSeparator={(...args) => Overview.renderSeparator(...args)}
        />
      </View>
    );
  }
}

Overview.propTypes = {
  testSuites: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.oneOf(Object.values(RunStatus)),
  })).isRequired,

  tests: PropTypes.objectOf(PropTypes.shape({
    testSuiteId: PropTypes.number.isRequired,
  })).isRequired,

  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,

  running: PropTypes.bool.isRequired,

  pendingTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,
  focusedTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,
};
const styles = StyleSheet.create({
  rightContainer: {
    marginRight: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  description: {
    fontSize: 11,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  row: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  error: {
    backgroundColor: 'rgba(255, 0, 0, 0.054)',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
});

function mapStateToProps({ testSuites, tests, pendingTestIds, focusedTestIds }) {
  return {
    testSuites,
    tests,
    pendingTestIds,
    focusedTestIds,
    running: Object.values(testSuites).filter(suite => suite.status === RunStatus.RUNNING).length > 0,
  };
}

export default connect(mapStateToProps)(Overview);
