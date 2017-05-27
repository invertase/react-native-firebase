import { NativeModules } from 'react-native';

const FirebasePerformance = NativeModules.RNFirebasePerformance;

export default class Trace {

  constructor(perf: Object, identifier: string) {
    this.perf = perf;
    this.identifier = identifier;
  }

  start() {
    FirebasePerformance.start(this.identifier);
  }

  stop() {
    FirebasePerformance.stop(this.identifier);
  }

  incrementCounter(event: string) {
    FirebasePerformance.incrementCounter(this.identifier, event);
  }
}
