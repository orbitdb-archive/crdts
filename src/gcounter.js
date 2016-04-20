'use strict';

class GCounter {
  constructor(id, payload) {
    this.id = id;
    this._counters = payload ? payload : {};
    this._counters[this.id] = this._counters[this.id] ? this._counters[this.id] : 0;
  }

  increment(amount) {
    if(!amount) amount = 1;
    this._counters[this.id] = this._counters[this.id] + amount;
  }

  get value() {
    return Object.keys(this._counters)
      .map((f) => this._counters[f])
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  }

  get payload() {
    return { id: this.id, counters: this._counters };
  }

  compare(other) {
    if(other.id !== this.id)
      return false;

    return GCounter.isEqual(other._counters, this._counters);
  }

  merge(other) {
    const payload = Object.assign({}, other._counters);
    delete payload[this.id];
    Object.assign(this._counters, payload);
  }

  static from(payload) {
    return new GCounter(payload.id, payload.counters);
  }

  // TODO: move to utils
  static isEqual(a, b) {
    const propsA = Object.getOwnPropertyNames(a);
    const propsB = Object.getOwnPropertyNames(b);

    if(propsA.length !== propsB.length)
      return false;

    for(let i = 0; i < propsA.length; i ++) {
      const prop = propsA[i];
      if(a[prop] !== b[prop])
        return false;
    }

    return true;
  }
}

module.exports = GCounter;
