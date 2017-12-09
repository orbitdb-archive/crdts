'use strict'

const assert = require('assert')
const LWWSet = require('../src/LWW-Set.js')
const GSet = require('../src/G-Set.js')
const LamportClock = require('./lamport-clock')

describe('LWW-Set', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a set', () => {
        const lwwset = new LWWSet()
        assert.notEqual(lwwset, null)
      })

      it('is a CmRDT Set', () => {
        const gset = new LWWSet()
        assert.notEqual(gset._operations, null)
        assert.equal(gset._operations instanceof Array, true)
      })
    })

    describe('values', () => {
      it('is an Iterator', () => {
        const lwwset = new LWWSet()
        assert.equal(lwwset.values.toString(), '[object Set Iterator]')
      })

      it('returns an Iterator', () => {
        const lwwset = new LWWSet()
        lwwset.add('A')
        lwwset.add('B')
        const iterator = lwwset.values
        assert.equal(iterator.next().value, 'A')
        assert.equal(iterator.next().value, 'B')
      })
    })

    describe('add', () => {
      it('adds an element to the set', () => {
        const lwwset = new LWWSet()
        const uid = new Date().getTime()
        lwwset.add('A', uid)
        lwwset.add('A', uid + 1)
        assert.deepEqual(new Set(lwwset.values), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        const lwwset = new LWWSet()
        lwwset.add('A')
        lwwset.add('B')
        lwwset.add('C')
        assert.deepEqual(new Set(lwwset.values), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        const lwwset = new LWWSet()
        lwwset.add(1)
        lwwset.add('A')
        lwwset.add('A')
        lwwset.add(1)
        lwwset.add('A')
        const obj = { hello: 'ABC' }
        lwwset.add(obj)
        lwwset.add(obj)
        lwwset.add({ hello: 'ABCD' })

        lwwset.add(9, 11111)

        const expectedResult = [
          'A',
          1,
          { hello: 'ABC' },
          { hello: 'ABCD' },
          9
        ]

        assert.deepEqual(new Set(lwwset.values), new Set(expectedResult))
      })
    })

    describe('add with Lamport Clocks', () => {
      it('adds an element to the set', () => {
        let uid = new LamportClock('A')
        const lwwset = new LWWSet(null, { compareFunc: LamportClock.compare })
        lwwset.add('A', uid)
        lwwset.add('A', uid.tick())
        assert.deepEqual(new Set(lwwset.values), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        let uid = new LamportClock('A')
        const lwwset = new LWWSet(null, { compareFunc: LamportClock.compare })
        lwwset.add('A', uid)
        lwwset.add('B', uid)
        lwwset.add('C', uid)
        assert.deepEqual(new Set(lwwset.values), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        let uid = new LamportClock('A')
        const lwwset = new LWWSet(null, { compareFunc: LamportClock.compare })
        lwwset.add(1, uid.tick())
        lwwset.add('A', uid.tick())
        lwwset.add('A', uid.tick())
        lwwset.add(1, uid.tick())
        lwwset.add('A', uid.tick())
        const obj = { hello: 'ABC' }
        lwwset.add(obj, uid.tick())
        lwwset.add(obj, uid)
        lwwset.add({ hello: 'ABCD' }, uid.tick())

        lwwset.add(9, uid)

        const expectedResult = [
          'A',
          1,
          { hello: 'ABC' },
          { hello: 'ABCD' },
          9
        ]

        assert.deepEqual(new Set(lwwset.values), new Set(expectedResult))
      })
    })

    describe('remove', () => {
      it('removes an element from the set', () => {
        let tag = 1
        const lwwset = new LWWSet()
        lwwset.add('A', tag)
        lwwset.remove('A', tag + 1)
        assert.deepEqual(new Set(lwwset.values), new Set([]))
      })

      it('removes an element from the set when element has multiple tags', () => {
        const lwwset = new LWWSet()
        lwwset.add('A', 1)
        lwwset.add('A', 2)
        lwwset.add('A', 3)
        lwwset.remove('A', 4)
        assert.deepEqual(new Set(lwwset.values), new Set([]))
      })

      it('doesn\'t remove an element from the set if uid was later than add', () => {
        const compareFunc = (a, b) => b - a
        const lwwset = new LWWSet()
        lwwset.add('A', 2)
        lwwset.remove('A', 1)
        assert.deepEqual(new Set(lwwset.values), new Set(['A']))
      })

      it('doesn\'t remove an element from the set if uid was later than add - custom compare function', () => {
        const compareFunc = (a, b) => a.time === 'bigger' ? 1 : -1
        const lwwset = new LWWSet(null, { compareFunc: compareFunc })
        lwwset.add('A', { time: 'bigger' })
        lwwset.remove('A', { time: 'smaller' })
        assert.deepEqual(new Set(lwwset.values), new Set(['A']))
      })

      it('removes an element from the set if all add tags are in removed tags', () => {
        const lwwset = new LWWSet()
        const uid = new Date().getTime()
        lwwset.add('A', uid)
        lwwset.remove('A', uid)
        lwwset.add('A', uid + 1)
        lwwset.add('A', uid + 2)
        lwwset.remove('A', uid + 3)
        assert.deepEqual(new Set(lwwset.values), new Set([]))
      })

      it('doesn\'t remove an element from the set if add and remove were concurrent', () => {
        const lwwset = new LWWSet()
        const uid = new Date().getTime()
        lwwset.remove('A', uid)
        lwwset.add('A', uid)
        assert.deepEqual(new Set(lwwset.values), new Set(['A']))
      })

      it('doesn\'t remove an element from the set if element wasn\'t in the set', () => {
        const lwwset = new LWWSet()
        const uid = new Date().getTime()
        lwwset.remove('A', uid - 1)
        lwwset.add('A', uid)
        assert.deepEqual(new Set(lwwset.values), new Set(['A']))
      })
    })

    describe('remove with Lamport Clocks', () => {
      it('removes an element from the set', () => {
        let tag = new LamportClock('A')
        const lwwset = new LWWSet(null, { compareFunc: LamportClock.compare })
        lwwset.add('A', tag)
        lwwset.remove('A', tag.tick())
        assert.deepEqual(new Set(lwwset.values), new Set([]))
      })

      it('removes an element from the set with the same tag', () => {
        let clock1 = new LamportClock('A')
        let clock2 = new LamportClock('A')
        const lwwset = new LWWSet(null, { compareFunc: LamportClock.compare })
        clock1 = clock1.tick()
        lwwset.add('A', clock1)
        clock2 = clock2.tick()
        lwwset.add('A', clock1)
        clock2 = clock2.tick()
        clock2 = clock2.tick()
        lwwset.remove('A', clock2)
        assert.deepEqual(new Set(lwwset.values), new Set([]))
      })
    })

    describe('merge', () => {
      it('merges two sets with same id', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        orset1.add('A')
        orset2.add('B')
        orset2.add('C')
        orset2.add('D', 33)
        orset2.remove('D', 34)
        orset1.merge(orset2)
        assert.deepEqual(orset1.toArray(), ['A', 'B', 'C'])
      })

      it('merges two sets with same values', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        orset1.add('A')
        orset2.add('B', 13)
        orset2.add('A')
        orset2.remove('B', 14)
        orset1.merge(orset2)
        assert.deepEqual(orset1.toArray(), ['A'])
      })

      it('merges two sets with removed values', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        orset1.add('A', 1)
        orset1.remove('A', 2)
        orset2.remove('A', 3)
        orset2.add('A', 4)
        orset1.add('AAA', 5)
        orset2.add('AAA', 6)
        orset1.add('A', 7)
        orset1.remove('A', 8)
        orset1.merge(orset2)
        assert.deepEqual(orset1.toArray(), ['AAA'])
      })

      it('merge four different sets', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        const orset3 = new LWWSet()
        const lwwset4 = new LWWSet()
        orset1.add('A', 1)
        orset2.add('B', 1)
        orset3.add('C', 1)
        lwwset4.add('D', 1)
        orset2.add('BB', 2)
        orset2.remove('BB', 3)

        orset1.merge(orset2)
        orset1.merge(orset3)
        orset1.remove('C', 2)
        orset1.merge(lwwset4)

        assert.deepEqual(orset1.toArray(), ['A', 'B', 'D'])
      })

      it('doesn\'t overwrite other\'s values on merge', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        orset1.add('A', 1)
        orset2.add('C', 1)
        orset2.add('B', 1)
        orset2.remove('C', 2)
        orset1.merge(orset2)
        orset1.add('AA', 3)
        orset2.add('CC', 3)
        orset2.add('BB', 3)
        orset2.remove('CC', 4)
        orset1.merge(orset2)
        assert.deepEqual(orset1.toArray(), ['A', 'B', 'AA', 'BB'])
        assert.deepEqual(orset2.toArray(), ['B', 'BB'])
      })
    })

    describe('has', () => {
      it('returns true if given element is in the set', () => {
        const lwwset = new LWWSet()
        lwwset.add('A')
        lwwset.add('B')
        lwwset.add(1)
        lwwset.add(13, 'A')
        lwwset.remove(13, 'B')
        const obj = { hello: 'world' }
        lwwset.add(obj)
        assert.equal(lwwset.has('A'), true)
        assert.equal(lwwset.has('B'), true)
        assert.equal(lwwset.has(1), true)
        assert.equal(lwwset.has(13), false)
        assert.equal(lwwset.has(obj), true)
      })

      it('returns false if given element is not in the set', () => {
        const lwwset = new LWWSet()
        lwwset.add('A')
        lwwset.add('B')
        lwwset.add('nothere', 666)
        lwwset.remove('nothere', 777)
        assert.equal(lwwset.has('nothere'), false)
      })
    })

    describe('hasAll', () => {
      it('returns true if all given elements are in the set', () => {
        const lwwset = new LWWSet()
        lwwset.add('A')
        lwwset.add('B')
        lwwset.add('C')
        lwwset.remove('C')
        lwwset.add('D')
        assert.equal(lwwset.hasAll(['D', 'A', 'B']), true)
      })

      it('returns false if any of the given elements are not in the set', () => {
        const lwwset = new LWWSet()
        lwwset.add('A')
        lwwset.add('B')
        lwwset.add('C', 1)
        lwwset.remove('C', 2)
        lwwset.add('D')
        assert.equal(lwwset.hasAll(['D', 'A', 'C', 'B']), false)
      })
    })

    describe('toArray', () => {
      it('returns the values of the set as an Array', () => {
        const lwwset = new LWWSet()
        const array = lwwset.toArray()
        assert.equal(Array.isArray(array), true)
      })

      it('returns values', () => {
        const lwwset = new LWWSet()
        lwwset.add('A')
        lwwset.add('B')
        lwwset.add('C', 1)
        lwwset.remove('C', 2)
        const array = lwwset.toArray()
        assert.equal(array.length, 2)
        assert.equal(array[0], 'A')
        assert.equal(array[1], 'B')
      })
    })

    describe('toJSON', () => {
      it('returns the set as JSON object', () => {
        const lwwset = new LWWSet()
        lwwset.add('A', 1)
        assert.equal(lwwset.toJSON().values.length, 1)
        assert.equal(lwwset.toJSON().values[0], 'A')
        lwwset.remove('A', 2)
        assert.equal(lwwset.toJSON().values.length, 0)
      })

      it('returns a JSON object after a merge', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        orset1.add('A', 1)
        orset2.add('B', 1)
        orset2.remove('B', 2)
        orset1.add('C', 3)
        orset1.merge(orset2)
        assert.equal(orset1.toJSON().values.length, 2)
        assert.equal(orset1.toJSON().values[0], 'A')
        assert.equal(orset1.toJSON().values[1], 'C')
      })
    })

    describe('isEqual', () => {
      it('returns true for sets with same values', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        orset1.add('A', 1)
        orset2.add('A', 1)
        assert.equal(orset1.isEqual(orset2), true)
        assert.equal(orset2.isEqual(orset1), true)
      })

      it('returns true for empty sets', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        assert.equal(orset1.isEqual(orset2), true)
        assert.equal(orset2.isEqual(orset1), true)
      })

      it('returns false for sets with different values', () => {
        const orset1 = new LWWSet()
        const orset2 = new LWWSet()
        orset1.add('A')
        orset2.add('B')
        assert.equal(orset1.isEqual(orset2), false)
        assert.equal(orset2.isEqual(orset1), false)
      })
    })
  })
})
