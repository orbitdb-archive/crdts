'use strict'

const GSet = require('./G-Set')
const { OperationTuple3 } = require('./utils')

/**
 * CmRDT-Set
 *
 * Base Class for Operation-Based Set CRDT
 * 
 * Inherits from GSet. Operations are described as:
 * 
 * Operation = Tuple3(value : Any, added : Set, removed : Set)
 * 
 * This class is meant to be used as a base class for 
 * Operation-Based CRDTs that can be derived from Set 
 * semantics and which calculate the state (values)
 * based on a set of operations.
 *
 * Used by: 
 * OR-Set - https://github.com/haadcode/crdts/blob/master/src/OR-Set.js
 * 2P-Set - https://github.com/haadcode/crdts/blob/master/src/2P-Set.js
 * LWW-Set - https://github.com/haadcode/crdts/blob/master/LWW-Set.js
 *
 * Sources:
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document
 */
class CmRDTSet extends GSet {
  /**
   * Create a new CmRDTSet instance
   * @override
   *
   * A CmRDT Set inherits from GSet (Grow-Only Set)
   * 
   * The constructor should never be used directly 
   * but rather via `super()` call in the constructor of
   * the class that inherits from CmRDTSet
   * 
   * @param  {[Iterable]} iterable [Opetional Iterable object (eg. Array, Set) to create the GSet from]
   * @param  {[Object]}   options  [Options to pass to the Set. Currently supported: `{ compareFunc: (a, b) => true|false }`]
   */
  constructor (iterable, options) {
    super(iterable)
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
  get values () {
    const contains = e => this._resolveState(e.added, e.removed, this._options.compareFunc)
    const getValue = e => e.value
    // Filter out values that should not be in this set
    // by using the _resolveState() function to determine
    // if the value should be present
    const state = this._operations
      .filter(contains)
      .map(getValue)
    return new Set(state).values()
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
   * @param {[Any]} element [Value to add to the Set]
   * @param {[Any]} tag     [Optional tag for this add operation, eg. a clock]
   */
  add (element, tag = 0) {
    if (!this._values.has(element)) {
      const operation = OperationTuple3.create(element, [tag], null)
      this._addOperation(operation)
    } else {
      const elm = this._findElement(element)
      elm.added.add(tag)
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
   * @param  {[Any]} element [Value to remove from the Set]
   * @param  {[Any]} tag     [Optional tag for this remove operation, eg. a clock]
   */
  remove (element, tag = 0) {
    if (this._values.has(element)) {
      const elm = this._findElement(element)
      elm.removed.add(tag)
    }
  }

  /**
   * Merge the Set with another Set
   * @override
   * @param  {[CRDTSet]} other [Set to merge with]
   */
  merge (other) {
    other._operations.forEach(element => {
      const value = element.value
      if (!this._values.has(value)) {
        const operation = OperationTuple3.create(value, element.added, element.removed)
        this._addOperation(operation)
      } else {
        const elm = this._findElement(value)
        element.added.forEach(e => elm.added.add(e))
        element.removed.forEach(e => elm.removed.add(e))
      }
    })
  }

  /**
   * _resolveState function is used to determine if an element is present in a Set.
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
  _resolveState (added, removed, compareFunc) {
    // By default, if there's an add operation present,
    // we include the value in the set
    return added.size > 0
  }

  /**
   * Add a value to the internal cache
   * @param {[OperationTuple3]} operationTuple3 [Tuple3(value, addedTags, removedTags)]
   */
  _addOperation (operationTuple3) {
    this._operations.push(operationTuple3)
    this._values.add(operationTuple3.value)  
  }

  /**
   * Find a value from this set's internal cache
   * @private
   * @param  {[Any]} value [Value to find]
   * @return {[Any]}       [Value if found, undefined if value was not found]
   */
  _findElement (value) {
    const compare = e => e.value === value
    return this._operations.find(compare)
  }
}

module.exports = CmRDTSet
