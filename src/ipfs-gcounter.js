'use strict';

const Log      = require('ipfs-log');
const GCounter = require('./GCounter');
const isEqual  = require('./utils').isEqual;

class GCounterIPFS extends GCounter {
  constructor(ipfs, id, payload) {
    super(id, payload);
    this._ipfs = ipfs;
    return Log.create(ipfs, this.id).then((log) => {
      this._log = log;
      return this;
    })
  }

  increment(amount) {
    super.increment(amount);
    return this._log.add({ id: this.id, value: this.value });
  }

  get value() {
    return Object.keys(this._counters)
      .map((f) => this._counters[f])
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  }

  get payload() {
    return { id: this.id, counters: this._counters };
  }

  getIpfsHash() {
    return Log.getIpfsHash(this._ipfs, this._log);
    // return this._ipfs.object
    //   .put(new Buffer(JSON.stringify({ Data: JSON.stringify(this.payload) })))
    //   .then((obj) => obj.Hash);
  }

  compare(other) {
    if(other.id !== this.id)
      return false;

    return isEqual(other._counters, this._counters);
  }

  merge(other) {
    const payload = Object.assign({}, other._counters);
    delete payload[this.id];
    Object.assign(this._counters, payload);
  }

  static from(payload) {
    return new GCounterIPFS(payload.id, payload.counters);
  }

  static create(ipfs, id, payload) {
    return new GCounterIPFS(ipfs, id, payload);
  }
}

module.exports = GCounterIPFS;
