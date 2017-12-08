'use strict';

const isEqual = require('./utils').isEqual
const sum = (acc, val) => acc + val

class GCounter {
  constructor(id, payload) {
    this.id = id
    this._counters = payload ? payload : {}
    this._counters[this.id] = this._counters[this.id] ? this._counters[this.id] : 0
  }

  increment(amount) {
    if (amount && amount < 1) 
      return

    if (amount === undefined || amount === null)
      amount = 1

    this._counters[this.id] = this._counters[this.id] + amount
  }

  get value() {
    return Object.values(this._counters).reduce(sum, 0)
  }

  get payload() {
    return { 
      id: this.id, 
      counters: this._counters 
    }
  }

  compare(other) {
    if(other.id !== this.id)
      return false

    return isEqual(other._counters, this._counters)
  }

  merge(other) {
    Object.keys(other._counters).forEach((f) => {
      this._counters[f] = Math.max(this._counters[f] ? this._counters[f] : 0, other._counters[f])
    })
  }

  static from(payload) {
    return new GCounter(payload.id, payload.counters)
  }

}

module.exports = GCounter
