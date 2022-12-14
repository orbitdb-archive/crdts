# CRDTs

[![npm version](https://badge.fury.io/js/crdts.svg)](https://www.npmjs.com/package/crdts)
[![CircleCI](https://circleci.com/gh/orbitdb/crdts.svg?style=shield)](https://circleci.com/gh/orbitdb/crdts)
[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/orbitdb/Lobby) [![Matrix](https://img.shields.io/badge/matrix-%23orbitdb%3Apermaweb.io-blue.svg)](https://riot.permaweb.io/#/room/#orbitdb:permaweb.io)

> A library of Conflict-Free Replicated Data Types for JavaScript.

***Work In Progress***

This module provides a set of Conflict-Free Replicated Data Types for your JavaScript programs. All CRDTs in this library, except G-Counter, are currently operation-based.

CRDTs implemented in this module:

- [G-Counter](https://github.com/orbitdb/crdts/blob/master/src/G-Counter.js)
- [PN-Counter](https://github.com/orbitdb/crdts/blob/master/src/PN-Counter.js)
- [G-Set](https://github.com/orbitdb/crdts/blob/master/src/G-Set.js)
- [2P-Set](https://github.com/orbitdb/crdts/blob/master/src/2P-Set.js)
- [OR-Set](https://github.com/orbitdb/crdts/blob/master/src/OR-Set.js)
- [LWW-Set](https://github.com/orbitdb/crdts/blob/master/src/LWW-Set.js)

## Install

This module uses [npm](https://www.npmjs.com/) and [node](https://nodejs.org/en/).

To install, run:

```sh
$ npm install crdts
```

## Usage

```javascript
import { GCounter, PNCounter, GSet, TwoPSet, ORSet, LWWSet, GSet, ORSet, LWWSet } from 'crdts'
```

See the [source code for each CRDT](https://github.com/orbitdb/crdts/blob/master/src) for the APIs and [tests](https://github.com/orbitdb/crdts/blob/master/test/) for usage examples.

## Inheritance

```
           +-----------++-----------++----------++---------++------------++------------+
Data Type  |  OR-Set   ||  LWW-Set  ||  2P-Set  ||  G-Set  || G-Counter  || PN-Counter |
           +-----------++-----------++----------++---------++------------++------------+
Base Class |                    CmRDT-Set                  |             --            |
           |-----------------------------------------------+---------------------------+
CRDT Type  |                 Operation-Based               |        State-based        |
           +-----------------------------------------------+---------------------------+
```

## CRDTs Research

To learn more about CRDTs, check out this research:

- ["A comprehensive study of Convergent and Commutative Replicated Data Types"](http://hal.upmc.fr/inria-00555588/document) paper
- [CRDTs on Wikipedia](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type#Known_CRDTs)
- [IPFS's CRDT research group](https://github.com/ipfs/research-CRDT)

## Contribute

If you think this could be better, please [open an issue](https://github.com/orbitdb/crdts/issues/new)!

Please note that all interactions in [@OrbitDB](https://github.com/OrbitDB) fall under our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © 2017-2019 Haja Networks Oy
