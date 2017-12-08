'use strict'

const GSet = require('../src/G-Set.js')

/**
 * 2P-Set
 *
 * Operation-based Two-Phase Set CRDT
 *
 * Sources:
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, "3.3.2 2P-Set"
 */
class TwoPSet {
  constructor (added, removed) {
    this._added = new GSet(added)
    this._removed = new GSet(removed)
  }

  get values () {
    const difference = new GSet(this._added.toArray().filter(x => !this._removed.has(x)))
    return difference.values
  }

  add (element) {
    this._added.add(element)
  }

  remove (element) {
    if (this._added.has(element))
      this._removed.add(element)
  }

  merge (other) {
    this._added = new GSet(this._added.toArray().concat(other._added.toArray()))
    this._removed = new GSet(this._removed.toArray().concat(other._removed.toArray()))
  }

  has (element) {
    const difference = new GSet(this._added.toArray().filter(x => !this._removed.has(x)))
    return difference.has(element)
  }

  hasAll (elements) {
    const contains = e => this.has(e)
    return elements.every(contains)
  }

  toJSON () {
    return { 
      added: this._added.toArray(),
      removed: this._removed.toArray(),
    }
  }

  toArray () {
    return Array.from(this.values)
  }

  isEqual (other) {
    return TwoPSet.isEqual(this, other)
  }

  static from (json) {
    return new TwoPSet(json.added, json.removed)
  }

  static isEqual (a, b) {
    return a.hasAll(b.toArray())
  }
}

module.exports = TwoPSet
