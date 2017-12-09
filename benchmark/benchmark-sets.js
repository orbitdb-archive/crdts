'use strict'

// All supported Set CRDTs
const GSet = require('../src/G-Set')
const TwoPSet = require('../src/2P-Set')
const ORSet = require('../src/OR-Set')
const LWWSet = require('../src/LWW-Set')

// Choose your weapon from ^
const SetCRDT = GSet

// State
let crdt = new SetCRDT()

// Metrics
let totalQueries = 0
let seconds = 0
let queriesPerSecond = 0
let lastTenSeconds = 0

const queryLoop = () => {
  crdt.add(totalQueries)
  totalQueries++
  lastTenSeconds++
  queriesPerSecond++
  setImmediate(queryLoop)
}

let run = (() => {
  console.log('Starting benchmark...')
  // Output metrics at 1 second interval
  setInterval(() => {
    seconds++
    if (seconds % 10 === 0) {
      console.log(`--> Average of ${lastTenSeconds / 10} q/s in the last 10 seconds`)
      if (lastTenSeconds === 0) throw new Error('Problems!')
      lastTenSeconds = 0
    }
    console.log(`${queriesPerSecond} queries per second, ${totalQueries} queries in ${seconds} seconds`)
    queriesPerSecond = 0
  }, 1000)

  setImmediate(queryLoop)
})()

module.exports = run
