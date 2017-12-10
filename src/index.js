// Export all supported CRDTs
exports.GCounter = GCounter = require('./G-Counter')
exports.CmRDTSet = CmRDTSet = require('./CmRDT-Set')
exports.GSet = GSet = require('./G-Set')
exports.TwoPSet = TwoPSet = require('./2P-Set')
exports.ORSet = ORSet = require('./OR-Set')
exports.LWWSet = LWWSet = require('./LWW-Set')

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
  CmRDTSet: CmRDTSet,
  GSet: GSet,
  TwoPSet: TwoPSet,
  ORSet: ORSet,
  LWWSet: LWWSet,
}
