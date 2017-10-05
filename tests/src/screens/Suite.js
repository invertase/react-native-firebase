import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, View, Text, ListView, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';

import RunStatus from '../../lib/RunStatus';

import Banner from '../components/Banner';

import StatusIndicator from '../components/StatusIndicator';
import TestSuiteControlButton from '../components/TestSuiteControlButton';

class Suite extends React.Component {

  static navigationOptions = ({ navigation: { state: { params: { title, testSuiteId, onlyShowFailingTests } }, setParams } }) => {
    return {
      title,
      headerTintColor: '#ffffff',
      headerStyle: { backgroundColor: '#1976D2' },
      headerRight: (
        <View style={{ flexDirection: 'row', marginRight: 8 }}>
          <TestSuiteControlButton
            testSuiteId={testSuiteId}
            onlyShowFailingTests={onlyShowFailingTests}
            onFilterChange={setParams}
          />
        </View>
      ),
    };
  };

  /**
   * Render test group header
   * @param data
   * @param title
   * @returns {XML}
   */
  static renderHeader(data, title) {
    return (
      <View
        key={`header_${title}`}
        style={styles.header}
      >
        <Text style={styles.headerText}>
          {title.toUpperCase()}
        </Text>
      </View>
    );
  }

  constructor(props) {
    super(props);

    this.dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => JSON.stringify(r1) !== JSON.stringify(r2),
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    this.state = {
      dataBlob: this.dataSource.cloneWithRowsAndSections(buildRowsWithSections(props)),
    };
  }

  /**
   * componentWillReceiveProps
   * @param nextProps
   */
  componentWillReceiveProps(nextProps) {
    const {
      tests,
      testContexts,
      navigation: { state: { params: { onlyShowFailingTests } } },
    } = nextProps;

    const newRowsWithSections = (() => {
      if (onlyShowFailingTests) {
        return Object.values(testContexts).reduce((sections, context) => {
          const { name } = context;

          context.testIds.forEach((testId) => {
            const test = tests[testId];

            if (test && test.status === RunStatus.ERR) {
              // eslint-disable-next-line no-param-reassign
              sections[name] = sections[name] || [];
              sections[name].push(test);
            }
          });

          return sections;
        }, {});
      }

      return buildRowsWithSections(nextProps);
    })();

    this.setState({
      dataBlob: this.dataSource.cloneWithRowsAndSections(newRowsWithSections),
    });
  }

  /**
   * Go to a single test
   * @param testId
   */
  goToTest(test) {
    const { navigation: { navigate } } = this.props;

    navigate('Test', { testId: test.id, title: test.description });
  }

  /**
   * Render test row
   * @param test
   * @param sectionId
   * @param rowId
   * @param highlight
   * @returns {XML}
   */
  renderRow(test, sectionId, rowId, highlight) {
    const { pendingTestIds } = this.props;
    const { status, description, id } = test;

    return (
      <TouchableHighlight
        key={`row_${rowId}`}
        underlayColor={'rgba(0, 0, 0, 0.054)'}
        onPress={() => {
          this.goToTest(test);
          highlight();
        }}
      >
        <View style={[styles.row, status === RunStatus.ERR ? styles.error : null]}>
          <View
            style={[{ flex: 9 }, styles.rowContent]}
          >
            <Text
              numberOfLines={2}
              style={pendingTestIds[id] ? styles.disabledRow : {}}
            >
              {description}
            </Text>
          </View>
          <View style={[{ flex: 1 }, styles.rowContent, [{ alignItems: 'center' }]]}>
            <StatusIndicator status={status} />
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  /**
   *
   * @param sectionID
   * @param rowID
   * @returns {XML}
   */
  renderSeparator(sectionID, rowID) {
    return (
      <View
        key={`separator_${sectionID}_${rowID}`}
        style={styles.separator}
      />
    );
  }

  renderPendingTestsBanner() {
    const { testSuite: { testIds }, pendingTestIds } = this.props;

    let pendingTestsCount = 0;

    testIds.forEach((testId) => {
      if (pendingTestIds[testId]) {
        pendingTestsCount += 1;
      }
    });

    if (pendingTestsCount) {
      return (
        <Banner type="warning">
          {pendingTestsCount} pending test(s).
        </Banner>
      );
    }

    return null;
  }

  renderStatusBanner() {
    const { testSuite: { status, progress, time, message } } = this.props;

    switch (status) {
      case RunStatus.RUNNING:

        return (
          <Banner type={'warning'}>
            Tests are currently running ({ progress.toFixed(2) }%).
          </Banner>
        );

      case RunStatus.OK:

        return (
          <Banner type={'success'}>
            Tests passed. ({ time }ms)
          </Banner>
        );

      case RunStatus.ERR:

        return (
          <Banner type={'error'}>
            {message} ({time}ms)
          </Banner>
        );

      default:
        return null;
    }
  }

  /**
   *
   * @returns {XML}
   */
  render() {
    const { dataBlob } = this.state;

    return (
      <View style={styles.container}>

        { this.renderPendingTestsBanner() }
        { this.renderStatusBanner() }

        <ListView
          dataSource={dataBlob}
          renderSectionHeader={(...args) => Suite.renderHeader(...args)}
          renderRow={(...args) => this.renderRow(...args)}
          renderSeparator={(...args) => this.renderSeparator(...args)}
        />
      </View>
    );
  }

}

Suite.propTypes = {
  navigation: PropTypes.shape({
    setParams: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    state: PropTypes.shape({
      params: PropTypes.object,
      onlyShowFailingTests: PropTypes.bool,
    }).isRequired,
  }).isRequired,

  testSuite: PropTypes.shape({
    status: PropTypes.string,
    progress: PropTypes.number,
    time: PropTypes.number,
    message: PropTypes.string,
  }).isRequired,

  testContexts: PropTypes.objectOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    testIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  })).isRequired,

  tests: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.number,
    description: PropTypes.string,
    status: PropTypes.oneOf(Object.values(RunStatus)),
  })).isRequired,

  pendingTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,
  focusedTestIds: PropTypes.objectOf(PropTypes.bool).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  banner: {
    alignItems: 'center',
    elevation: 3,
  },
  bannerText: {
    color: '#ffffff',
  },
  inProgress: {
    backgroundColor: '#FFC107',
  },
  errorBanner: {
    backgroundColor: '#f44336',
  },
  header: {
    elevation: 3,
    justifyContent: 'center',
    height: 25,
    paddingHorizontal: 16,
    backgroundColor: '#ECEFF1',
  },
  headerText: {
    fontWeight: '800',
  },
  row: {
    paddingHorizontal: 16,
    height: 48,
    flexDirection: 'row',
  },
  rowContent: {
    justifyContent: 'center',
  },
  disabledRow: {
    color: '#c3c3c3',
  },
  error: {
    backgroundColor: 'rgba(255, 0, 0, 0.054)',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
});

function buildRowsWithSections({ testContexts, tests, focusedTestIds }) {
  const someTestsAreFocused = Object.keys(focusedTestIds).length > 0;

  return Object.values(testContexts).reduce((sections, testContext) => {
    const { testIds } = testContext;

    const contextTestsToShow = testIds.reduce((memo, testId) => {
      const test = tests[testId];

      if (someTestsAreFocused) {
        if (focusedTestIds[testId]) {
          memo.push(test);
        }
      } else {
        memo.push(test);
      }

      return memo;
    }, []);

    if (contextTestsToShow.length > 0) {
      const effectiveContext = highestNonRootAncestor(testContext, testContexts);
      // eslint-disable-next-line no-param-reassign
      sections[effectiveContext.name] = sections[effectiveContext.name] || [];
      // eslint-disable-next-line no-param-reassign
      sections[effectiveContext.name] = sections[effectiveContext.name].concat(contextTestsToShow);
    }

    return sections;
  }, {});
}

function highestNonRootAncestor(testContext, testContexts) {
  const parentContextId = testContext.parentContextId;

  if (parentContextId) {
    const parentContext = testContexts[parentContextId];
    const parentContextIsNotRoot = parentContext && parentContext.parentContextId;

    if (parentContextIsNotRoot) {
      return highestNonRootAncestor(parentContext, testContexts);
    }
  }

  return testContext;
}

function mapStateToProps(state, { navigation: { state: { params: { testSuiteId } } } }) {
  const { tests, testContexts, testSuites, pendingTestIds, focusedTestIds } = state;
  const testSuite = testSuites[testSuiteId];

  const testSuiteContexts = testSuite.testContextIds.reduce((suiteContexts, contextId) => {
    // eslint-disable-next-line no-param-reassign
    suiteContexts[contextId] = testContexts[contextId];

    return suiteContexts;
  }, {});

  const testSuiteTests = testSuite.testIds.reduce((suiteTests, testId) => {
    // eslint-disable-next-line no-param-reassign
    suiteTests[testId] = tests[testId];

    return suiteTests;
  }, {});

  return {
    testSuite,
    testContexts: testSuiteContexts,
    tests: testSuiteTests,
    pendingTestIds,
    focusedTestIds,
  };
}

export default connect(mapStateToProps)(Suite);
