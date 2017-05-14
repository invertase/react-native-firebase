import React, { PropTypes } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { js_beautify as beautify } from 'js-beautify';

import Banner from '../components/Banner';
import RunStatus from '../../lib/RunStatus';
import TestControlButton from '../components/TestControlButton';

class Test extends React.Component {

  static navigationOptions = ({ navigation: { state: { params: { title, testId } } } }) => {
    return {
      title,
      headerTintColor: '#ffffff',
      headerStyle: { backgroundColor: '#0288d1' },
      headerRight: <View style={{ marginRight: 8 }}>
        <TestControlButton testId={testId} />
      </View>,
    };
  };

  static renderBanner({ status, time }) {
    switch (status) {
      case RunStatus.RUNNING:
        return (
          <Banner type={'warning'}>
            Test is currently running.
          </Banner>
        );
      case RunStatus.OK:
        return (
          <Banner type={'success'}>
            Test passed. ({time}ms)
          </Banner>
        );
      case RunStatus.ERR:
        return (
          <Banner type={'error'}>
            Test failed. ({time}ms)
          </Banner>
        );
      default:
        return null;
    }
  }

  componentDidMount() {
    const { navigation: { setParams }, test } = this.props;

    setParams({ test });
  }

  render() {
    const { test: { stackTrace, description, func, status, time }, testContextName } = this.props;

    return (
      <View style={styles.container}>
        {Test.renderBanner({ status, time })}
        <View >
          <ScrollView style={styles.sectionContainer}>
            <Text style={styles.heading}>{testContextName}</Text>
            <Text style={styles.description}>{description}</Text>
          </ScrollView>
          <ScrollView style={styles.sectionContainer}>
            <Text style={styles.heading}>Test Error</Text>
            <Text style={styles.description}>
              <Text>{stackTrace || 'None.'}</Text>
            </Text>
          </ScrollView>
          <Text style={styles.heading}>
            Test Code Preview
          </Text>
          <ScrollView style={styles.sectionContainer}>
            <Text style={styles.description}>
              {beautify(removeLastLine(removeFirstLine(func.toString())), { indent_size: 4, break_chained_methods: true })}
            </Text>
          </ScrollView>
        </View>
      </View>
    );
  }
}

Test.propTypes = {
  test: PropTypes.shape({
    status: PropTypes.string,
    time: PropTypes.number,
    func: PropTypes.function,
    stackTrace: PropTypes.function,
    description: PropTypes.string,
  }).isRequired,

  testContextName: PropTypes.string,

  navigation: PropTypes.shape({
    setParams: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  sectionContainer: {
    minHeight: 100,
  },
  heading: {
    padding: 5,
    backgroundColor: '#0288d1',
    fontWeight: '600',
    color: '#ffffff',
    fontSize: 16,
  },
  description: {
    padding: 5,
    fontSize: 14,
  },
});

function select({ tests, testContexts }, { navigation: { state: { params: { testId } } } }) {
  const test = tests[testId];
  let testContext = testContexts[test.testContextId];

  while(testContext.parentContextId && testContexts[testContext.parentContextId].parentContextId) {
    testContext = testContexts[testContext.parentContextId];
  }
  return {
    test,
    testContextName: testContext.name,
  };
}

function removeLastLine(multiLineString) {
  const index = multiLineString.lastIndexOf('\n');
  return multiLineString.substring(0, index);
}

function removeFirstLine(multiLineString) {
  return multiLineString.substring(multiLineString.indexOf('\n') + 1);
}

export default connect(select)(Test);
