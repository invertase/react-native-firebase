import RNFirebase from 'react-native-firebase'

const configurationOptions = {
  debug: true
}

const firebase = RNFirebase.initializeApp(configurationOptions)

export default firebase
