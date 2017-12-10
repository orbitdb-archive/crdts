'use strict'

const assert = require('assert')

const CRDTs = require('../src')
const { GCounter, GSet, TwoPSet, ORSet, LWWSet } = CRDTs
const CmRDTSet = require('../src/CmRDT-Set')

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
    type: 'CmRDT-Set',
    class: CmRDTSet,
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
    expectedValues: ['A'],
    expectedValuesWithDiff: added.slice(1, added.length).concat(diff),
    create: (input) => new CmRDTSet(input && input.values ? input.values : []),
    from: (json) => new CmRDTSet(json && json.values ? json.values : []),
    remove: (crdt, tag) => crdt.remove(tag),
    isEqual: (a, b) => CmRDTSet.isEqual(a, b),
    difference: (a, b) => CmRDTSet.difference(a, b),
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
        const crdt1 = CRDT.create(CRDT.inputData)
        const crdt2 = CRDT.from(CRDT.inputData)
        assert.deepEqual(new Set(crdt2.values()), new Set(CRDT.expectedValues))
      })

      it('is a Set', () => {
        const crdt = CRDT.create()
        assert.equal(crdt instanceof Set, true)
      })

      it('provides a JSON object and creates itself from it', () => {
        const crdt1 = CRDT.create()
        crdt1.add('A')
        crdt1.add('B')
        crdt1.add('C')
        const crdt2 = CRDT.class.from(crdt1.toJSON())
        assert.deepEqual(new Set(crdt2.values()), new Set(crdt1.values()))
      })

      it('toArray() returns the values in the set as an array', () => {
        const crdt1 = CRDT.create()
        crdt1.add('A')
        crdt1.add('B')
        crdt1.add('C')
        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'C'])
      })

      it('returns true if two Sets are equal', () => {
        const crdt1 = CRDT.create(CRDT.inputData)
        const crdt2 = CRDT.create(CRDT.inputData)
        const crdt3 = CRDT.create([])
        assert.equal(CRDT.isEqual(crdt1, crdt2), true)
        const isEqual = CRDT.isEqual(crdt1, crdt3)
        assert.equal(isEqual, false)
      })

      it('returns true if set has all values', () => {
        const crdt1 = CRDT.create(CRDT.inputData)
        assert.equal(crdt1.hasAll(CRDT.expectedValues), true)
      })

      it('returns false if set doesn\'t have all values', () => {
        const crdt1 = CRDT.create(CRDT.inputData)
        assert.equal(crdt1.hasAll(CRDT.expectedValues.concat(['extra', 1])), false)
      })

      it('returns a Set of values from Set A that are not in Set B', () => {
        const addedValues = added
        const removedValues = removed
        const expectedDiff = CRDT.diff
        const expectedValues = CRDT.expectedValuesWithDiff

        const crdt1 = CRDT.create()
        const crdt2 = CRDT.create()
        const crdt3 = CRDT.create()

        addedValues.concat(expectedDiff).forEach((e, idx) => crdt1.add(e, idx))
        removedValues.forEach(e => CRDT.remove(crdt1, e, 10))
        addedValues.forEach(e => crdt2.add(e, 100))

        assert.deepEqual(CRDT.difference(crdt1, crdt2), new Set(expectedDiff))
        assert.deepEqual(CRDT.difference(crdt1, crdt3), new Set(expectedValues))
      })
    })
  })
})
