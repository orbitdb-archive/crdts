'use strict'

const GSet = require('../src/G-Set.js')

/**
 * LWWSet-Set
 *
 * Operation-based Last-Write-Wins Set CRDT
 *
 * Sources:
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, ???
 */

class AddRemovePair {
  constructor (element, added, removed) {
    this.value = element
    this._added = new Set(added)
    this._removed = new Set(removed)
  }

  isAdd (compareFunc) {
    compareFunc = compareFunc ? compareFunc : (a, b) => (a || 0) - (b || 0)

    const transformSetToArray = set => Array.from(set.values())
    // const removesDoesntIncludeGreater = e => compareFunc
    //   ? this._removed.size > 0 ? Array.from(this._removed).some(f => compareFunc(e, f) > -1) : true
    //   : this._removed.size > 0 ? Array.from(this._removed).some(f => e - f > -1) : true

    // console.log("_added", this._added)
    // console.log("_removed", this._removed)
    const added = transformSetToArray(this._added).sort(compareFunc).reverse()
    const removed = transformSetToArray(this._removed).sort(compareFunc).reverse()
    // console.log("diff", added, removed)
    // console.log("+++++")
    return compareFunc(added[0], removed[0]) > -1
  }
}

class LWWSet {
  constructor (values, options) {
    this._elements = values
      ? values.map(e => new AddRemovePair(e.value, e._added, e._removed))
      : []

    this._options = options || {}
  }

  get values () {
    // console.log("----------------------------------")
    const union = this._elements.filter(e => e.isAdd(this._options.compareFunc))
    // console.log("union:", union, new Set(union.map(e => e.value)).values())
    return new Set(union.map(e => e.value)).values()
  }

  add (element, uid = 0) {
    const elm = this._elements.find(e => e.value === element)
    if (!elm) {
      let pair = new AddRemovePair(element, [uid], null)
      this._elements.push(pair)
    } else {
      elm._added.add(uid)
    }
  }

  remove (element, uid = 0) {
    const elm = this._elements.find(e => e.value === element)
    if (!elm) {
      let pair = new AddRemovePair(element, null, [uid])
      this._elements.push(pair)
    } else {
      elm._removed.add(uid)
    }
  }

  merge (other) {
    other._elements.forEach(element => {
      const elm = this._elements.find(e => e.value === element.value)
      if (!elm) {
        let pair = new AddRemovePair(element.value, element._added, element._removed)
        this._elements.push(pair)
      } else {
        elm._added.forEach(e => element._added.add(e))
        elm._removed.forEach(e => element._removed.add(e))       
      }
    })
  }

  has (element) {
    return new Set(this.values).has(element)
  }

  hasAll (elements) {
    const contains = e => this.has(e)
    return elements.length > 0
      ? elements.every(contains) 
      : this._elements.length === 0
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
    return LWWSet.isEqual(this, other)
  }

  static from (json) {
    return new LWWSet(json.values)
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

module.exports = LWWSet
