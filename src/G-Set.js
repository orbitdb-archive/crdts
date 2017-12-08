'use strict'

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
}

module.exports = GSet
