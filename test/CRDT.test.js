'use strict'

const assert = require('assert')

const CRDTs = require('../src')
const { GCounter, GSet, TwoPSet, ORSet, LWWSet } = CRDTs
const CmRDTSet = require('../src/CmRDT-Set')

const crdts = [
  {
    type: 'G-Counter',
    class: GCounter,
    create: (id) => new GCounter(id),
    update: (crdt, value) => crdt.increment(value),
    merge: (crdt, other) => crdt.merge(other),
    query: (crdt) => crdt.value,
    getExpectedMergedValue: (values) => values.reduce((acc, val) => acc + val, 0),
  },
  {
    type: 'G-Set',
    class: GSet,
    create: () => new GSet(),
    update: (crdt, value) => crdt.add(value),
    merge: (crdt, other) => crdt.merge(other),
    query: (crdt) => new Set(crdt.values()),
    getExpectedMergedValue: (values) => new Set(values),
  },
  {
    type: '2P-Set',
    class: TwoPSet,
    create: () => new GSet(),
    update: (crdt, value) => crdt.add(value),
    merge: (crdt, other) => crdt.merge(other),
    query: (crdt) => new Set(crdt.values()),
    getExpectedMergedValue: (values) => new Set(values),
  },
  {
    type: 'OR-Set',
    class: ORSet,
    create: () => new ORSet(),
    update: (crdt, value) => crdt.add(value),
    merge: (crdt, other) => crdt.merge(other),
    query: (crdt) => new Set(crdt.values()),
    getExpectedMergedValue: (values) => new Set(values),
  },
  {
    type: 'LWW-Set',
    class: LWWSet,
    create: () => new LWWSet(),
    update: (crdt, value) => crdt.add(value, 0),
    merge: (crdt, other) => crdt.merge(other),
    query: (crdt) => new Set(crdt.values()),
    getExpectedMergedValue: (values) => new Set(values),
  },
]

describe('CRDT', () => {
  crdts.forEach(async (CRDT) => {
    describe(CRDT.type, () => {
      // Associativity: 
      // a + (b + c) == (a + b) + c
      it('is associative', () => {
        // a + (b + c)
        const crdt1 = CRDT.create('A')
        const crdt2 = CRDT.create('B')
        const crdt3 = CRDT.create('C')
        CRDT.update(crdt1, 42)
        CRDT.update(crdt2, 2)
        CRDT.update(crdt3, 1)
        CRDT.merge(crdt2, crdt3)
        CRDT.merge(crdt1, crdt2)
        const expectedValue1 = CRDT.getExpectedMergedValue([2, 42, 1])
        const res1 = CRDT.query(crdt1)
        assert.deepEqual(res1, expectedValue1)

        // (a + b) + c
        const crdt4 = CRDT.create('A')
        const crdt5 = CRDT.create('B')
        const crdt6 = CRDT.create('C')
        CRDT.update(crdt4, 42)
        CRDT.update(crdt5, 2)
        CRDT.update(crdt6, 1)
        CRDT.merge(crdt4, crdt5)
        CRDT.merge(crdt6, crdt4)
        const expectedValue2 = CRDT.getExpectedMergedValue([1, 2, 42])
        const res2 = CRDT.query(crdt6)
        assert.deepEqual(res2, expectedValue2)

        // a + (b + c) == (a + b) + c
        assert.deepEqual(res1, res2)
      })

      // Commutativity: 
      // a + b == b + a
      it('is commutative', () => {
        // a + b
        const crdt1 = CRDT.create('A')
        const crdt2 = CRDT.create('B')
        CRDT.update(crdt1, 12)
        CRDT.update(crdt2, 43)
        CRDT.merge(crdt1, crdt2)
        const expectedValue1 = CRDT.getExpectedMergedValue([43, 12])
        const res1 = CRDT.query(crdt1)
        assert.deepEqual(res1, expectedValue1)

        // b + a
        const crdt3 = CRDT.create('A')
        const crdt4 = CRDT.create('B')
        CRDT.update(crdt3, 12)
        CRDT.update(crdt4, 43)
        CRDT.merge(crdt3, crdt4)
        const expectedValue2 = CRDT.getExpectedMergedValue([12, 43])
        const res2 = CRDT.query(crdt3)
        assert.deepEqual(res2, expectedValue2)

        // a + b == b + a
        assert.deepEqual(res1, res2)
      })

      // Idempotence: 
      // a + a = a
      it('is idempotent', () => {
        const crdt = CRDT.create('A')
        CRDT.update(crdt, 3)
        CRDT.update(crdt, 42)
        CRDT.update(crdt, 7)
        CRDT.merge(crdt, crdt)
        const res = CRDT.query(crdt)
        const expectedValue = CRDT.getExpectedMergedValue([7, 3, 42])

        // a + a = a
        assert.deepEqual(res, expectedValue)
      })
    })
  })
})
