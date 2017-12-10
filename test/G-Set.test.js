'use strict'

const assert = require('assert')
const { GSet, CmRDTSet } = require('../src')

describe('G-Set', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a set', () => {
        const crdt = new GSet()
        assert.notEqual(crdt, null)
        assert.notEqual(crdt._values, null)
        assert.equal(crdt._values instanceof Set, true)
      })

      it('is a CmRDT Set', () => {
        const crdt = new GSet()
        assert.equal(crdt instanceof CmRDTSet, true)
      })

      it('creates a set from values', () => {
        const crdt = new GSet(['A', 'B'])
        assert.notEqual(crdt, null)
        assert.equal(crdt._values instanceof Set, true)
        assert.deepEqual(crdt._values, new Set(['B', 'A']))
      })
    })

    describe('values', () => {
      it('is an Iterator', () => {
        const crdt = new GSet()
        assert.equal(crdt.values().toString(), '[object Set Iterator]')
      })

      it('returns an Iterator', () => {
        const crdt = new GSet()
        crdt.add('A')
        crdt.add('B')
        const iterator = crdt.values()
        assert.equal(iterator.next().value, 'A')
        assert.equal(iterator.next().value, 'B')
      })
    })

    describe('add', () => {
      it('adds an element to the set', () => {
        const crdt = new GSet()
        crdt.add('A')
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        const crdt = new GSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        assert.deepEqual(new Set(crdt.values()), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        const crdt = new GSet()
        crdt.add(1)
        crdt.add('A')
        crdt.add('A')
        crdt.add(1)
        crdt.add('A')
        const obj = { hello: 'ABC' }
        crdt.add(obj)
        crdt.add(obj)
        crdt.add({ hello: 'ABCD' })

        const expectedResult = [
          'A',
          1,
          { hello: 'ABC' },
          { hello: 'ABCD' },
        ]

        assert.deepEqual(new Set(crdt.values()), new Set(expectedResult))
      })
    })

    describe('remove', () => {
      it('doesn\'t allow removing values', () => {
        let crdt, err
        try {
          crdt = new GSet()
          crdt.add('A')
          crdt.remove('A')
        } catch (e) {
          err = e.toString()
        }
        assert.equal(err, `Error: G-Set doesn't allow removing values`)
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })
    })

    describe('merge', () => {
      it('merges two sets with same id', () => {
        const crdt1 = new GSet()
        const crdt2 = new GSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt2.add('C')
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'C'])
      })

      it('merges two sets with same values', () => {
        const crdt1 = new GSet()
        const crdt2 = new GSet()
        crdt1.add('A')
        crdt2.add('A')
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A'])
      })

      it('merge four different sets', () => {
        const crdt1 = new GSet()
        const crdt2 = new GSet()
        const crdt3 = new GSet()
        const crdt4 = new GSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt3.add('C')
        crdt4.add('D')

        crdt1.merge(crdt2)
        crdt1.merge(crdt3)
        crdt1.merge(crdt4)

        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'C', 'D'])
      })

      it('doesn\'t overwrite other\'s values on merge', () => {
        const crdt1 = new GSet()
        const crdt2 = new GSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt1.merge(crdt2)
        crdt1.add('AA')
        crdt2.add('BB')
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'AA', 'BB'])
        assert.deepEqual(crdt2.toArray(), ['B', 'BB'])
      })
    })

    describe('has', () => {
      it('returns true if given element is in the set', () => {
        const crdt = new GSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add(1)
        const obj = { hello: 'world' }
        crdt.add(obj)
        assert.equal(crdt.has('A'), true)
        assert.equal(crdt.has('B'), true)
        assert.equal(crdt.has(1), true)
        assert.equal(crdt.has(obj), true)
      })

      it('returns false if given element is not in the set', () => {
        const crdt = new GSet()
        crdt.add('A')
        crdt.add('B')
        assert.equal(crdt.has('nothere'), false)
      })
    })

    describe('hasAll', () => {
      it('returns true if all given elements are in the set', () => {
        const crdt = new GSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        crdt.add('D')
        assert.equal(crdt.hasAll(['D', 'A', 'C', 'B']), true)
      })

      it('returns false if any of the given elements are not in the set', () => {
        const crdt = new GSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        crdt.add('D')
        assert.equal(crdt.hasAll(['D', 'A', 'C', 'B', 'nothere']), false)
      })
    })

    describe('toArray', () => {
      it('returns the values of the set as an Array', () => {
        const crdt = new GSet()
        const array = crdt.toArray()
        assert.equal(Array.isArray(array), true)
      })

      it('returns values', () => {
        const crdt = new GSet()
        crdt.add('A')
        crdt.add('B')
        const array = crdt.toArray()
        assert.equal(array[0], 'A')
        assert.equal(array[1], 'B')
      })
    })

    describe('toJSON', () => {
      it('returns the set as JSON object', () => {
        const crdt = new GSet()
        crdt.add('A')
        assert.equal(crdt.toJSON().values.length, 1)
        assert.equal(crdt.toJSON().values[0], 'A')
      })

      it('returns a JSON object after a merge', () => {
        const crdt1 = new GSet()
        const crdt2 = new GSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt1.merge(crdt2)
        crdt2.merge(crdt1)
        assert.equal(crdt1.toJSON().values.length, 2)
        assert.equal(crdt1.toJSON().values[0], 'A')
        assert.equal(crdt1.toJSON().values[1], 'B')
      })
    })

    describe('isEqual', () => {
      it('returns true for sets with same values', () => {
        const crdt1 = new GSet()
        const crdt2 = new GSet()
        crdt1.add('A')
        crdt2.add('A')
        assert.equal(crdt1.isEqual(crdt2), true)
        assert.equal(crdt2.isEqual(crdt1), true)
      })

      it('returns true for empty sets', () => {
        const crdt1 = new GSet()
        const crdt2 = new GSet()
        assert.equal(crdt1.isEqual(crdt2), true)
        assert.equal(crdt2.isEqual(crdt1), true)
      })

      it('returns false for sets with different values', () => {
        const crdt1 = new GSet()
        const crdt2 = new GSet()
        crdt1.add('A')
        crdt2.add('B')
        assert.equal(crdt1.isEqual(crdt2), false)
        assert.equal(crdt2.isEqual(crdt1), false)
      })
    })
  })
})

