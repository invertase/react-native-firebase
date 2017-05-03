import React, { PropTypes } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { js_beautify as beautify } from 'js-beautify';

import Banner from '../components/Banner';
import RunStatus from '../../lib/RunStatus';
import TestControlButton from '../components/TestControlButton';

class Test extends React.Component {

  static navigationOptions = {
    title: ({ state: { params: { title } } }) => {
      return title;
    },
    header: ({ state: { params: { testId } } }) => {
      return {
        style: { backgroundColor: '#0288d1' },
        tintColor: '#ffffff',
        right: (
          <View style={{ marginRight: 8 }}>
            <TestControlButton testId={testId} />
          </View>
        ),
      };
    },
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

  renderError() {
    const { test: { message } } = this.props;

    if (message) {
      return (
        <ScrollView>
          <Text style={styles.codeHeader}>Test Error</Text>
          <Text style={styles.code}>
            <Text>{message}</Text>
          </Text>
        </ScrollView>
      );
    }

    return null;
  }


  render() {
    const { test: { func, status, time } } = this.props;

    return (
      <View style={styles.container}>
        {Test.renderBanner({ status, time })}
        <View style={styles.content}>
          {this.renderError()}
          <Text style={styles.codeHeader}>Test Code Preview</Text>
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
  }).isRequired,

  navigation: PropTypes.shape({
    setParams: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {},
  code: {
    backgroundColor: '#3F373A',
    color: '#c3c3c3',
    padding: 5,
    fontSize: 12,
  },
  codeHeader: {
    fontWeight: '600',
    fontSize: 18,
    backgroundColor: '#000',
    color: '#fff',
    padding: 5,
  },
});

function select({ tests }, { navigation: { state: { params: { testId } } } }) {
  const test = tests[testId];

  return {
    test,
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
