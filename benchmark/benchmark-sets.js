// All supported Set CRDTs
import GSet  from '../src/G-Set.js'
import TwoPSet  from '../src/2P-Set.js'
import ORSet  from '../src/OR-Set.js'
import LWWSet  from '../src/LWW-Set.js'

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

export default (() => {
  console.log('Starting benchmark....js')
  // Output metrics at 1 second interval
  setInterval(() => {
    seconds++
    if (seconds % 10 === 0) {
      console.log(`--> Average of ${lastTenSeconds / 10} q/s in the last 10 seconds`)
      if (lastTenSeconds === 0) throw new Error('Problems!.js')
      lastTenSeconds = 0
    }
    console.log(`${queriesPerSecond} queries per second, ${totalQueries} queries in ${seconds} seconds`)
    queriesPerSecond = 0
  }, 1000)

  setImmediate(queryLoop)
})()
