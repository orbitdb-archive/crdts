'use strict'

const assert = require('assert')
const Counter = require('../src').GCounter

describe('G-Counter', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a counter', () => {
        const counter = new Counter('A')
        assert(counter, null)
        assert.notEqual(counter.id, null)
        assert.notEqual(counter._counters, null)
        assert.equal(counter._counters['A'], 0)
      })
    })

    describe('value', () => {
      it('returns the count', () => {
        const counter = new Counter('A')
        assert.equal(counter.value, 0)
      })

      it('returns the count after increment', () => {
        const counter = new Counter('A')
        counter.increment(5)
        assert.equal(counter.value, 5)
      })
    })

    describe('increment', () => {
      it('increments the count by 1', () => {
        const counter = new Counter('A')
        counter.increment()
        assert.equal(counter.value, 1)
      })

      it('increments the count by 2', () => {
        const counter = new Counter('A')
        counter.increment()
        counter.increment()
        assert.equal(counter.value, 2)
      })

      it('increments the count by 3', () => {
        const counter = new Counter('A')
        counter.increment(3)
        assert.equal(counter.value, 3)
      })

      it('increments the count by 42', () => {
        const counter = new Counter('A')
        counter.increment()
        counter.increment(42)
        assert.equal(counter.value, 43)
      })

      it('can\'t decrease the counter', () => {
        const counter = new Counter('A')
        counter.increment(-1)
        assert.equal(counter.value, 0)
      })

      it('can\'t decrease the counter', () => {
        const counter = new Counter('A')
        counter.increment(0)
        assert.equal(counter.value, 0)
      })
    })

    describe('merge', () => {
      it('merges two counters with same id', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('A')
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        assert.equal(counter1.value, 1)
      })

      it('merges two counters with same values', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('B')
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        counter2.merge(counter1)
        assert.equal(counter1.value, 2)
        assert.equal(counter2.value, 2)
      })

      it('merges four different counters', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('B')
        const counter3 = new Counter('C')
        const counter4 = new Counter('D')
        counter1.increment()
        counter2.increment()
        counter3.increment()
        counter4.increment()
        counter1.merge(counter2)
        counter1.merge(counter3)
        counter1.merge(counter4)
        assert.equal(counter1.value, 4)
      })

      it('doesn\'t overwrite its own value on merge', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('B')
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        counter2.merge(counter1)
        counter1.increment()
        counter1.merge(counter2)
        assert.equal(counter1.value, 3)
      })

      it('doesn\'t overwrite others\' values on merge', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('B')
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        counter2.merge(counter1)
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        assert.equal(counter1.value, 4)
      })
    })

    describe('toJSON', () => {
      it('returns the counter as JSON object', () => {
        const counter = new Counter('A')
        assert.equal(counter.toJSON().id, 'A')
        assert.equal(counter.toJSON().counters.A, 0)
      })

      it('returns a JSON object after a merge', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('B')
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        counter2.merge(counter1)
        assert.equal(Object.keys(counter1.toJSON().counters).length, 2)
        assert.equal(counter1.toJSON().counters.A, 1)
        assert.equal(counter1.toJSON().counters.B, 1)
        assert.equal(counter2.toJSON().counters.A, 1)
        assert.equal(counter2.toJSON().counters.B, 1)
      })
    })

    describe('isEqual', () => {
      it('returns true for equal counters', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('A')
        counter1.increment()
        counter2.increment()
        assert.equal(counter1.isEqual(counter2), true)
      })

      it('returns false for unequal counters - different id', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('B')
        assert.equal(counter1.isEqual(counter2), false)
      })

      it('returns false for unequal counters - same id, different counts', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('A')
        counter1.increment()
        counter2.increment()
        counter2.increment()
        assert.equal(counter1.isEqual(counter2), false)
      })

      it('returns false for unequal counters - different counters', () => {
        const counter1 = new Counter('A')
        const counter2 = new Counter('A')
        counter2._counters['extra'] = 'world'
        assert.equal(counter1.isEqual(counter2), false)
      })
    })
  })

  describe('GCounter.from', () => {
    it('creates a new counter from JSON object', () => {
      const counter1 = new Counter('A')
      counter1.increment()

      const input = {
        id: 'A',
        counters: {
          A: 1,
        }
      }

      const counter2 = Counter.from(input)
      assert.equal(Counter.isEqual(counter1, counter2), true)
      assert.equal(counter2.id, 'A')
      assert.equal(counter2.value, 1)
    })
  })

  describe('GCounter.isEqual', () => {
    it('returns true if to GSets are equal', () => {
      const values = ['A', 'B', 'C']
      const counter1 = new Counter('A')
      const counter2 = new Counter('A')
      const counter3 = new Counter('B')
      counter1.increment(2)
      counter2.increment(2)
      assert.equal(Counter.isEqual(counter1, counter2), true)
      assert.equal(Counter.isEqual(counter1, counter3), false)
    })
  })
})
