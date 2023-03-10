import CRDTSet from './CmRDT-Set.js'
import GSet from './G-Set.js'

/**
 * 2P-Set
 *
 * Operation-based Two-Phase Set CRDT
 *
 * See base class CmRDT-Set.js for the rest of the API
 * https://github.com/orbitdb/crdts/blob/master/src/CmRDT-Set.js
 *
 * Sources:
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, "3.3.2 2P-Set"
 */
 export default class TwoPSet<V=unknown, T=unknown> extends CRDTSet<V, T> {
  protected _added: GSet<V, T>
	protected _removed: GSet<V, T>
  /**
   * Create a new TwoPSet instance
   * @param  {[Iterable]} added   [Added values]
   * @param  {[Iterable]} removed [Removed values]
   */
  constructor (added: Iterable<V>, removed: Iterable<V>) {
    super()
    // We track the operations and state differently
    // than the base class: use two GSets for operations
    this._added = new GSet(added)
    this._removed = new GSet(removed)
  }

  /**
   * Return all values added to the Set
   * @override
   * @return {[Iterator]} [Iterator for values in the Set]
   */
  values (): IterableIterator<V> {
    // A value is included in the set if it's present in
    // the add set and not present in the remove set. We can
    // determine this by calculating the difference between
    // adds and removes.

    // @ts-ignore merge is different between GSet and CmRDTSet.
    const difference = GSet.difference(this._added, this._removed)
    return difference.values()
  }

  /**
   * Add a value to the Set
   * @param {[Any]} value [Value to add to the Set]
   */
  add (element: V): this {
    this._added.add(element)

    return this
  }

  /**
   * Remove a value from the Set
   * @override
   * @param  {[Any]} element [Value to remove from the Set]
   */
  remove (element: V) {
    // Only add the value to the remove set if it exists in the add set
    if (this._added.has(element)) {
      this._removed.add(element)
    }
  }

  /**
   * Merge the Set with another Set
   * @override
   * @param  {[TwoPSet]} other [Set to merge with]
   */
  // @ts-ignore TS2416 We are modifying the signature of CRDTSet here.
  merge (other: TwoPSet<V, T>) {
    this._added = new GSet(this._added.toArray().concat(other._added.toArray()))
    this._removed = new GSet(this._removed.toArray().concat(other._removed.toArray()))
  }

  /**
   * TwoPSet as an Object that can be JSON.stringified
   * @return {[Object]} [Object in the shape of `{ values: { added: [<values>], removed: [<values>] } }`]
   */
  // @ts-ignore TS2416 We are modifying the signature of CRDTSet here.
  toJSON (): { values: { added: V[], removed: V[] } } {
    return {
      values: {
        added: this._added.toArray(),
        removed: this._removed.toArray(),
      },
    }
  }

  /**
   * Create TwoPSet from a json object
   * @param  {[Object]} json [Input object to create the GSet from. Needs to be: '{ values: { added: [...], removed: [...] } }']
   * @return {[TwoPSet]}        [new TwoPSet instance]
   */
  static from<V=unknown, T=unknown> (json: { values: { added: V[], removed: V[] } }): TwoPSet<V, T> {
    return new TwoPSet(json.values.added, json.values.removed)
  }
}
