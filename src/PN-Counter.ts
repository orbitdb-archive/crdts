import GCounter from '../src/G-Counter.js'

export default class PNCounter {
	readonly id: string
	readonly p: GCounter
	readonly n: GCounter

  constructor (id: string, pCounters: Record<string, number> | GCounter, nCounters: Record<string, number> | GCounter) {
    this.id = id

    if (pCounters instanceof GCounter)
      this.p = pCounters
    else
      this.p = new GCounter(id, pCounters)

    if (nCounters instanceof GCounter)
      this.n = nCounters
    else
      this.n = new GCounter(id, nCounters)
  }

  get value(): number {
    return this.p.value - this.n.value
  }

  increment (amount: number): void {
    this.p.increment(amount)
  }

  decrement (amount: number): void {
    this.n.increment(amount)
  }

  merge (other: PNCounter) {
    this.p.merge(other.p)
    this.n.merge(other.n)
  }

  toJSON (): { id: string, p: Record<string, number>, n: Record<string, number> } {
    return {
      id: this.id,
      p: this.p.toJSON().counters,
      n: this.n.toJSON().counters
    }
  }

  isEqual (other: PNCounter): boolean {
   return PNCounter.isEqual(this, other)
  }

  static from (json: { id: string, p: Record<string, number>, n: Record<string, number> }): PNCounter {
    return new PNCounter(json.id, json.p, json.n)
  }

  static isEqual (a: PNCounter, b: PNCounter): boolean {
    return GCounter.isEqual(a.p, b.p) && GCounter.isEqual(a.n, b.n)
  }
}
