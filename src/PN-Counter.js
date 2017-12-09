'use strict'

const GCounter = require('../src/G-Counter.js')

class PNCounter {
  constructor (id, pCounter, nCounter) {	
    this.id = id
    this.p = pCounter ? pCounter : new GCounter(id)
    this.n = nCounter ? nCounter : new GCounter(id)
  }

  get value() {
    return this.p.value - this.n.value
  }

  increment (amount) {
    this.p.increment(amount)
  }

  decrement (amount) {
    this.n.increment(amount)
  }

  merge (other) {
    this.p.merge(other.p)
    this.n.merge(other.n)
  }
  
  toJSON () {
    return {
      id: this.id,
      p: this.p,
      n: this.n
    }
  }

  isEqual (other) {
   return PNCounter.isEqual(this, other)
  } 

  static from (json) {
    return new PNCounter(json.id, json.p, json.n)
  }

  static isEqual (a, b) {
    return GCounter.isEqual(a.p, b.p) && GCounter.isEqual(a.n, b.n)
  }
}

module.exports = PNCounter
