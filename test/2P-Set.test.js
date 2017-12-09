'use strict'

const assert = require('assert')
const { GSet, TwoPSet } = require('../src')

describe('2P-Set', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a set', () => {
        const gset = new TwoPSet()
        assert.notEqual(gset, null)
        assert.notEqual(gset._added, null)
        assert.equal(gset._added instanceof GSet, true)
        assert.notEqual(gset._removed, null)
        assert.equal(gset._removed instanceof GSet, true)
      })

      it('is a GSet', () => {
        const gset = new TwoPSet()
        assert.notEqual(gset._values, null)
        assert.equal(gset._values instanceof Set, true)
      })

      it('creates a set from values', () => {
        const gset = new TwoPSet(['A', 'B'])
        assert.notEqual(gset, null)
        assert.equal(gset._added instanceof GSet, true)
        assert.deepEqual(new Set(gset._added.values), new Set(['B', 'A']))
      })
    })

    describe('values', () => {
      it('is an Iterator', () => {
        const gset = new TwoPSet()
        assert.equal(gset.values.toString(), '[object Set Iterator]')
      })

      it('returns an Iterator', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.add('B')
        const iterator = gset.values
        assert.equal(iterator.next().value, 'A')
        assert.equal(iterator.next().value, 'B')
      })
    })

    describe('add', () => {
      it('adds an element to the set', () => {
        const gset = new TwoPSet()
        gset.add('A')
        assert.deepEqual(new Set(gset.values), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        assert.deepEqual(new Set(gset.values), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        const gset = new TwoPSet()
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

      it('has internally a set for added elements', () => {
        const addedValues = ['A', 'B', 'C', 0, 1, 2, 3, 4]
        const removedValues = ['A', 1, 2, 3]
        const expectedResult = ['B', 'C', 0, 4]
        const gset = new TwoPSet(addedValues, removedValues)
        assert.equal(gset._added instanceof GSet, true)
        assert.deepEqual(new Set(gset._added.values), new Set(addedValues))
        assert.deepEqual(new Set(gset.values), new Set(expectedResult))
      })
    })

    describe('remove', () => {
      it('removes an element from the set', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.remove('A')
        assert.deepEqual(new Set(gset.values), new Set([]))
      })

      it('element can only be removed if it is present in the set', () => {
        const gset = new TwoPSet()
        gset.remove('A')
        gset.add('A')
        assert.deepEqual(new Set(gset._removed.values), new Set([]))
        assert.deepEqual(new Set(gset.values), new Set(['A']))
      })

      it('has internally a set for removed elements', () => {
        const addedValues = ['A', 'B', 'C', 0, 1, 2, 3, 4]
        const removedValues = ['A', 1, 2, 3]
        const expectedResult = ['B', 'C', 0, 4]
        const gset = new TwoPSet(addedValues, removedValues)
        assert.equal(gset._removed instanceof GSet, true)
        assert.deepEqual(new Set(gset._removed.values), new Set(removedValues))
        assert.deepEqual(new Set(gset.values), new Set(expectedResult))
      })

      it('adds removed elements to the internal removed set', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.add('B')
        gset.remove('A')
        gset.remove('B')
        gset.remove('A')
        const expectedResult = ['A', 'B']
        assert.deepEqual(new Set(gset._removed.values), new Set(expectedResult))
      })
    })

    describe('merge', () => {
      it('merges two sets with same id', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        gset1.add('A')
        gset2.add('B')
        gset2.add('C')
        gset2.add('D')
        gset2.remove('D')
        gset1.merge(gset2)
        assert.deepEqual(gset1.toArray(), ['A', 'B', 'C'])
      })

      it('merges two sets with same values', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        gset1.add('A')
        gset2.add('B')
        gset2.add('A')
        gset2.remove('B')
        gset1.merge(gset2)
        assert.deepEqual(gset1.toArray(), ['A'])
      })

      it('merges two sets with removed values', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        gset1.add('A')
        gset1.remove('A')
        gset2.remove('A')
        gset2.add('A')
        gset1.add('AAA')
        gset2.add('AAA')
        gset1.add('A')
        gset1.merge(gset2)
        assert.deepEqual(gset1.toArray(), ['AAA'])
      })

      it('merge four different sets', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        const gset3 = new TwoPSet()
        const gset4 = new TwoPSet()
        gset1.add('A')
        gset2.add('B')
        gset3.add('C')
        gset4.add('D')
        gset2.add('BB')
        gset2.remove('BB')

        gset1.merge(gset2)
        gset1.merge(gset3)
        gset1.remove('C')
        gset1.merge(gset4)

        assert.deepEqual(gset1.toArray(), ['A', 'B', 'D'])
      })

      it('doesn\'t overwrite other\'s values on merge', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        gset1.add('A')
        gset2.add('C')
        gset2.add('B')
        gset2.remove('C')
        gset1.merge(gset2)
        gset1.add('AA')
        gset2.add('CC')
        gset2.add('BB')
        gset2.remove('CC')
        gset1.merge(gset2)
        assert.deepEqual(gset1.toArray(), ['A', 'B', 'AA', 'BB'])
        assert.deepEqual(gset2.toArray(), ['B', 'BB'])
      })
    })

    describe('has', () => {
      it('returns true if given element is in the set', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.add('B')
        gset.add(1)
        gset.add(13)
        gset.remove(13)
        const obj = { hello: 'world' }
        gset.add(obj)
        assert.equal(gset.has('A'), true)
        assert.equal(gset.has('B'), true)
        assert.equal(gset.has(1), true)
        assert.equal(gset.has(13), false)
        assert.equal(gset.has(obj), true)
      })

      it('returns false if given element is not in the set', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.add('B')
        gset.add('nothere')
        gset.remove('nothere')
        assert.equal(gset.has('nothere'), false)
      })
    })

    describe('hasAll', () => {
      it('returns true if all given elements are in the set', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        gset.remove('C')
        gset.add('D')
        assert.equal(gset.hasAll(['D', 'A', 'B']), true)
      })

      it('returns false if any of the given elements are not in the set', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        gset.remove('C')
        gset.add('D')
        assert.equal(gset.hasAll(['D', 'A', 'C', 'B']), false)
      })
    })

    describe('toArray', () => {
      it('returns the values of the set as an Array', () => {
        const gset = new TwoPSet()
        const array = gset.toArray()
        assert.equal(Array.isArray(array), true)
      })

      it('returns values', () => {
        const gset = new TwoPSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        gset.remove('C')
        const array = gset.toArray()
        assert.equal(array.length, 2)
        assert.equal(array[0], 'A')
        assert.equal(array[1], 'B')
      })
    })

    describe('toJSON', () => {
      it('returns the set as JSON object', () => {
        const gset = new TwoPSet()
        gset.add('A')
        assert.equal(gset.toJSON().values.added.length, 1)
        assert.equal(gset.toJSON().values.added[0], 'A')
        assert.equal(gset.toJSON().values.removed.length, 0)
        gset.remove('A')
        assert.equal(gset.toJSON().values.removed.length, 1)
        assert.equal(gset.toJSON().values.removed[0], 'A')
      })

      it('returns a JSON object after a merge', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        gset1.add('A')
        gset2.add('B')
        gset2.remove('B')
        gset1.merge(gset2)
        gset2.merge(gset1)
        assert.equal(gset1.toJSON().values.added.length, 2)
        assert.equal(gset1.toJSON().values.added[0], 'A')
        assert.equal(gset1.toJSON().values.added[1], 'B')
        assert.equal(gset1.toJSON().values.removed.length, 1)
        assert.equal(gset1.toJSON().values.removed[0], 'B')
      })
    })

    describe('isEqual', () => {
      it('returns true for sets with same values', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        gset1.add('A')
        gset2.add('A')
        assert.equal(gset1.isEqual(gset2), true)
        assert.equal(gset2.isEqual(gset1), true)
      })

      it('returns true for empty sets', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        assert.equal(gset1.isEqual(gset2), true)
        assert.equal(gset2.isEqual(gset1), true)
      })

      it('returns false for sets with different values', () => {
        const gset1 = new TwoPSet()
        const gset2 = new TwoPSet()
        gset1.add('A')
        gset2.add('B')
        assert.equal(gset1.isEqual(gset2), false)
        assert.equal(gset2.isEqual(gset1), false)
      })
    })
  })
})

