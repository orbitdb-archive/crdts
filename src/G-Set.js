'use strict'

/**
 * G-Set
 *
 * Operation-based Grow-Only Set CRDT
 *
 * The G-Set works as a base class for many other Set CRDTs.
 * G stands for "Grow-Only" which means that values can only
 * ever be added to the set, they can never be removed.
 * 
 * Used by:
 * CmRDT-Set - https://github.com/haadcode/crdts/blob/master/src/CmRDT-Set.js
 *
 * Sources: 
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, "3.3.1 Grow-Only Set (G-Set)"
 */
class GSet {
  /**
   * Create a G-Set CRDT instance
   * @param  {[Iterable]} iterable [Opetional Iterable object (eg. Array, Set) to create the GSet from]
   */
  constructor (iterable) {
    this._values = new Set(iterable)
  }

  /**
   * Return all values added to the Set
   * @return {[Iterator]} [Iterator for values in the Set]
   */
  get values () {
    return this._values.values()
  }

  /**
   * Add a value to the Set
   *
   * Values can only be ever added to a G-Set,
   * removing values is not possible (Grow-Only)
   *
   * @param {[Any]} value [Value to add to the Set]
   */
  add (value) {
    this._values.add(value)
  }

  // G-Set doesn't allow removal of values, throw an error
  // Including this to satisfy normal Set API in case the user
  // accidentally calls remove on GSet
  remove (value) {
    throw new Error('G-Set doesn\'t allow removing values')
  }

  /**
   * Merge another GSet to this GSet
   * @param  {[GSet]} other [GSet to merge with]
   */
  merge (other) {
    // Merge values of other set with this set
    this._values = new Set([...this._values, ...other._values])
  }

  /**
   * Check if this GSet has a value
   * @param  {[Any]}  value [Value to look for]
   * @return {Boolean}      [True if value is in the GSet, false if not]
   */
  has (value) {
    return new Set(this.values).has(value)
  }

  /**
   * Check if this GSet has all values of an input array
   * @param  {[Array]}  values [Values that should be in the GSet]
   * @return {Boolean}         [True if all values are in the GSet, false if not]
   */
  hasAll (values) {
    const contains = e => this.has(e)
    return values.length > 0
      ? values.every(contains) 
      : this._values.size === 0
  }

  /**
   * GSet as an Object that can be JSON.stringified
   * @return {[Object]} [Object in the shape of `{ values: [<values>] }`]
   */
  toJSON () {
    return { 
      values: this.toArray(),
    }
  }

  /**
   * Create an Array of the values of this GSet
   * @return {[Array]} [Values of this GSet as an Array]
   */
  toArray () {
    return Array.from(this.values)
  }

  /**
   * Check if this GSet equal another GSet
   * @param  {[type]}  other [GSet to compare]
   * @return {Boolean}       [True if this GSet is the same as the other GSet]
   */
  isEqual (other) {
    return GSet.isEqual(this, other)
  }

  /**
   * Create GSet from a json object
   * @param  {[Object]} json [Input object to create the GSet from. Needs to be: '{ values: [] }']
   * @return {[GSet]}        [new GSet instance]
   */
  static from (json) {
    return new GSet(json.values)
  }

  /**
   * Check if two GSets are equal
   *
   * Two GSet are equal if they both contain exactly 
   * the same values.
   * 
   * @param  {[GSet]}  a [GSet to compare]
   * @param  {[GSet]}  b [GSet to compare]
   * @return {Boolean}   [True input GSets are the same]
   */
  static isEqual (a, b) {
    return (a.toArray().length === b.toArray().length)
      && a.hasAll(b.toArray())
  }

  /**
   * Return the difference between the values of two GSets
   * 
   * @param  {[GSet]} a [First GSet]
   * @param  {[GSet]} b [Second GSet]
   * @return {[Set]}    [Set of values that are in GSet A but not in GSet B]
   */
  static difference (a, b) {
    const otherIncludes = x => !b.has(x)
    const difference = new Set(a.toArray().filter(otherIncludes))
    return difference
  }
}

module.exports = GSet
