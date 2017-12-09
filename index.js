// Export all supported CRDTs
exports.GCounter = GCounter = require('./src/G-Counter.js')
exports.GSet = GSet = require('./src/G-Set.js')
exports.TwoPSet = TwoPSet = require('./src/2P-Set.js')
exports.ORSet = ORSet = require('./src/OR-Set.js')
exports.LWWSet = LWWSet = require('./src/LWW-Set.js')

/**
 * CRDTs
 * 
 * Usage:
 *
 * const CRDTs = require('./index.js')
 * const { GCounter, GSet, TwoPSet, ORSet, LWWSet } = CRDTs
 *
 * Or
 *
 * const GSet = require('./index.js').GSet
 */
module.exports = {
  GCounter: GCounter,
  GSet: GSet,
  TwoPSet: TwoPSet,
  ORSet: ORSet,
  LWWSet: LWWSet,
}
