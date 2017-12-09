'use strict'

const assert = require('assert')
const { GCounter, PNCounter } = require('../src')

describe('PN-Counter', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a counter', () => {
        const counter = new PNCounter('A')
        assert(counter, null)
        assert.notEqual(counter.id, null)
        assert.notEqual(counter.p, null)
        assert.notEqual(counter.n, null)
      })

      it('creates two GCounters', () => {
	const gcounters = new PNCounter()
	assert.notEqual(gcounters.p, null)
	assert.notEqual(gcounters.n, null)
	assert.equal(gcounters.p instanceof GCounter, true)
	assert.equal(gcounters.n instanceof GCounter, true)
      })
    })

    describe('value', () => {
      it('returns the count', () => {
        const counter = new PNCounter('A')
        assert.equal(counter.value, 0)
      })

      it('returns the count after increment', () => {
        const counter = new PNCounter('A')
        counter.increment(5)
        assert.equal(counter.value, 5)
      })

      it('returns the count after increment and decrement', () => {
        const counter = new PNCounter('A')
        counter.increment(5)
	counter.decrement(3)
        assert.equal(counter.value, 2)
      })
    })

    describe('increment', () => {
      it('increments the count by 1', () => {
        const counter = new PNCounter('A')
        counter.increment()
        assert.equal(counter.value, 1)
      })

      it('increments the count by 2', () => {
        const counter = new PNCounter('A')
        counter.increment()
        counter.increment()
        assert.equal(counter.value, 2)
      })

      it('increments the count by 3', () => {
        const counter = new PNCounter('A')
        counter.increment(3)
        assert.equal(counter.value, 3)
      })

      it('increments the count by 42', () => {
        const counter = new PNCounter('A')
        counter.increment()
        counter.increment(42)
        assert.equal(counter.value, 43)
      })

      it('can\'t increment the counter by negative number', () => {
        const counter = new PNCounter('A')
        counter.increment(-1)
        assert.equal(counter.value, 0)
      })
    })

    describe('decrement', () => {
      it('decrements the count by 1', () => {
        const counter = new PNCounter('A')
        counter.decrement()
        assert.equal(counter.value, -1)
      })

      it('increments the count by 2 then decrements by 1', () => {
        const counter = new PNCounter('A')
        counter.increment()
        counter.increment()
        counter.decrement()
        assert.equal(counter.value, 1)
      })

      it('increments the count by 3 then decrement by 2', () => {
        const counter = new PNCounter('A')
        counter.increment(3)
	counter.decrement(2)
        assert.equal(counter.value, 1)
      })

      it('increment the count by 100 then decrement by 58', () => {
        const counter = new PNCounter('A')
        counter.increment()
        counter.increment(99)
        counter.decrement(58)
        assert.equal(counter.value, 42)
      })

      it('can\'t decrement by negative number', () => {
        const counter = new PNCounter('A')
        counter.decrement(-1)
        assert.equal(counter.value, 0)
      })
    })

    describe('merge', () => {
      it('merges two counters with same id', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('A')
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        assert.equal(counter1.value, 1)
      })

      it('merges two counters with same values', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('B')
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        counter2.merge(counter1)
        assert.equal(counter1.value, 2)
        assert.equal(counter2.value, 2)
      })

      it('merges four different counters', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('B')
        const counter3 = new PNCounter('C')
        const counter4 = new PNCounter('D')
        counter1.increment()
        counter2.increment(5)
        counter3.increment(5)
        counter3.decrement(3)
        counter4.increment()
        counter4.increment()
        counter4.decrement()
        counter1.merge(counter2)
        counter1.merge(counter3)
        counter1.merge(counter4)
        assert.equal(counter1.value, 9)
      })

      it('doesn\'t overwrite its own value on merge', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('B')
        counter1.increment(3)
        counter2.increment()
        counter1.merge(counter2)
        counter2.merge(counter1)
        counter1.decrement()
        counter1.merge(counter2)
        assert.equal(counter1.value, 3)
      })

      it('doesn\'t overwrite others\' values on merge', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('B')
        counter1.increment()
        counter2.increment()
        counter1.merge(counter2)
        counter2.merge(counter1)
        counter1.increment(2)
        counter2.increment()
        counter2.decrement(2)
        counter1.merge(counter2)
        assert.equal(counter1.value, 3)
      })
    })

    describe('toJSON', () => {
      it('returns the counter as JSON object', () => {
        const counter = new PNCounter('A')
        assert.equal(counter.toJSON().id, 'A')
        assert.equal(counter.toJSON().p._counters.A, 0)
        assert.equal(counter.toJSON().n._counters.A, 0)
      })

      it('returns a JSON object after a merge', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('B')
        counter1.increment()
        counter2.increment()
        counter1.decrement()
        counter2.decrement()
        counter1.merge(counter2)
        counter2.merge(counter1)
        assert.equal(Object.keys(counter1.toJSON().p._counters).length, 2)
        assert.equal(Object.keys(counter1.toJSON().n._counters).length, 2)
        assert.equal(counter1.toJSON().p._counters.A, 1)
        assert.equal(counter1.toJSON().p._counters.B, 1)
        assert.equal(counter2.toJSON().p._counters.A, 1)
        assert.equal(counter2.toJSON().p._counters.B, 1)
        assert.equal(counter1.toJSON().n._counters.A, 1)
        assert.equal(counter1.toJSON().n._counters.B, 1)
        assert.equal(counter2.toJSON().n._counters.A, 1)
        assert.equal(counter2.toJSON().n._counters.B, 1)
      })
    })

    describe('isEqual', () => {
      it('returns true for equal counters', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('A')
        counter1.increment()
        counter2.increment()
        counter1.decrement()
        counter2.decrement()
        assert.equal(counter1.isEqual(counter2), true)
      })

      it('returns false for unequal counters - different id', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('B')
        assert.equal(counter1.isEqual(counter2), false)
      })

      it('returns false for unequal counters - same id, different counts', () => {
        const counter1 = new PNCounter('A')
        const counter2 = new PNCounter('A')
        counter1.increment()
        counter2.increment()
        counter2.decrement()
        assert.equal(counter1.isEqual(counter2), false)
      })
    })
  })

  describe('PNCounter.from', () => {
    it('creates a new counter from JSON object', () => {
      const counter1 = new PNCounter('A')
      counter1.increment()
      counter1.decrement()
      const gCounter1 = new GCounter('A')
      gCounter1.increment()
      const gCounter2 = new GCounter('A')
      gCounter2.increment()
      const input = {
        id: 'A',
        p: gCounter1,
        n: gCounter2
      }

      const counter2 = PNCounter.from(input)
      assert.equal(PNCounter.isEqual(counter1, counter2), true)
      assert.equal(counter2.id, 'A')
      assert.equal(counter2.value, 0)
    })
  })

  describe('PNCounter.isEqual', () => {
    it('returns true if two PNCounters are equal', () => {
      const values = ['A', 'B', 'C']
      const counter1 = new PNCounter('A')
      const counter2 = new PNCounter('A')
      const counter3 = new PNCounter('B')
      counter1.increment(2)
      counter1.decrement()
      counter2.increment(2)
      counter2.decrement()
      assert.equal(PNCounter.isEqual(counter1, counter2), true)
      assert.equal(PNCounter.isEqual(counter1, counter3), false)
    })
  })
})
