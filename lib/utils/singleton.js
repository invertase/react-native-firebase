const Symbol = require('es6-symbol');

class Singleton {
  constructor() {
    const Class = this.constructor;
    if (!Class[this.singleton]) {
      Class[this.singleton] = this;
    }

    return Class[this.singleton];
  }

  static get instance() {
    if (!this[this.singleton]) {
      this[this.singleton] = new this();
    }

    return this[this.singleton];
  }

  static set instance(instance) {
    this[this.singleton] = instance;
    return this[this.singleton];
  }

  static get singleton() {
    return Symbol(this.namespace);
  }

  static reset() {
    delete this[this.singleton];
  }
}

export default Singleton;
