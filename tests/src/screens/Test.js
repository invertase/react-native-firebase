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
    const { test: { message, description, func, status, time }, testContextName } = this.props;

    return (
      <View style={styles.container}>
        {Test.renderBanner({ status, time })}
        <View >
          <ScrollView>
            <Text style={styles.testLabel}>{testContextName}:</Text><Text style={styles.description}>{description}</Text>
          </ScrollView>
          <ScrollView>
            <Text style={styles.header}>Test Error</Text>
            <Text style={styles.code}>
              <Text>{message || 'None'}</Text>
            </Text>
          </ScrollView>
          <Text style={styles.header}>
            Test Code Preview
          </Text>
          <ScrollView>
            <Text style={styles.code}>
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
    message: PropTypes.string,
    func: PropTypes.function,
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
  header: {
    fontWeight: '600',
    fontSize: 18,
    backgroundColor: '#000',
    color: '#fff',
    padding: 5,
  },
  code: {
    backgroundColor: '#3F373A',
    color: '#c3c3c3',
    padding: 5,
    fontSize: 12,
  },
  description: {
    padding: 5,
    fontSize: 14,
  },
  testLabel: {
    fontWeight: '600',
    fontSize: 16
  }
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
