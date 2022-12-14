import assert from 'assert'
import { TwoPSet, GSet, CmRDTSet } from '../src/index.js'

describe('2P-Set', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a set', () => {
        const crdt = new TwoPSet()
        assert.notEqual(crdt, null)
      })

      it('has two GSets', () => {
        const crdt = new TwoPSet()
        assert.notEqual(crdt._added, null)
        assert.equal(crdt._added instanceof GSet, true)
        assert.notEqual(crdt._removed, null)
        assert.equal(crdt._removed instanceof GSet, true)
      })

      it('is a CmRDT Set', () => {
        const crdt = new TwoPSet()
        assert.equal(crdt instanceof CmRDTSet, true)
      })

      it('creates a set from values', () => {
        const crdt = new TwoPSet(['A', 'B'])
        assert.notEqual(crdt, null)
        assert.equal(crdt._added instanceof GSet, true)
        assert.deepEqual(new Set(crdt._added.values()), new Set(['B', 'A']))
      })
    })

    describe('values', () => {
      it('is an Iterator', () => {
        const crdt = new TwoPSet()
        assert.equal(crdt.values().toString(), '[object Set Iterator]')
      })

      it('returns an Iterator', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.add('B')
        const iterator = crdt.values()
        assert.equal(iterator.next().value, 'A')
        assert.equal(iterator.next().value, 'B')
      })
    })

    describe('add', () => {
      it('adds an element to the set', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        assert.deepEqual(new Set(crdt.values()), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        const crdt = new TwoPSet()
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

      it('has internally a set for added elements', () => {
        const addedValues = ['A', 'B', 'C', 0, 1, 2, 3, 4]
        const removedValues = ['A', 1, 2, 3]
        const expectedResult = ['B', 'C', 0, 4]
        const crdt = new TwoPSet(addedValues, removedValues)
        assert.equal(crdt._added instanceof GSet, true)
        assert.deepEqual(new Set(crdt._added.values()), new Set(addedValues))
        assert.deepEqual(new Set(crdt.values()), new Set(expectedResult))
      })
    })

    describe('remove', () => {
      it('removes an element from the set', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.remove('A')
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('element can only be removed if it is present in the set', () => {
        const crdt = new TwoPSet()
        crdt.remove('A')
        crdt.add('A')
        assert.deepEqual(new Set(crdt._removed.values()), new Set([]))
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('has internally a set for removed elements', () => {
        const addedValues = ['A', 'B', 'C', 0, 1, 2, 3, 4]
        const removedValues = ['A', 1, 2, 3]
        const expectedResult = ['B', 'C', 0, 4]
        const crdt = new TwoPSet(addedValues, removedValues)
        assert.equal(crdt._removed instanceof GSet, true)
        assert.deepEqual(new Set(crdt._removed.values()), new Set(removedValues))
        assert.deepEqual(new Set(crdt.values()), new Set(expectedResult))
      })

      it('adds removed elements to the internal removed set', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.add('B')
        crdt.remove('A')
        crdt.remove('B')
        crdt.remove('A')
        const expectedResult = ['A', 'B']
        assert.deepEqual(new Set(crdt._removed.values()), new Set(expectedResult))
      })
    })

    describe('merge', () => {
      it('merges two sets with same id', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt2.add('C')
        crdt2.add('D')
        crdt2.remove('D')
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'C'])
      })

      it('merges two sets with same values', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt2.add('A')
        crdt2.remove('B')
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A'])
      })

      it('merges two sets with removed values', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        crdt1.add('A')
        crdt1.remove('A')
        crdt2.remove('A')
        crdt2.add('A')
        crdt1.add('AAA')
        crdt2.add('AAA')
        crdt1.add('A')
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['AAA'])
      })

      it('merge four different sets', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        const crdt3 = new TwoPSet()
        const crdt4 = new TwoPSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt3.add('C')
        crdt4.add('D')
        crdt2.add('BB')
        crdt2.remove('BB')

        crdt1.merge(crdt2)
        crdt1.merge(crdt3)
        crdt1.remove('C')
        crdt1.merge(crdt4)

        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'D'])
      })

      it('doesn\'t overwrite other\'s values on merge', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        crdt1.add('A')
        crdt2.add('C')
        crdt2.add('B')
        crdt2.remove('C')
        crdt1.merge(crdt2)
        crdt1.add('AA')
        crdt2.add('CC')
        crdt2.add('BB')
        crdt2.remove('CC')
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'AA', 'BB'])
        assert.deepEqual(crdt2.toArray(), ['B', 'BB'])
      })
    })

    describe('has', () => {
      it('returns true if given element is in the set', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add(1)
        crdt.add(13)
        crdt.remove(13)
        const obj = { hello: 'world' }
        crdt.add(obj)
        assert.equal(crdt.has('A'), true)
        assert.equal(crdt.has('B'), true)
        assert.equal(crdt.has(1), true)
        assert.equal(crdt.has(13), false)
        assert.equal(crdt.has(obj), true)
      })

      it('returns false if given element is not in the set', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('nothere')
        crdt.remove('nothere')
        assert.equal(crdt.has('nothere'), false)
      })
    })

    describe('hasAll', () => {
      it('returns true if all given elements are in the set', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        crdt.remove('C')
        crdt.add('D')
        assert.equal(crdt.hasAll(['D', 'A', 'B']), true)
      })

      it('returns false if any of the given elements are not in the set', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        crdt.remove('C')
        crdt.add('D')
        assert.equal(crdt.hasAll(['D', 'A', 'C', 'B']), false)
      })
    })

    describe('toArray', () => {
      it('returns the values of the set as an Array', () => {
        const crdt = new TwoPSet()
        const array = crdt.toArray()
        assert.equal(Array.isArray(array), true)
      })

      it('returns values', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        crdt.remove('C')
        const array = crdt.toArray()
        assert.equal(array.length, 2)
        assert.equal(array[0], 'A')
        assert.equal(array[1], 'B')
      })
    })

    describe('toJSON', () => {
      it('returns the set as JSON object', () => {
        const crdt = new TwoPSet()
        crdt.add('A')
        assert.equal(crdt.toJSON().values.added.length, 1)
        assert.equal(crdt.toJSON().values.added[0], 'A')
        assert.equal(crdt.toJSON().values.removed.length, 0)
        crdt.remove('A')
        assert.equal(crdt.toJSON().values.removed.length, 1)
        assert.equal(crdt.toJSON().values.removed[0], 'A')
      })

      it('returns a JSON object after a merge', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt2.remove('B')
        crdt1.merge(crdt2)
        crdt2.merge(crdt1)
        assert.equal(crdt1.toJSON().values.added.length, 2)
        assert.equal(crdt1.toJSON().values.added[0], 'A')
        assert.equal(crdt1.toJSON().values.added[1], 'B')
        assert.equal(crdt1.toJSON().values.removed.length, 1)
        assert.equal(crdt1.toJSON().values.removed[0], 'B')
      })
    })

    describe('isEqual', () => {
      it('returns true for sets with same values', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        crdt1.add('A')
        crdt2.add('A')
        assert.equal(crdt1.isEqual(crdt2), true)
        assert.equal(crdt2.isEqual(crdt1), true)
      })

      it('returns true for empty sets', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        assert.equal(crdt1.isEqual(crdt2), true)
        assert.equal(crdt2.isEqual(crdt1), true)
      })

      it('returns false for sets with different values', () => {
        const crdt1 = new TwoPSet()
        const crdt2 = new TwoPSet()
        crdt1.add('A')
        crdt2.add('B')
        assert.equal(crdt1.isEqual(crdt2), false)
        assert.equal(crdt2.isEqual(crdt1), false)
      })
    })
  })
})
