'use strict'

const assert = require('assert')
const { ORSet, GSet } = require('../index.js')
const LamportClock = require('./lamport-clock')

describe('OR-Set', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a set', () => {
        const gset = new ORSet()
        assert.notEqual(gset, null)
      })

      it('is a CmRDT Set', () => {
        const gset = new ORSet()
        assert.notEqual(gset._operations, null)
        assert.equal(gset._operations instanceof Array, true)
      })
    })

    describe('values', () => {
      it('is an Iterator', () => {
        const gset = new ORSet()
        assert.equal(gset.values.toString(), '[object Set Iterator]')
      })

      it('returns an Iterator', () => {
        const gset = new ORSet()
        gset.add('A')
        gset.add('B')
        const iterator = gset.values
        assert.equal(iterator.next().value, 'A')
        assert.equal(iterator.next().value, 'B')
      })
    })

    describe('add', () => {
      it('adds an element to the set', () => {
        const gset = new ORSet()
        const uid = new Date().getTime()
        gset.add('A', uid)
        gset.add('A', uid + 1)
        assert.deepEqual(new Set(gset.values), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        const gset = new ORSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        assert.deepEqual(new Set(gset.values), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        const gset = new ORSet()
        gset.add(1)
        gset.add('A')
        gset.add('A')
        gset.add(1)
        gset.add('A')
        const obj = { hello: 'ABC' }
        gset.add(obj)
        gset.add(obj)
        gset.add({ hello: 'ABCD' })

        gset.add(9, 'ok')

        const expectedResult = [
          'A',
          1,
          { hello: 'ABC' },
          { hello: 'ABCD' },
          9
        ]

        assert.deepEqual(new Set(gset.values), new Set(expectedResult))
      })
    })

    describe('add with Lamport Clocks', () => {
      it('adds an element to the set', () => {
        let uid = new LamportClock('A')
        const gset = new ORSet(null, { compareFunc: LamportClock.compare })
        gset.add('A', uid)
        gset.add('A', uid.tick())
        assert.deepEqual(new Set(gset.values), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        let uid = new LamportClock('A')
        const gset = new ORSet(null, { compareFunc: LamportClock.compare })
        gset.add('A', uid)
        gset.add('B', uid)
        gset.add('C', uid)
        assert.deepEqual(new Set(gset.values), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        let uid = new LamportClock('A')
        const gset = new ORSet(null, { compareFunc: LamportClock.compare })
        gset.add(1, uid.tick())
        gset.add('A', uid.tick())
        gset.add('A', uid.tick())
        gset.add(1, uid.tick())
        gset.add('A', uid.tick())
        const obj = { hello: 'ABC' }
        gset.add(obj, uid.tick())
        gset.add(obj, uid)
        gset.add({ hello: 'ABCD' }, uid.tick())

        gset.add(9, 'ok')

        const expectedResult = [
          'A',
          1,
          { hello: 'ABC' },
          { hello: 'ABCD' },
          9
        ]

        assert.deepEqual(new Set(gset.values), new Set(expectedResult))
      })
    })

    describe('remove', () => {
      it('removes an element from the set', () => {
        let tag = 1
        const gset = new ORSet()
        gset.add('A', tag)
        gset.remove('A', tag)
        assert.deepEqual(new Set(gset.values), new Set([]))
      })

      it('removes an element from the set when element has multiple tags', () => {
        const gset = new ORSet()
        gset.add('A', 1)
        gset.add('A', 2)
        gset.add('A', 3)
        gset.remove('A')
        assert.deepEqual(new Set(gset.values), new Set([]))
      })

      it('removes an element from the set if all add tags are in removed tags', () => {
        const gset = new ORSet()
        const uid = new Date().getTime()
        gset.add('A', uid)
        gset.remove('A')
        gset.add('A', uid + 1)
        gset.add('A', uid + 2)
        gset.remove('A')
        assert.deepEqual(new Set(gset.values), new Set([]))
      })

      it('doesn\'t remove an element from the set if element wasn\'t in the set', () => {
        const gset = new ORSet()
        const uid = new Date().getTime()
        gset.remove('A')
        gset.add('A', uid)
        assert.deepEqual(new Set(gset.values), new Set(['A']))
      })
    })

    describe('remove with Lamport Clocks', () => {
      it('removes an element from the set', () => {
        let tag = new LamportClock('A')
        const gset = new ORSet(null, { compareFunc: LamportClock.compare })
        gset.add('A', tag)
        gset.remove('A')
        assert.deepEqual(new Set(gset.values), new Set([]))
      })

      it('removes an element from the set with the same tag', () => {
        let clock1 = new LamportClock('A')
        let clock2 = new LamportClock('A')
        const gset = new ORSet(null, { compareFunc: LamportClock.compare })
        clock1 = clock1.tick()
        gset.add('A', clock1)
        clock2 = clock2.tick()
        gset.add('A', clock1)
        gset.remove('A')
        assert.deepEqual(new Set(gset.values), new Set([]))
      })
    })

    describe('merge', () => {
      it('merges two sets with same id', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        orset1.add('A')
        orset2.add('B')
        orset2.add('C')
        orset2.add('D')
        orset2.remove('D')
        orset1.merge(orset2)
        assert.deepEqual(orset1.toArray(), ['A', 'B', 'C'])
      })

      it('merges two sets with same values', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        orset1.add('A')
        orset2.add('B', 13)
        orset2.add('A')
        orset2.remove('B', 13)
        orset1.merge(orset2)
        assert.deepEqual(orset1.toArray(), ['A'])
      })

      it('merges two sets with removed values', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        orset1.add('A', 1)
        orset1.remove('A', 1)
        orset2.add('A', 1)
        orset2.remove('A', 2)
        orset1.add('AAA')
        orset2.add('AAA')
        orset1.add('A', 1)
        orset1.merge(orset2)
        assert.deepEqual(orset1.toArray(), ['AAA'])
      })

      it('merge four different sets', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        const orset3 = new ORSet()
        const gset4 = new ORSet()
        orset1.add('A')
        orset2.add('B')
        orset3.add('C', 7)
        gset4.add('D')
        orset2.add('BB', 1)
        orset2.remove('BB', 1)

        orset1.merge(orset2)
        orset1.merge(orset3)
        orset1.remove('C', 8)
        orset1.merge(gset4)

        assert.deepEqual(orset1.toArray(), ['A', 'B', 'D'])
      })

      it('doesn\'t overwrite other\'s values on merge', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        orset1.add('A')
        orset2.add('C')
        orset2.add('B')
        orset2.remove('C')
        orset1.merge(orset2)
        orset1.add('AA')
        orset2.add('CC', 1)
        orset2.add('BB')
        orset2.remove('CC', 1)
        orset1.merge(orset2)
        assert.deepEqual(orset1.toArray(), ['A', 'B', 'AA', 'BB'])
        assert.deepEqual(orset2.toArray(), ['B', 'BB'])
      })
    })

    describe('has', () => {
      it('returns true if given element is in the set', () => {
        const gset = new ORSet()
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
        const gset = new ORSet()
        gset.add('A')
        gset.add('B')
        gset.add('nothere')
        gset.remove('nothere')
        assert.equal(gset.has('nothere'), false)
      })
    })

    describe('hasAll', () => {
      it('returns true if all given elements are in the set', () => {
        const gset = new ORSet()
        gset.add('A')
        gset.add('B')
        gset.add('C')
        gset.remove('C')
        gset.add('D')
        assert.equal(gset.hasAll(['D', 'A', 'B']), true)
      })

      it('returns false if any of the given elements are not in the set', () => {
        const gset = new ORSet()
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
        const gset = new ORSet()
        const array = gset.toArray()
        assert.equal(Array.isArray(array), true)
      })

      it('returns values', () => {
        const gset = new ORSet()
        gset.add('A')
        gset.add('B')
        gset.add('C', 1)
        gset.remove('C', 1)
        const array = gset.toArray()
        assert.equal(array.length, 2)
        assert.equal(array[0], 'A')
        assert.equal(array[1], 'B')
      })
    })

    describe('toJSON', () => {
      it('returns the set as JSON object', () => {
        const gset = new ORSet()
        gset.add('A', 1)
        assert.equal(gset.toJSON().values.length, 1)
        assert.equal(gset.toJSON().values[0], 'A')
        gset.remove('A', 1)
        assert.equal(gset.toJSON().values.length, 0)
      })

      it('returns a JSON object after a merge', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        orset1.add('A')
        orset2.add('B', 1)
        orset2.remove('B', 1)
        orset1.add('C')
        orset1.merge(orset2)
        orset2.merge(orset1)
        assert.equal(orset1.toJSON().values.length, 2)
        assert.equal(orset1.toJSON().values[0], 'A')
        assert.equal(orset1.toJSON().values[1], 'C')
      })
    })

    describe('isEqual', () => {
      it('returns true for sets with same values', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        orset1.add('A')
        orset2.add('A')
        assert.equal(orset1.isEqual(orset2), true)
        assert.equal(orset2.isEqual(orset1), true)
      })

      it('returns true for empty sets', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        assert.equal(orset1.isEqual(orset2), true)
        assert.equal(orset2.isEqual(orset1), true)
      })

      it('returns false for sets with different values', () => {
        const orset1 = new ORSet()
        const orset2 = new ORSet()
        orset1.add('A')
        orset2.add('B')
        assert.equal(orset1.isEqual(orset2), false)
        assert.equal(orset2.isEqual(orset1), false)
      })
    })
  })
})
