'use strict';

const assert  = require('assert');
const Counter = require('../src/GCounter.js');

describe('G-Counter', () => {
  describe('constructor', () => {
    it('creates a counter', (done) => {
      const counter = new Counter('A');
      assert(counter, null);
      assert.notEqual(counter.id, null);
      assert.notEqual(counter._counters, null);
      assert.equal(counter._counters['A'], 0);
      done();
    });
  });

  describe('payload', () => {
    it('returns the payload', (done) => {
      const counter = new Counter('A');
      assert.equal(counter.payload.id, 'A');
      assert.equal(counter.payload.counters.A, 0);
      done();
    });
  });

  describe('increment', () => {
    it('increments the count by 1', (done) => {
      const counter = new Counter('A');
      counter.increment();
      assert.equal(counter.value, 1);
      done();
    });

    it('increments the count by 2', (done) => {
      const counter = new Counter('A');
      counter.increment();
      counter.increment();
      assert.equal(counter.value, 2);
      done();
    });

    it('increments the count by 3', (done) => {
      const counter = new Counter('A');
      counter.increment(3);
      assert.equal(counter.value, 3);
      done();
    });

    it('increments the count by 42', (done) => {
      const counter = new Counter('A');
      counter.increment();
      counter.increment(42);
      assert.equal(counter.value, 43);
      done();
    });
  });

  describe('value', () => {
    it('returns the count', (done) => {
      const counter = new Counter('A');
      assert.equal(counter.value, 0);
      done();
    });
  });

  describe('serialization', () => {
    it('returns the payload', (done) => {
      const counter = new Counter('A');
      counter.increment();
      assert.equal(Object.keys(counter.payload.counters).length, 1);
      assert.equal(counter.payload.counters.A, 1);
      done();
    });

    it('returns the payload after a merge', (done) => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('B');
      counter1.increment();
      counter2.increment();
      counter1.merge(counter2);
      counter2.merge(counter1);
      assert.equal(Object.keys(counter1.payload.counters).length, 2);
      assert.equal(counter1.payload.counters.A, 1);
      assert.equal(counter1.payload.counters.B, 1);
      assert.equal(counter2.payload.counters.A, 1);
      assert.equal(counter2.payload.counters.B, 1);
      done();
    });

    it('creates a new counter from a serialized counter', () => {
      const counter1 = new Counter('A');
      counter1.increment();
      const data = counter1.payload;
      const counter2 = Counter.from(counter1.payload);
      assert.equal(counter2.id, 'A');
      assert.equal(counter2.value, 1);
    });
  });

  describe('compare', () => {
    it('returns true for equal counters', (done) => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('A');
      counter1.increment();
      counter2.increment();
      assert.equal(counter1.compare(counter2), true);
      done();
    });

    it('returns false for unequal counters - different id', (done) => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('B');
      assert.equal(counter1.compare(counter2), false);
      done();
    });

    it('returns false for unequal counters - same id, different counts', (done) => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('A');
      counter1.increment();
      counter2.increment();
      counter2.increment();
      assert.equal(counter1.compare(counter2), false);
      done();
    });
  });

  describe('merge', () => {
    it('merges with itself', (done) => {
      const counter = new Counter('A');
      counter.increment();
      counter.merge(counter);
      assert.equal(counter.value, 1);
      done();
    });

    it('merges two counters with same id', (done) => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('A');
      counter1.increment();
      counter2.increment();
      counter1.merge(counter2);
      assert.equal(counter1.value, 1);
      done();
    });

    it('merges two counters', (done) => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('B');
      counter1.increment();
      counter2.increment();
      counter1.merge(counter2);
      counter2.merge(counter1);
      assert.equal(counter1.value, 2);
      assert.equal(counter2.value, 2);
      done();
    });

    it('merges four counters', (done) => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('B');
      const counter3 = new Counter('C');
      const counter4 = new Counter('D');
      counter1.increment();
      counter2.increment();
      counter3.increment();
      counter4.increment();
      counter1.merge(counter2);
      counter1.merge(counter3);
      counter1.merge(counter4);
      assert.equal(counter1.value, 4);
      done();
    });

    it('doesn\'t overwrite its own value on merge', () => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('B');
      counter1.increment();
      counter2.increment();
      counter1.merge(counter2);
      counter2.merge(counter1);
      counter1.increment();
      counter1.merge(counter2);
      assert.equal(counter1.value, 3);
    });

    it('doesn\'t overwrite others\' values on merge', () => {
      const counter1 = new Counter('A');
      const counter2 = new Counter('B');
      counter1.increment();
      counter2.increment();
      counter1.merge(counter2);
      counter2.merge(counter1);
      counter1.increment();
      counter2.increment();
      counter1.merge(counter2);
      assert.equal(counter1.value, 4);
    });

  });

  describe('is a CRDT', () => {
    let a, b, c;

    const resetCounters = () => {
      a = new Counter('A');
      b = new Counter('B');
      c = new Counter('C');
      a.increment(1);
      b.increment(2);
      c.increment(3);
    };

    it('is associative', () => {
      // a + (b + c)
      resetCounters();
      b.merge(c);
      a.merge(b);
      const res1 = a.value;

      // (a + b) + c
      resetCounters();
      a.merge(b);
      c.merge(a);
      const res2 = c.value;

      // associativity: a + (b + c) == (a + b) + c
      assert.equal(res1, res2);
    });

    it('is commutative', () => {
      // a + b
      resetCounters();
      a.merge(b);
      const res1 = a.value;

      // b + a
      resetCounters();
      b.merge(a);
      const res2 = b.value;

      // commutativity: a + b == b + a
      assert.equal(res1, res2);
    });

    it('is idempotent', () => {
      resetCounters();
      // idempotence: a + a = a
      a.merge(a);
      assert.equal(a.compare(a), true);
    });
  });
});
