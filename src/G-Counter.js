'use strict'

const { deepEqual } = require('./utils')
const sum = (acc, val) => acc + val

/**
 * G-Counter
 *
 * Operation-based Increment-Only Counter CRDT
 *
 * Sources: 
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, "3.1.1 Op-based counter and 3.1.2  State-based increment-only Counter (G-Counter)"
 */

class GCounter {
  constructor (id, counter) {
    this.id = id
    this._counters = counter ? counter : {}
    this._counters[this.id] = this._counters[this.id] ? this._counters[this.id] : 0
  }

  get value () {
    return Object.values(this._counters).reduce(sum, 0)
  }

  increment (amount) {
    if (amount && amount < 1) 
      return

    if (amount === undefined || amount === null)
      amount = 1

    this._counters[this.id] = this._counters[this.id] + amount
  }

  merge (other) {
    // Go through each counter in the other counter
    Object.entries(other._counters).forEach(([id, value]) => {
      // Take the maximum of the counter value we have or the counter value they have
      this._counters[id] = Math.max(this._counters[id] || 0, value)
    })
  }

  toJSON () {
    return { 
      id: this.id, 
      counters: this._counters 
    }
  }

  isEqual (other) {
    return GCounter.isEqual(this, other)
  }

  static from (json) {
    return new GCounter(json.id, json.counters)
  }

  static isEqual (a, b) {
    if(a.id !== b.id)
      return false

    return deepEqual(a._counters, b._counters)
  }
}

module.exports = GCounter
