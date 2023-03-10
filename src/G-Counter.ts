import { deepEqual } from './utils.js'
const sum = (acc: number, val: number) => acc + val

/**
 * G-Counter
 *
 * Operation-based Increment-Only Counter CRDT
 *
 * Sources:
 * "A comprehensive study of Convergent and Commutative Replicated Data Types"
 * http://hal.upmc.fr/inria-00555588/document, "3.1.1 Op-based counter and 3.1.2  State-based increment-only Counter (G-Counter)"
 */

export default class GCounter {
	readonly id: string;
	private readonly _counters: Record<string, number>;

  constructor (id: string, counter: Record<string, number>) {
    this.id = id
    this._counters = counter ? counter : {}
    this._counters[this.id] = this._counters[this.id] ? this._counters[this.id] : 0
  }

  get value (): number {
    return Object.values(this._counters).reduce(sum, 0)
  }

  increment (amount?: number): void {
    if (amount && amount < 1)
      return

    if (amount == null)
      amount = 1

    this._counters[this.id] = this._counters[this.id] + amount
  }

  merge (other: GCounter) {
    // Go through each counter in the other counter
    Object.entries(other._counters).forEach(([id, value]) => {
      // Take the maximum of the counter value we have or the counter value they have
      this._counters[id] = Math.max(this._counters[id] || 0, value)
    })
  }

  toJSON (): { id: string, counters: Record<string, number> } {
    return {
      id: this.id,
      counters: this._counters
    }
  }

  isEqual (other: GCounter) {
    return GCounter.isEqual(this, other)
  }

  static from (json: { id: string, counters: Record<string, number> }) {
    return new GCounter(json.id, json.counters)
  }

  static isEqual (a: GCounter, b: GCounter) {
    if(a.id !== b.id)
      return false

    return deepEqual(a._counters, b._counters)
  }
}
