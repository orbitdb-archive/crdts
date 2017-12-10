'use strict'

const { OperationTuple3 } = require('./utils')

/**
 * CmRDT-Set
 *
 * Base Class for Operation-Based Set CRDT. Provides a Set interface.
 * 
 * Operations are described as:
 * 
 *   Operation = Tuple3(value : Any, added : Set, removed : Set)
 * 
 * This class is meant to be used as a base class for 
 * Operation-Based CRDTs that can be derived from Set 
 * semantics and which calculate the state (values)
 * based on a set of operations.
 *
 * Used by: 
 *   G-Set - https://github.com/orbitdb/crdts/blob/master/src/G-Set.js
 *   OR-Set - https://github.com/orbitdb/crdts/blob/master/src/OR-Set.js
 *   2P-Set - https://github.com/orbitdb/crdts/blob/master/src/2P-Set.js
 *   LWW-Set - https://github.com/orbitdb/crdts/blob/master/LWW-Set.js
 *
 * Sources:
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document
 */
class CmRDTSet extends Set {
  /**
   * Create a new CmRDTSet instance
   * @override
   *
   * The constructor should never be used directly 
   * but rather via `super()` call in the constructor of
   * the class that inherits from CmRDTSet
   * 
   * @param  {[Iterable]} iterable [Opetional Iterable object (eg. Array, Set) to create the Set from]
   * @param  {[Object]}   options  [Options to pass to the Set. Currently supported: `{ compareFunc: (a, b) => true|false }`]
   */
  constructor (iterable, options) {
    super()
    // Internal cache for tracking which values have been added to the set
    this._values = new Set()
    // List of operations (adds or removes of a value) for this set as
    // Operation : Tuple3(value : Any, added : Set, removed : Set)
    // added and removed can be any value, eg. it can be used to store 
    // timestamps/clocks for each operation in order to determine if 
    // a value is in the set
    this._operations = iterable ? iterable.map(OperationTuple3.from) : []
    // Internal options
    this._options = options || {}
  }

  /**
   * Return the values in the Set
   * @override
   * @return {[Set]} [Values in this set]
   */
  values () {
    const shouldIncludeValue = e => this._resolveValueState(e.added, e.removed, this._options.compareFunc)
    const getValue = e => e.value
    // Filter out values that should not be in this set
    // by using the _resolveValueState() function to determine
    // if the value should be present
    const state = this._operations
      .filter(shouldIncludeValue)
      .map(getValue)
    return new Set(state).values()
  }

  /**
   * Check if this Set has a value
   * @param  {[Any]}  value [Value to look for]
   * @return {Boolean}      [True if value is in the Set, false if not]
   */
  has (value) {
    return new Set(this.values()).has(value)
  }

  /**
   * Check if this Set has all values of an input array
   * @param  {[Array]}  values [Values that should be in the Set]
   * @return {Boolean}         [True if all values are in the Set, false if not]
   */
  hasAll (values) {
    const contains = e => this.has(e)
    return values.every(contains) 
  }

  /**
   * Add a value to the Set
   * @override
   *
   * Optionally, a "tag" can be given for the add operation,
   * for example the tag can be a clock or other identifier
   * that can be used to determine together with remove operations,
   * whether a value is included in the Set
   * 
   * @param {[Any]} value [Value to add to the Set]
   * @param {[Any]} tag   [Optional tag for this add operation, eg. a clock]
   */
  add (value, tag) {
    // If the value is not in the set yet
    if (!this._values.has(value)) {
      // Create an operation for the value and apply it to this set
      const addOperation = OperationTuple3.create(value, [tag], null)
      this._applyOperation(addOperation)
    } else {
      // If the value is in the set, add a tag to its added set
      this._findOperationsFor(value).map(val => val.added.add(tag))
    }
  }

  /**
   * Remove a value from the Set
   * @override
   *
   * Optionally, a "tag" can be given for the remove operation,
   * for example the tag can be a clock or other identifier
   * that can be used to determine together with add operations,
   * whether a value is included in the Set
   *
   * @param  {[Any]} value [Value to remove from the Set]
   * @param  {[Any]} tag   [Optional tag for this remove operation, eg. a clock]
   */
  remove (value, tag) {
    // Add a remove tag to the value's removed set, and only
    // apply the remove operation if the value was added previously
    this._findOperationsFor(value).map(e => e.removed.add(tag))
  }

  /**
   * Merge the Set with another Set
   * @override
   * @param  {[CRDTSet]} other [Set to merge with]
   */
  merge (other) {
    other._operations.forEach(operation => {
      const value = operation.value
      if (!this._values.has(value)) {
        // If we don't have the value yet, add it with all tags from other's operation
        const op = OperationTuple3.create(value, operation.added, operation.removed)
        this._applyOperation(op)
      } else {
        // If this set has the value
        this._findOperationsFor(value).map(op => {
          // Add all add and remove tags from other's operations to value in this set
          operation.added.forEach(e => op.added.add(e))
          operation.removed.forEach(e => op.removed.add(e))
        })
      }
    })
  }

  /**
   * CmRDT-Set as an Object that can be JSON.stringified
   * @return {[Object]} [Object in the shape of `{ values: [ { value: <value>, added: [<tags>], removed: [<tags>] } ] }`]
   */
  toJSON () {
    const values = this._operations.map(e => {
      return {
        value: e.value,
        added: Array.from(e.added),
        removed: Array.from(e.removed),
      }      
    })
    return { values: values }
  }

  /**
   * Create an Array of the values of this Set
   * @return {[Array]} [Values of this Set as an Array]
   */
  toArray () {
    return Array.from(this.values())
  }

  /**
   * Check if this Set equal another Set
   * @param  {[type]}  other [Set to compare]
   * @return {Boolean}       [True if this Set is the same as the other Set]
   */
  isEqual (other) {
    return CmRDTSet.isEqual(this, other)
  }

  /**
   * _resolveValueState function is used to determine if an element is present in a Set.
   * 
   * It receives a Set of add tags and a Set of remove tags for an element as arguments.
   * It returns true if an element should be included in the state and false if not.
   * 
   * Overwriting this function gives us the ability to compare add/remove operations
   * of a particular element (value) in the set and determine if the value should be
   * included in the set or not. The function gets called once per element and returning
   * true will include the value in the set and returning false will exclude it from the set.
   * 
   * @param  {[type]} added       [Set of added elements]
   * @param  {[type]} removed     [Set of removed elements]
   * @param  {[type]} compareFunc [Comparison function to compare elements with]
   * @return {[type]}             [true if element should be included in the current state]
   */
  _resolveValueState (added, removed, compareFunc) {
    // By default, if there's an add operation present,
    // and there are no remove operations, we include 
    // the value in the set
    return added.size > 0 && removed.size === 0
  }

  /**
   * Add a value to the internal cache
   * @param {[OperationTuple3]} operationTuple3 [Tuple3(value, addedTags, removedTags)]
   */
  _applyOperation (operationTuple3) {
    this._operations.push(operationTuple3)
    this._values.add(operationTuple3.value)  
  }

  /**
   * Find a value and its operations from this set's internal cache
   * @private
   *
   * Returns a value and all its operations as a OperationTuple3:
   * Operation : Tuple3(value : Any, added : Set, removed : Set)
   *
   * Where 'value' is the value in the set, 'added' is all add operations
   * and 'removed' are all remove operations for that value.
   * 
   * @param  {[Any]} value [Value to find]
   * @return {[Any]}       [Value if found, undefined if value was not found]
   */
  _findOperationsFor (value) {
    let operations = []
    if (this._values.has(value)) {
      const isForValue = e => e.value === value
      const notNull = e => e !== undefined
      operations = [this._operations.find(isForValue)].filter(notNull)
    }
    return operations
  }

  /**
   * Create Set from a json object
   * @param  {[Object]} json [Input object to create the Set from. Needs to be: '{ values: [] }']
   * @return {[Set]}         [new Set instance]
   */
  static from (json) {
    return new CmRDTSet(json.values)
  }

  /**
   * Check if two Set are equal
   *
   * Two Set are equal if they both contain exactly 
   * the same values.
   * 
   * @param  {[Set]}  a [Set to compare]
   * @param  {[Set]}  b [Set to compare]
   * @return {Boolean}  [True input Set are the same]
   */
  static isEqual (a, b) {
    return (a.toArray().length === b.toArray().length)
      && a.hasAll(b.toArray())
  }

  /**
   * Return the difference between the values of two Sets
   * 
   * @param  {[Set]} a [First Set]
   * @param  {[Set]} b [Second Set]
   * @return {[Set]}   [Set of values that are in Set A but not in Set B]
   */
  static difference (a, b) {
    const otherDoesntInclude = x => !b.has(x)
    const difference = new Set([...a.values()].filter(otherDoesntInclude))
    return difference
  }
}

module.exports = CmRDTSet
