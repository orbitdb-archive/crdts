'use strict'

const assert = require('assert')

const CRDTs = require('../index.js')
const { GCounter, GSet, TwoPSet, ORSet, LWWSet } = CRDTs

const added = [1, 2, 3]
const removed = [1]
const diff = ['one', 77]

const crdts = [
  {
    type: 'G-Set',
    class: GSet,
    added: added,
    removed: [],
    diff: diff,
    inputData: {
      values: added,
    },
    expectedValues: added,
    expectedValuesWithDiff: added.concat(diff),
    create: (input) => new GSet(input && input.values ? input.values : []),
    from: (json) => GSet.from(json),
    remove: (crdt, tag) => 0,
    isEqual: (a, b) => GSet.isEqual(a, b),
    difference: (a, b) => GSet.difference(a, b),
  },
  {
    type: '2P-Set',
    class: TwoPSet,
    added: added,
    removed: removed,
    diff: diff,
    inputData: {
      values: {
        added: added,
        removed: removed,
      }
    },
    expectedValues: [2, 3],
    expectedValuesWithDiff: added.slice(1, added.length).concat(diff),
    create: (input) => new TwoPSet(input && input.values && input.values.added ? input.values.added : [], input && input.values && input.values.removed ? input.values.removed : []),
    from: (json) => TwoPSet.from(json),
    remove: (crdt, tag) => crdt.remove(tag),
    isEqual: (a, b) => TwoPSet.isEqual(a, b),
    difference: (a, b) => TwoPSet.difference(a, b),
  },
  {
    type: 'OR-Set',
    class: ORSet,
    added: added,
    removed: removed,
    diff: diff,
    inputData: {
      values: [
        {
          value: 'A',
          added: [1],
          removed: [],
        },
        {
          value: 'B',
          added: [1],
          removed: [1],
        },
        {
          value: 'C',
          added: [1, 2],
          removed: [2, 3],
        },
      ],
    },
    expectedValues: ['A', 'C'],
    expectedValuesWithDiff: added.slice(1, added.length).concat(diff),
    create: (input) => new ORSet(input && input.values ? input.values : []),
    from: (json) => ORSet.from(json),
    remove: (crdt, tag) => crdt.remove(tag),
    isEqual: (a, b) => ORSet.isEqual(a, b),
    difference: (a, b) => ORSet.difference(a, b),
  },
  {
    type: 'LWW-Set',
    class: LWWSet,
    added: added,
    removed: removed,
    diff: diff,
    inputData: {
      values: [
        {
          value: 'A',
          added: [1],
          removed: [],
        },
        {
          value: 'B',
          added: [1],
          removed: [1],
        },
        {
          value: 'C',
          added: [1, 2],
          removed: [2, 3],
        },
      ],
    },
    expectedValues: ['A', 'B'],
    expectedValuesWithDiff: added.slice(1, added.length).concat(diff),
    create: (input) => new LWWSet(input && input.values ? input.values : []),
    from: (json) => LWWSet.from(json),
    remove: (crdt, value, tag) => crdt.remove(value, tag + 1),
    isEqual: (a, b) => LWWSet.isEqual(a, b),
    difference: (a, b) => LWWSet.difference(a, b),
  },
]

describe('Sets - Common', () => {
  crdts.forEach(async (CRDT) => {
    describe(CRDT.type, () => {
      it('creates a new ' + CRDT.type + ' from a JSON object', () => {
        const orset1 = CRDT.create(CRDT.inputData)
        const orset2 = CRDT.from(CRDT.inputData)
        assert.deepEqual(new Set(orset2.values), new Set(CRDT.expectedValues))
      })

      it('returns true if two Sets are equal', () => {
        const orset1 = CRDT.create(CRDT.inputData)
        const orset2 = CRDT.create(CRDT.inputData)
        const orset3 = CRDT.create([])
        assert.equal(CRDT.isEqual(orset1, orset2), true)
        const isEqual = CRDT.isEqual(orset1, orset3)
        assert.equal(isEqual, false)
      })

      it('returns a Set of values from Set A that are not in Set B', () => {
        const addedValues = added
        const removedValues = removed
        const expectedDiff = CRDT.diff
        const expectedValues = CRDT.expectedValuesWithDiff

        const orset1 = CRDT.create()
        const orset2 = CRDT.create()
        const orset3 = CRDT.create()

        addedValues.concat(expectedDiff).forEach((e, idx) => orset1.add(e, idx))
        removedValues.forEach(e => CRDT.remove(orset1, e, 10))
        addedValues.forEach(e => orset2.add(e, 100))

        assert.deepEqual(CRDT.difference(orset1, orset2), new Set(expectedDiff))
        assert.deepEqual(CRDT.difference(orset1, orset3), new Set(expectedValues))
      })
    })
  })
})
