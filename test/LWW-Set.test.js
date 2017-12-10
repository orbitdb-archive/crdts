'use strict'

const assert = require('assert')
const { LWWSet, CmRDTSet } = require('../src')
const LamportClock = require('./lamport-clock')

describe('LWW-Set', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a set', () => {
        const crdt = new LWWSet()
        assert.notEqual(crdt, null)
      })

      it('is a CmRDT Set', () => {
        const gset = new LWWSet()
        assert.equal(gset instanceof CmRDTSet, true)
      })
    })

    describe('values', () => {
      it('is an Iterator', () => {
        const crdt = new LWWSet()
        assert.equal(crdt.values().toString(), '[object Set Iterator]')
      })

      it('returns an Iterator', () => {
        const crdt = new LWWSet()
        crdt.add('A')
        crdt.add('B')
        const iterator = crdt.values()
        assert.equal(iterator.next().value, 'A')
        assert.equal(iterator.next().value, 'B')
      })
    })

    describe('add', () => {
      it('adds an element to the set', () => {
        const crdt = new LWWSet()
        const uid = new Date().getTime()
        crdt.add('A', uid)
        crdt.add('A', uid + 1)
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        const crdt = new LWWSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        assert.deepEqual(new Set(crdt.values()), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        const crdt = new LWWSet()
        crdt.add(1)
        crdt.add('A')
        crdt.add('A')
        crdt.add(1)
        crdt.add('A')
        const obj = { hello: 'ABC' }
        crdt.add(obj)
        crdt.add(obj)
        crdt.add({ hello: 'ABCD' })

        crdt.add(9, 11111)

        const expectedResult = [
          'A',
          1,
          { hello: 'ABC' },
          { hello: 'ABCD' },
          9
        ]

        assert.deepEqual(new Set(crdt.values()), new Set(expectedResult))
      })
    })

    describe('add with Lamport Clocks', () => {
      it('adds an element to the set', () => {
        let uid = new LamportClock('A')
        const crdt = new LWWSet(null, { compareFunc: LamportClock.compare })
        crdt.add('A', uid)
        crdt.add('A', uid.tick())
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        let uid = new LamportClock('A')
        const crdt = new LWWSet(null, { compareFunc: LamportClock.compare })
        crdt.add('A', uid)
        crdt.add('B', uid)
        crdt.add('C', uid)
        assert.deepEqual(new Set(crdt.values()), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        let uid = new LamportClock('A')
        const crdt = new LWWSet(null, { compareFunc: LamportClock.compare })
        crdt.add(1, uid.tick())
        crdt.add('A', uid.tick())
        crdt.add('A', uid.tick())
        crdt.add(1, uid.tick())
        crdt.add('A', uid.tick())
        const obj = { hello: 'ABC' }
        crdt.add(obj, uid.tick())
        crdt.add(obj, uid)
        crdt.add({ hello: 'ABCD' }, uid.tick())

        crdt.add(9, uid)

        const expectedResult = [
          'A',
          1,
          { hello: 'ABC' },
          { hello: 'ABCD' },
          9
        ]

        assert.deepEqual(new Set(crdt.values()), new Set(expectedResult))
      })
    })

    describe('remove', () => {
      it('removes an element from the set', () => {
        let tag = 1
        const crdt = new LWWSet()
        crdt.add('A', tag)
        crdt.remove('A', tag + 1)
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('removes an element from the set when element has multiple tags', () => {
        const crdt = new LWWSet()
        crdt.add('A', 1)
        crdt.add('A', 2)
        crdt.add('A', 3)
        crdt.remove('A', 4)
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('doesn\'t remove an element from the set if uid was later than add', () => {
        const compareFunc = (a, b) => b - a
        const crdt = new LWWSet()
        crdt.add('A', 2)
        crdt.remove('A', 1)
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('doesn\'t remove an element from the set if uid was later than add - custom compare function', () => {
        const compareFunc = (a, b) => a.time === 'bigger' ? 1 : -1
        const crdt = new LWWSet(null, { compareFunc: compareFunc })
        crdt.add('A', { time: 'bigger' })
        crdt.remove('A', { time: 'smaller' })
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('removes an element from the set if all add tags are in removed tags', () => {
        const crdt = new LWWSet()
        const uid = new Date().getTime()
        crdt.add('A', uid)
        crdt.remove('A', uid)
        crdt.add('A', uid + 1)
        crdt.add('A', uid + 2)
        crdt.remove('A', uid + 3)
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('doesn\'t remove an element from the set if add and remove were concurrent', () => {
        const crdt = new LWWSet()
        const uid = new Date().getTime()
        crdt.remove('A', uid)
        crdt.add('A', uid)
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('doesn\'t remove an element from the set if element wasn\'t in the set', () => {
        const crdt = new LWWSet()
        const uid = new Date().getTime()
        crdt.remove('A', uid - 1)
        crdt.add('A', uid)
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })
    })

    describe('remove with Lamport Clocks', () => {
      it('removes an element from the set', () => {
        let tag = new LamportClock('A')
        const crdt = new LWWSet(null, { compareFunc: LamportClock.compare })
        crdt.add('A', tag)
        crdt.remove('A', tag.tick())
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('removes an element from the set with the same tag', () => {
        let clock1 = new LamportClock('A')
        let clock2 = new LamportClock('A')
        const crdt = new LWWSet(null, { compareFunc: LamportClock.compare })
        clock1 = clock1.tick()
        crdt.add('A', clock1)
        clock2 = clock2.tick()
        crdt.add('A', clock1)
        clock2 = clock2.tick()
        clock2 = clock2.tick()
        crdt.remove('A', clock2)
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })
    })

    describe('merge', () => {
      it('merges two sets with same id', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        lwwset1.add('A')
        lwwset2.add('B')
        lwwset2.add('C')
        lwwset2.add('D', 33)
        lwwset2.remove('D', 34)
        lwwset1.merge(lwwset2)
        assert.deepEqual(lwwset1.toArray(), ['A', 'B', 'C'])
      })

      it('merges two sets with same values', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        lwwset1.add('A')
        lwwset2.add('B', 13)
        lwwset2.add('A')
        lwwset2.remove('B', 14)
        lwwset1.merge(lwwset2)
        assert.deepEqual(lwwset1.toArray(), ['A'])
      })

      it('merges two sets with removed values', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        lwwset1.add('A', 1)
        lwwset1.remove('A', 2)
        lwwset2.remove('A', 3)
        lwwset2.add('A', 4)
        lwwset1.add('AAA', 5)
        lwwset2.add('AAA', 6)
        lwwset1.add('A', 7)
        lwwset1.remove('A', 8)
        lwwset1.merge(lwwset2)
        assert.deepEqual(lwwset1.toArray(), ['AAA'])
      })

      it('merge four different sets', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        const lwwset3 = new LWWSet()
        const lwwset4 = new LWWSet()
        lwwset1.add('A', 1)
        lwwset2.add('B', 1)
        lwwset3.add('C', 1)
        lwwset4.add('D', 1)
        lwwset2.add('BB', 2)
        lwwset2.remove('BB', 3)

        lwwset1.merge(lwwset2)
        lwwset1.merge(lwwset3)
        lwwset1.remove('C', 2)
        lwwset1.merge(lwwset4)

        assert.deepEqual(lwwset1.toArray(), ['A', 'B', 'D'])
      })

      it('doesn\'t overwrite other\'s values on merge', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        lwwset1.add('A', 1)
        lwwset2.add('C', 1)
        lwwset2.add('B', 1)
        lwwset2.remove('C', 2)
        lwwset1.merge(lwwset2)
        lwwset1.add('AA', 3)
        lwwset2.add('CC', 3)
        lwwset2.add('BB', 3)
        lwwset2.remove('CC', 4)
        lwwset1.merge(lwwset2)
        assert.deepEqual(lwwset1.toArray(), ['A', 'B', 'AA', 'BB'])
        assert.deepEqual(lwwset2.toArray(), ['B', 'BB'])
      })
    })

    describe('has', () => {
      it('returns true if given element is in the set', () => {
        const crdt = new LWWSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add(1)
        crdt.add(13, 'A')
        crdt.remove(13, 'B')
        const obj = { hello: 'world' }
        crdt.add(obj)
        assert.equal(crdt.has('A'), true)
        assert.equal(crdt.has('B'), true)
        assert.equal(crdt.has(1), true)
        assert.equal(crdt.has(13), false)
        assert.equal(crdt.has(obj), true)
      })

      it('returns false if given element is not in the set', () => {
        const crdt = new LWWSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('nothere', 666)
        crdt.remove('nothere', 777)
        assert.equal(crdt.has('nothere'), false)
      })
    })

    describe('hasAll', () => {
      it('returns true if all given elements are in the set', () => {
        const crdt = new LWWSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        crdt.remove('C')
        crdt.add('D')
        assert.equal(crdt.hasAll(['D', 'A', 'B']), true)
      })

      it('returns false if any of the given elements are not in the set', () => {
        const crdt = new LWWSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C', 1)
        crdt.remove('C', 2)
        crdt.add('D')
        assert.equal(crdt.hasAll(['D', 'A', 'C', 'B']), false)
      })
    })

    describe('toArray', () => {
      it('returns the values of the set as an Array', () => {
        const crdt = new LWWSet()
        const array = crdt.toArray()
        assert.equal(Array.isArray(array), true)
      })

      it('returns values', () => {
        const crdt = new LWWSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C', 1)
        crdt.remove('C', 2)
        const array = crdt.toArray()
        assert.equal(array.length, 2)
        assert.equal(array[0], 'A')
        assert.equal(array[1], 'B')
      })
    })

    describe('toJSON', () => {
      it('returns the set as JSON object', () => {
        const crdt = new LWWSet()
        crdt.add('A', 1)
        assert.equal(crdt.toJSON().values.length, 1)
        assert.equal(crdt.toJSON().values[0].value, 'A')
        assert.equal(crdt.toJSON().values[0].added[0], 1)
        crdt.remove('A', 2)
        assert.equal(crdt.toJSON().values.length, 1)
        assert.equal(crdt.toJSON().values[0].value, 'A')
        assert.equal(crdt.toJSON().values[0].removed[0], 2)
      })

      it('returns a JSON object after a merge', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        lwwset1.add('A', 1)
        lwwset2.add('B', 1)
        lwwset2.remove('B', 2)
        lwwset1.add('C', 3)
        lwwset1.merge(lwwset2)
        assert.equal(lwwset1.toJSON().values.length, 3)
        assert.equal(lwwset1.toJSON().values[0].value, 'A')
        assert.equal(lwwset1.toJSON().values[1].value, 'C')
        assert.equal(lwwset1.toJSON().values[2].value, 'B')
      })
    })

    describe('isEqual', () => {
      it('returns true for sets with same values', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        lwwset1.add('A', 1)
        lwwset2.add('A', 1)
        assert.equal(lwwset1.isEqual(lwwset2), true)
        assert.equal(lwwset2.isEqual(lwwset1), true)
      })

      it('returns true for empty sets', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        assert.equal(lwwset1.isEqual(lwwset2), true)
        assert.equal(lwwset2.isEqual(lwwset1), true)
      })

      it('returns false for sets with different values', () => {
        const lwwset1 = new LWWSet()
        const lwwset2 = new LWWSet()
        lwwset1.add('A')
        lwwset2.add('B')
        assert.equal(lwwset1.isEqual(lwwset2), false)
        assert.equal(lwwset2.isEqual(lwwset1), false)
      })
    })
  })
})
