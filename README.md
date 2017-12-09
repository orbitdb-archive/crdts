# CRDTs

A CRDT library for JavaScript.

***WIP***

This module provides a set of Conflict-Free Replicated Data Types for your JavaScript programs. All CRDTs in this library are currently operation-based.

Implemented CRDTs:

- [G-Counter](https://github.com/haadcode/crdts/blob/master/src/G-Counter.js)
- [G-Set](https://github.com/haadcode/crdts/blob/master/src/G-Set.js)
- [2P-Set](https://github.com/haadcode/crdts/blob/master/src/2P-Set.js)
- [OR-Set](https://github.com/haadcode/crdts/blob/master/src/OR-Set.js)
- [LWW-Set](https://github.com/haadcode/crdts/blob/master/src/LWW-Set.js)

## Usage
```
npm install crdts
```

```javascript
const GCounter = require('crdts/src/G-Counter')
const GSet = require('crdts/src/G-Set')
const TwoPSet = require('crdts/src/2P-Set')
const ORSet = require('crdts/src/OR-Set')
const LWWSet = require('crdts/src/LWW-Set')
```

See [CRDT-Set](https://github.com/haadcode/crdts/blob/master/src/CRDT-Set.js) base class for the API and [tests](https://github.com/haadcode/crdts/blob/master/test/) for usage examples.

## Inheritance

```
+------------------------------------------------------------+
|           ||           ||          ||         ||           |
|  OR-Set   ||  LWW-Set  ||          ||         || G-Counter |
|           ||           ||          ||         ||           |
+-------------------------|  2P-Set  ||  G-Set  +------------+
|                        ||          ||         |
|       CmRDT-Set        ||          ||         |
|                        ||          ||         |
+-----------------------------------------------+
|                                               |
|                       G-Set                   |
|                                               |
+-----------------------------------------------+
```