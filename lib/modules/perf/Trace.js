export default class Trace {

  constructor(perf: Object, identifier: string) {
    this.perf = perf;
    this.identifier = identifier;
  }

  start() {
    this.perf._native.start(this.identifier);
  }

  stop() {
    this.perf._native.stop(this.identifier);
  }

  incrementCounter(event: string) {
    this.perf._native.incrementCounter(this.identifier, event);
  }
}
