const FirebasePerformance = NativeModules.RNFirebasePerformance;

export default class Trace {

  constructor(perf: Object, identifier: string) {
    this.perf = perf;
    this.identifier = identifier;
  }

  start() {
    this.perf.log.debug(`Starting trace for ${this.identifier}`);
    FirebasePerformance.start(this.identifier);
  }

  stop() {
    this.perf.log.debug(`Stopping trace for ${this.identifier}`);
    FirebasePerformance.stop(this.identifier);
  }

  incrementCounter(event: string) {
    this.perf.log.debug(`Incrementing counter event ${event} trace for ${this.identifier}`);
    FirebasePerformance.incrementCounter(this.identifier, event);
  }
}
