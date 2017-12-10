# CRDTs

[![npm version](https://badge.fury.io/js/crdts.svg)](https://www.npmjs.com/package/crdts)
[![CircleCI](https://circleci.com/gh/orbitdb/crdts.svg?style=shield)](https://circleci.com/gh/orbitdb/crdts)
[![](https://img.shields.io/badge/freenode-%23orbitdb-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23orbitdb)

A CRDT library for JavaScript.

***Work In Progress***

This module provides a set of Conflict-Free Replicated Data Types for your JavaScript programs. All CRDTs in this library, except G-Counter, are currently operation-based.

Implemented CRDTs:

- [G-Counter](https://github.com/orbitdb/crdts/blob/master/src/G-Counter.js)
- [PN-Counter](https://github.com/orbitdb/crdts/blob/master/src/PN-Counter.js)
- [G-Set](https://github.com/orbitdb/crdts/blob/master/src/G-Set.js)
- [2P-Set](https://github.com/orbitdb/crdts/blob/master/src/2P-Set.js)
- [OR-Set](https://github.com/orbitdb/crdts/blob/master/src/OR-Set.js)
- [LWW-Set](https://github.com/orbitdb/crdts/blob/master/src/LWW-Set.js)

## Usage
```
npm install crdts
```

```javascript
const GCounter = require('crdts').GCounter
const PNCounter = require('crdts').PNCounter
const GSet = require('crdts').GSet
const TwoPSet = require('crdts').TwoPSet
const ORSet = require('crdts').ORSet
const LWWSet = require('crdts').LWWSet

// Or:
const { GSet, ORSet, LWWSet } = require('crdts')
```

See the [source code for each CRDT](https://github.com/orbitdb/crdts/blob/master/src) for the APIs and [tests](https://github.com/orbitdb/crdts/blob/master/test/) for usage examples.

## Inheritance

```
           +-----------++-----------++----------++---------++------------++------------+
Data Type  |  OR-Set   ||  LWW-Set  ||  2P-Set  ||  G-Set  || G-Counter  || PN-Counter |
           +-----------++-----------++----------++---------++------------++------------+
Base Class |                    CmRDT-Set                  |             --            |
           |-----------------------------------------------+---------------------------+
CRDT Type  |                 Operation-Based               | State-based               |
           +-----------------------------------------------+---------------------------+
```

## CRDTs

CRDT research:
https://github.com/ipfs/research-CRDT
