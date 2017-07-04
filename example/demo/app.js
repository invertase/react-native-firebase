import React from 'react'
import { View } from 'react-native'
import firebase from './lib/firebase'

export default class App extends React.Component {
  render () {
    return (
      <View
        style={{flex: 1, backgroundColor: 'red'}}
      />
    )
  }
}
