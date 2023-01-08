import GCounter from '../src/G-Counter.js'

const isGCounter = (obj) => obj && obj instanceof GCounter

export default class PNCounter {
  constructor (id, pCounters, nCounters) {
    this.id = id
    this.p = isGCounter(pCounters) ? pCounters : new GCounter(id, pCounters)
    this.n = isGCounter(nCounters) ? nCounters : new GCounter(id, nCounters)
  }

  get value() {
    return this.p.value - this.n.value
  }

  increment (amount) {
    this.p.increment(amount)
  }

  decrement (amount) {
    this.n.increment(amount)
  }

  merge (other) {
    this.p.merge(other.p)
    this.n.merge(other.n)
  }

  toJSON () {
    return {
      id: this.id,
      p: this.p._counters,
      n: this.n._counters
    }
  }

  isEqual (other) {
   return PNCounter.isEqual(this, other)
  }

  static from (json) {
    return new PNCounter(json.id, json.p, json.n)
  }

  static isEqual (a, b) {
    return GCounter.isEqual(a.p, b.p) && GCounter.isEqual(a.n, b.n)
  }
}
