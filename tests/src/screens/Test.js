import React from 'react';
import PropTypes from 'prop-types';

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
      headerStyle: { backgroundColor: '#1976D2' },
      headerRight: (
        <View style={{ marginRight: 8 }}>
          <TestControlButton testId={testId} />
        </View>
      ),
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
    const { test: { stackTrace, message, description, func, status, time }, testContextName } = this.props;

    return (
      <View style={styles.container}>
        {Test.renderBanner({ status, time })}
        <ScrollView >
          <View style={styles.sectionContainer}>
            <Text style={styles.heading}>{testContextName}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          {message ? <View style={styles.sectionContainer}>
            <Text style={styles.headingWarn}>Test Error Message</Text>
            <Text style={styles.message}>{message || 'None.'}</Text>
          </View> : null }
          {stackTrace ? <View style={styles.sectionContainer}>
            <Text style={styles.headingWarn}>Test Error Stack</Text>
            <Text style={styles.description}>
              {stackTrace || 'None.'}
            </Text>
          </View> : null }
          <View style={styles.sectionContainer}>
            <Text style={styles.heading}>
              Test Code Preview
            </Text>
            <Text style={styles.description}>
              {beautify(removeLastLine(removeFirstLine(func.toString())), {
                indent_size: 4,
                break_chained_methods: true,
              })}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

Test.propTypes = {
  test: PropTypes.shape({
    status: PropTypes.string,
    time: PropTypes.number,
    func: PropTypes.function,
    stackTrace: PropTypes.string,
    message: PropTypes.string,
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
    backgroundColor: '#fff',
  },
  sectionContainer: {
    minHeight: 100,
    backgroundColor: '#fff',
  },
  heading: {
    padding: 5,
    elevation: 3,
    backgroundColor: '#2196F3',
    fontWeight: '400',
    color: '#ffffff',
    fontSize: 14,
  },
  headingWarn: {
    padding: 5,
    elevation: 3,
    backgroundColor: '#FFC107',
    fontWeight: '400',
    color: '#212121',
    fontSize: 14,
  },
  description: {
    padding: 5,
    fontSize: 12,
  },
  message: {
    padding: 5,
    fontSize: 12,
    width: '100%',
    minHeight: 100,
  },
});

/*
 .dark-primary-color    { background: #1976D2; }
 .default-primary-color { background: #2196F3; }
 .light-primary-color   { background: #BBDEFB; }
 .text-primary-color    { color: #FFFFFF; }
 .accent-color          { background: #FFC107; }
 .primary-text-color    { color: #212121; }
 .secondary-text-color  { color: #757575; }
 .divider-color         { border-color: #BDBDBD; }

 */

function select({ tests, testContexts }, { navigation: { state: { params: { testId } } } }) {
  const test = tests[testId];
  let testContext = testContexts[test.testContextId];

  while (testContext.parentContextId && testContexts[testContext.parentContextId].parentContextId) {
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
