'use strict'

const assert = require('assert')
const { ORSet, CmRDTSet } = require('../src')
const LamportClock = require('./lamport-clock')

describe('OR-Set', () => {
  describe('Instance', () => {
    describe('constructor', () => {
      it('creates a set', () => {
        const crdt = new ORSet()
        assert.notEqual(crdt, null)
      })

      it('is a CmRDT Set', () => {
        const crdt = new ORSet()
        assert.equal(crdt instanceof CmRDTSet, true)
      })
    })

    describe('values', () => {
      it('is an Iterator', () => {
        const crdt = new ORSet()
        assert.equal(crdt.values().toString(), '[object Set Iterator]')
      })

      it('returns an Iterator', () => {
        const crdt = new ORSet()
        crdt.add('A')
        crdt.add('B')
        const iterator = crdt.values()
        assert.equal(iterator.next().value, 'A')
        assert.equal(iterator.next().value, 'B')
      })
    })

    describe('add', () => {
      it('adds an element to the set', () => {
        const crdt = new ORSet()
        const uid = new Date().getTime()
        crdt.add('A', uid)
        crdt.add('A', uid + 1)
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        const crdt = new ORSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        assert.deepEqual(new Set(crdt.values()), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        const crdt = new ORSet()
        crdt.add(1)
        crdt.add('A')
        crdt.add('A')
        crdt.add(1)
        crdt.add('A')
        const obj = { hello: 'ABC' }
        crdt.add(obj)
        crdt.add(obj)
        crdt.add({ hello: 'ABCD' })

        crdt.add(9, 'ok')

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
        let clock = new LamportClock('A')
        const crdt = new ORSet(null, { compareFunc: LamportClock.isEqual })
        crdt.add('A', clock)
        crdt.add('A', clock.tick())
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('adds three elements to the set', () => {
        let uid = new LamportClock('A')
        const crdt = new ORSet(null, { compareFunc: LamportClock.isEqual })
        crdt.add('A', uid)
        crdt.add('B', uid)
        crdt.add('C', uid)
        assert.deepEqual(new Set(crdt.values()), new Set(['A', 'B', 'C']))
      })

      it('contains only unique values', () => {
        let uid = new LamportClock('A')
        const crdt = new ORSet(null, { compareFunc: LamportClock.isEqual })
        crdt.add(1, uid.tick())
        crdt.add('A', uid.tick())
        crdt.add('A', uid.tick())
        crdt.add(1, uid.tick())
        crdt.add('A', uid.tick())
        const obj = { hello: 'ABC' }
        crdt.add(obj, uid.tick())
        crdt.add(obj, uid)
        crdt.add({ hello: 'ABCD' }, uid.tick())

        crdt.add(9, 'ok')

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
        const crdt = new ORSet()
        crdt.add('A', tag)
        crdt.remove('A', tag)
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('removes an element from the set when element has multiple tags', () => {
        const crdt = new ORSet()
        crdt.add('A', 1)
        crdt.add('A', 2)
        crdt.add('A', 3)
        crdt.remove('A')
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('removes an element from the set if all add tags are in removed tags', () => {
        const crdt = new ORSet()
        const uid = new Date().getTime()
        crdt.add('A', uid)
        crdt.remove('A')
        crdt.add('A', uid + 1)
        crdt.add('A', uid + 2)
        crdt.remove('A')
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('doesn\'t remove an element from the set if element wasn\'t in the set', () => {
        const crdt = new ORSet()
        const uid = new Date().getTime()
        crdt.remove('A')
        crdt.add('A', uid)
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })
    })

    describe('remove with Lamport Clocks', () => {
      it('removes an element from the set', () => {
        let clock = new LamportClock('A')
        const crdt = new ORSet(null, { compareFunc: LamportClock.isEqual })
        crdt.add('A', clock)
        clock = clock.tick()
        crdt.remove('A')
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('doesn\'t remove an element from the set if element was added with a new tag', () => {
        const crdt = new ORSet()
        const clock1 = new LamportClock('A')
        const clock2 = new LamportClock('B')
        crdt.add('A', clock1)
        crdt.remove('A')
        crdt.add('A', clock1.tick())
        assert.deepEqual(new Set(crdt.values()), new Set(['A']))
      })

      it('removes an element from the set with the same tag', () => {
        let clock1 = new LamportClock('A')
        let clock2 = new LamportClock('A')
        const crdt = new ORSet(null, { compareFunc: LamportClock.isEqual })
        clock1 = clock1.tick()
        crdt.add('A', clock1)
        clock2 = clock2.tick()
        crdt.add('A', clock1)
        crdt.remove('A')
        assert.deepEqual(new Set(crdt.values()), new Set([]))
      })

      it('doesn\'t remove an element from the set if element was added with different tags', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        const clock1 = new LamportClock('A')
        const clock2 = new LamportClock('B')
        crdt1.add('A', clock1)
        crdt1.remove('A')
        crdt2.add('A', clock2)
        crdt2.remove('A')
        assert.deepEqual(new Set(crdt1.values()), new Set([]))
        assert.deepEqual(new Set(crdt2.values()), new Set([]))

        crdt1.merge(crdt2)
        assert.deepEqual(new Set(crdt1.values()), new Set([]))
 
        crdt1.add('A', clock1.tick())
        assert.deepEqual(new Set(crdt1.values()), new Set(['A']))
 
        crdt2.merge(crdt1)
        assert.deepEqual(new Set(crdt2.values()), new Set(['A']))
      })

      it('doesn\'t remove an element from the set if not all add tags are observed', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        const clock1 = new LamportClock('A')
        const clock2 = new LamportClock('B')
        crdt1.add('A', clock1)
        crdt2.add('A', clock2)
        crdt2.remove('A')
        assert.deepEqual(new Set(crdt1.values()), new Set(['A']))
        assert.deepEqual(new Set(crdt2.values()), new Set([]))

        crdt2.merge(crdt1)
        assert.deepEqual(new Set(crdt1.values()), new Set(['A']))
      })
    })

    describe('merge', () => {
      it('merges two sets with same id', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        crdt1.add('A')
        crdt2.add('B')
        crdt2.add('C')
        crdt2.add('D')
        crdt2.remove('D')
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'C'])
      })

      it('merges two sets with same values', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        crdt1.add('A')
        crdt2.add('B', 13)
        crdt2.add('A')
        crdt2.remove('B', 13)
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A'])
      })

      it('merges two sets with removed values', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        crdt1.add('A', 1)
        crdt1.remove('A', 1)
        crdt2.add('A', 1)
        crdt2.remove('A', 2)
        crdt1.add('AAA')
        crdt2.add('AAA')
        crdt1.add('A', 1)
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['AAA'])
      })

      it('merge four different sets', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        const orset3 = new ORSet()
        const crdt4 = new ORSet()
        crdt1.add('A')
        crdt2.add('B')
        orset3.add('C', 7)
        crdt4.add('D')
        crdt2.add('BB', 1)
        crdt2.remove('BB', 1)

        crdt1.merge(crdt2)
        crdt1.merge(orset3)
        crdt1.remove('C', 8)
        crdt1.merge(crdt4)

        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'D'])
      })

      it('doesn\'t overwrite other\'s values on merge', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        crdt1.add('A')
        crdt2.add('C')
        crdt2.add('B')
        crdt2.remove('C')
        crdt1.merge(crdt2)
        crdt1.add('AA')
        crdt2.add('CC', 1)
        crdt2.add('BB')
        crdt2.remove('CC', 1)
        crdt1.merge(crdt2)
        assert.deepEqual(crdt1.toArray(), ['A', 'B', 'AA', 'BB'])
        assert.deepEqual(crdt2.toArray(), ['B', 'BB'])
      })
    })

    describe('has', () => {
      it('returns true if given element is in the set', () => {
        const crdt = new ORSet()
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
        const crdt = new ORSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('nothere')
        crdt.remove('nothere')
        assert.equal(crdt.has('nothere'), false)
      })
    })

    describe('hasAll', () => {
      it('returns true if all given elements are in the set', () => {
        const crdt = new ORSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C')
        crdt.remove('C')
        crdt.add('D')
        assert.equal(crdt.hasAll(['D', 'A', 'B']), true)
      })

      it('returns false if any of the given elements are not in the set', () => {
        const crdt = new ORSet()
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
        const crdt = new ORSet()
        const array = crdt.toArray()
        assert.equal(Array.isArray(array), true)
      })

      it('returns values', () => {
        const crdt = new ORSet()
        crdt.add('A')
        crdt.add('B')
        crdt.add('C', 1)
        crdt.remove('C', 1)
        const array = crdt.toArray()
        assert.equal(array.length, 2)
        assert.equal(array[0], 'A')
        assert.equal(array[1], 'B')
      })
    })

    describe('toJSON', () => {
      it('returns the set as JSON object', () => {
        const crdt = new ORSet()
        crdt.add('A', 1)
        assert.equal(crdt.toJSON().values.length, 1)
        assert.equal(crdt.toJSON().values[0].added.length, 1)
        assert.equal(crdt.toJSON().values[0].value, 'A')
        crdt.remove('A', 1)
        assert.equal(crdt.toJSON().values.length, 1)
        assert.equal(crdt.toJSON().values[0].removed.length, 1)
        assert.equal(crdt.toJSON().values[0].value, 'A')
      })

      it('returns a JSON object after a merge', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        crdt1.add('A')
        crdt2.add('B', 1)
        crdt2.remove('B', 1)
        crdt1.add('C')
        crdt1.merge(crdt2)
        crdt2.merge(crdt1)
        assert.equal(crdt1.toJSON().values.length, 3)
        assert.equal(crdt1.toJSON().values[0].value, 'A')
        assert.equal(crdt1.toJSON().values[1].value, 'C')
        assert.equal(crdt1.toJSON().values[2].value, 'B')
        assert.equal(crdt1.toJSON().values[2].added.length, 1)
        assert.equal(crdt1.toJSON().values[2].removed.length, 1)
      })
    })

    describe('isEqual', () => {
      it('returns true for sets with same values', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        crdt1.add('A')
        crdt2.add('A')
        assert.equal(crdt1.isEqual(crdt2), true)
        assert.equal(crdt2.isEqual(crdt1), true)
      })

      it('returns true for empty sets', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        assert.equal(crdt1.isEqual(crdt2), true)
        assert.equal(crdt2.isEqual(crdt1), true)
      })

      it('returns false for sets with different values', () => {
        const crdt1 = new ORSet()
        const crdt2 = new ORSet()
        crdt1.add('A')
        crdt2.add('B')
        assert.equal(crdt1.isEqual(crdt2), false)
        assert.equal(crdt2.isEqual(crdt1), false)
      })
    })
  })
})
