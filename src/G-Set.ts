import CRDTSet from './CmRDT-Set.js'

/**
 * G-Set
 *
 * Operation-based Grow-Only Set CRDT
 *
 * G stands for "Grow-Only" which means that values can only
 * ever be added to the set, they can never be removed.
 *
 * See base class CmRDT-Set.js for the rest of the API
 * https://github.com/orbitdb/crdts/blob/master/src/CmRDT-Set.js
 *
 * Used by:
 * 2P-Set - https://github.com/orbitdb/crdts/blob/master/src/2P-Set.js
 *
 * Sources:
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, "3.3.1 Grow-Only Set (G-Set)"
 */
export default class GSet<V=unknown, T=unknown> extends CRDTSet<V, T> {
  /**
   * Create a G-Set CRDT instance
   * @param  {[Iterable]} iterable [Opetional Iterable object (eg. Array, Set) to create the GSet from]
   */
  constructor (iterable: Iterable<V>) {
    super()
    this._values = new Set(iterable)
  }

  /**
   * Return all values added to the Set
   * @return {[Iterator]} [Iterator for values in the Set]
   */
  values (): IterableIterator<V> {
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
  add (value: V): this {
    this._values.add(value)
    return this
  }

  // G-Set doesn't allow removal of values, throw an error
  // Including this to satisfy normal Set API in case the user
  // accidentally calls remove on GSet
  remove (value: V) {
    throw new Error(`G-Set doesn't allow removing values`)
  }

  /**
   * Merge another GSet to this GSet
   * @param  {[GSet]} other [GSet to merge with]
   */
  // @ts-ignore TS2416 We are modifying the signature of CRDTSet here.
  merge (other: GSet<V, T>): void {
    // Merge values of other set with this set
    this._values = new Set<V>([...this._values, ...other._values])
  }

  /**
   * GSet as an Object that can be JSON.stringified
   * @return {[Object]} [Object in the shape of `{ values: [<values>] }`]
   */
  // @ts-ignore TS2416 We are modifying the signature of CRDTSet here.
  toJSON (): { values: V[] } {
    return {
      values: this.toArray(),
    }
  }

  /**
   * Create GSet from a json object
   * @param  {[Object]} json [Input object to create the GSet from. Needs to be: '{ values: [] }']
   * @return {[GSet]}        [new GSet instance]
   */

  static from<V=unknown, T=unknown> (json: { values: V[] }) {
    return new GSet<V, T>(json.values)
  }
}
