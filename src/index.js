// Export all supported CRDTs
exports.GCounter = GCounter = require('./G-Counter.js')
exports.GSet = GSet = require('./G-Set.js')
exports.TwoPSet = TwoPSet = require('./2P-Set.js')
exports.ORSet = ORSet = require('./OR-Set.js')
exports.LWWSet = LWWSet = require('./LWW-Set.js')

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
