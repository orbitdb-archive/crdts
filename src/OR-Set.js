'use strict'

const CRDTSet = require('./CmRDT-Set')

/**
 * OR-Set
 *
 * Operation-based Observed-Remove Set CRDT
 *
 * See base class CmRDT-Set.js for the rest of the API
 * https://github.com/orbitdb/crdts/blob/master/src/CmRDT-Set.js
 *
 * Sources:
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, "3.3.5 Observed-Remove Set (OR-Set)"
 */
class ORSet extends CRDTSet {
  /**
   * @override
   * 
   * Remove a value from the Set
   *
   * Overriding the remove functionality for OR-Set, so that we
   * have the Observed-remove mechanics: when a remove operation
   * is executed, we add all the known add operation tags to the
   * removed tags allowing us to exclude the value from the set
   * in _resolveState() if all given add tags are present in 
   * remove tags.
   *
   * @param  {[Any]} value [Value to remove from the Set]
   * @param  {[Any]} tag   [Optional tag for this remove operation, eg. a clock]
   */
  remove (value) {
    // Add all observed (known) add tags to the removed tags
    const removeObserved = e => e.removed = new Set([...e.added, ...e.removed])
    // Create a remove operation for the value if it exists
    this._findOperationsFor(value).map(removeObserved)
  }

  /**
   * @override
   * 
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
    // Check if a tag is included in the remove set
    const hasMatchingRemoveOperation = addTag => {
      // Check if remove tags includes the add tag, ie. check for 
      // equality for the tags using a provided comparison function
      if (compareFunc) {
        return !Array.from(removed).some(removeTag => compareFunc(removeTag, addTag))
      }

      // If remove set doesn't have the tag, 
      // return true to include the value in the state
      return !removed.has(addTag)
    }
    // If the remove set doesn't include the add tag,
    // return true to include the value in the state
    return Array.from(added).filter(hasMatchingRemoveOperation).length > 0
  }

  /**
   * Create ORSet from a json object
   * @param  {[Object]} json [Input object to create the ORSet from. Needs to be: '{ values: [] }']
   * @return {[ORSet]}      [new ORSet instance]
   */
  static from (json) {
    return new ORSet(json.values)
  }
}

module.exports = ORSet
