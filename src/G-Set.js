'use strict'

/**
 * G-Set
 *
 * Operation-based Growth-Only Set CRDT
 *
 * Sources: 
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, "3.3.1 Grow-Only Set (G-Set)"
 */
class GSet {
  constructor (iterable) {
    this._added = new Set(iterable)
  }

  get values () {
    return this._added.values()
  }

  add (element) {
    this._added.add(element)
  }

  merge (other) {
    this._added = new Set([...this._added, ...other._added])
  }

  has (element) {
    return this._added.has(element)
  }

  hasAll (elements) {
    const contains = e => this.has(e)
    return elements.every(contains)
  }

  toJSON () {
    return { 
      values: this.toArray(),
    }
  }

  toArray () {
    return Array.from(this.values)
  }

  isEqual (other) {
    return GSet.isEqual(this, other)
  }

  static from (json) {
    return new GSet(json.values)
  }

  static isEqual (a, b) {
    return a.hasAll(b.toArray())
  }

  static difference (a, b) {
    const otherIncludes = x => !b.has(x)
    const difference = new Set(a.toArray().filter(otherIncludes))
    return difference
  }
}

module.exports = GSet
