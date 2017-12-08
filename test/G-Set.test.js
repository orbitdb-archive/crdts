'use strict'

const assert = require('assert')
const GSet = require('../src/G-Set.js')

describe('G-Set', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a set', () => {
        const gset = new GSet()
        assert.notEqual(gset, null)
        assert.notEqual(gset._added, null)
        assert.equal(gset._added instanceof Set, true)
      })

      it('creates a set from values', () => {
        const gset = new GSet(['A', 'B'])
        assert.notEqual(gset, null)
        assert.equal(gset._added instanceof Set, true)
        assert.deepEqual(gset._added, new Set(['B', 'A']))
      })
    })

    describe('values', () => {
      it('is an Iterator', () => {
        const gset = new GSet()
        assert.equal(gset.values.toString(), '[object Set Iterator]')
      })

      it('returns an Iterator', () => {
        const gset = new GSet()
        gset.add('A')
        gset.add('B')
        const iterator = gset.values
        assert.equal(iterator.next().value, 'A')
        assert.equal(iterator.next().value, 'B')
      })
    })

    describe('add', () => {
      it('adds an element to the set', () => {
        const gset = new GSet()
        gset.add('A')
        assert.deepEqual(new Set(gset.values), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        const gset = new GSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        assert.deepEqual(new Set(gset.values), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        const gset = new GSet()
        gset.add(1)
        gset.add('A')
        gset.add('A')
        gset.add(1)
        gset.add('A')
        const obj = { hello: 'ABC' }
        gset.add(obj)
        gset.add(obj)
        gset.add({ hello: 'ABCD' })

        const expectedResult = [
          'A',
          1,
          { hello: 'ABC' },
          { hello: 'ABCD' },
        ]

        assert.deepEqual(new Set(gset.values), new Set(expectedResult))
      })
    })

    describe('merge', () => {
      it('merges two sets with same id', () => {
        const gset1 = new GSet()
        const gset2 = new GSet()
        gset1.add('A')
        gset2.add('B')
        gset2.add('C')
        gset1.merge(gset2)
        assert.deepEqual(gset1.toArray(), ['A', 'B', 'C'])
      })

      it('merges two sets with same values', () => {
        const gset1 = new GSet()
        const gset2 = new GSet()
        gset1.add('A')
        gset2.add('A')
        gset1.merge(gset2)
        assert.deepEqual(gset1.toArray(), ['A'])
      })

      it('merge four different sets', () => {
        const gset1 = new GSet()
        const gset2 = new GSet()
        const gset3 = new GSet()
        const gset4 = new GSet()
        gset1.add('A')
        gset2.add('B')
        gset3.add('C')
        gset4.add('D')

        gset1.merge(gset2)
        gset1.merge(gset3)
        gset1.merge(gset4)

        assert.deepEqual(gset1.toArray(), ['A', 'B', 'C', 'D'])
      })

      it('doesn\'t overwrite other\'s values on merge', () => {
        const gset1 = new GSet()
        const gset2 = new GSet()
        gset1.add('A')
        gset2.add('B')
        gset1.merge(gset2)
        gset1.add('AA')
        gset2.add('BB')
        gset1.merge(gset2)
        assert.deepEqual(gset1.toArray(), ['A', 'B', 'AA', 'BB'])
        assert.deepEqual(gset2.toArray(), ['B', 'BB'])
      })
    })

    describe('has', () => {
      it('returns true if given element is in the set', () => {
        const gset = new GSet()
        gset.add('A')
        gset.add('B')
        gset.add(1)
        const obj = { hello: 'world' }
        gset.add(obj)
        assert.equal(gset.has('A'), true)
        assert.equal(gset.has('B'), true)
        assert.equal(gset.has(1), true)
        assert.equal(gset.has(obj), true)
      })

      it('returns false if given element is not in the set', () => {
        const gset = new GSet()
        gset.add('A')
        gset.add('B')
        assert.equal(gset.has('nothere'), false)
      })
    })

    describe('hasAll', () => {
      it('returns true if all given elements are in the set', () => {
        const gset = new GSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        gset.add('D')
        assert.equal(gset.hasAll(['D', 'A', 'C', 'B']), true)
      })

      it('returns false if any of the given elements are not in the set', () => {
        const gset = new GSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        gset.add('D')
        assert.equal(gset.hasAll(['D', 'A', 'C', 'B', 'nothere']), false)
      })
    })

    describe('toArray', () => {
      it('returns the values of the set as an Array', () => {
        const gset = new GSet()
        const array = gset.toArray()
        assert.equal(Array.isArray(array), true)
      })

      it('returns values', () => {
        const gset = new GSet()
        gset.add('A')
        gset.add('B')
        const array = gset.toArray()
        assert.equal(array[0], 'A')
        assert.equal(array[1], 'B')
      })
    })

    describe('toJSON', () => {
      it('returns the set as JSON object', () => {
        const gset = new GSet()
        gset.add('A')
        assert.equal(gset.toJSON().values.length, 1)
        assert.equal(gset.toJSON().values[0], 'A')
      })

      it('returns a JSON object after a merge', () => {
        const gset1 = new GSet()
        const gset2 = new GSet()
        gset1.add('A')
        gset2.add('B')
        gset1.merge(gset2)
        gset2.merge(gset1)
        assert.equal(gset1.toJSON().values.length, 2)
        assert.equal(gset1.toJSON().values[0], 'A')
        assert.equal(gset1.toJSON().values[1], 'B')
      })
    })

    describe('isEqual', () => {
      it('returns true for sets with same values', () => {
        const gset1 = new GSet()
        const gset2 = new GSet()
        gset1.add('A')
        gset2.add('A')
        assert.equal(gset1.isEqual(gset2), true)
        assert.equal(gset2.isEqual(gset1), true)
      })

      it('returns true for empty sets', () => {
        const gset1 = new GSet()
        const gset2 = new GSet()
        assert.equal(gset1.isEqual(gset2), true)
        assert.equal(gset2.isEqual(gset1), true)
      })

      it('returns false for sets with different values', () => {
        const gset1 = new GSet()
        const gset2 = new GSet()
        gset1.add('A')
        gset2.add('B')
        assert.equal(gset1.isEqual(gset2), false)
        assert.equal(gset2.isEqual(gset1), false)
      })
    })
  })

  describe('GSet.from', () => {
    it('creates a new G-Set from a JSON object', () => {
      const values = ['A', 'B', 'C']
      const input = {
        id: 'A',
        values: values,
      }

      const gset1 = new GSet(values)
      const gset2 = GSet.from(input)

      assert.deepEqual(new Set(gset2.values), new Set(values))
    })
  })

  describe('GSet.isEqual', () => {
    it('returns true if to GSets are equal', () => {
      const values = ['A', 'B', 'C']
      const gset1 = new GSet(values)
      const gset2 = new GSet(values)
      const gset3 = new GSet([0])
      assert.equal(GSet.isEqual(gset1, gset2), true)
      assert.equal(GSet.isEqual(gset1, gset3), false)
    })
  })

  describe('GSet.difference', () => {
    it('returns a Set of values from GSet A that are not in GSet B', () => {
      const values = ['A', 'B', 'C']
      const expectedDiff = ['D', 1]
      const gset1 = new GSet(values.concat(expectedDiff))
      const gset2 = new GSet(values)
      const gset3 = new GSet([0])
      assert.deepEqual(GSet.difference(gset1, gset2), new Set(expectedDiff))
      assert.deepEqual(GSet.difference(gset1, gset3), new Set(values.concat(expectedDiff)))
    })
  })
})

