'use strict'

exports.deepEqual = (a, b) => {
  const propsA = Object.getOwnPropertyNames(a)
  const propsB = Object.getOwnPropertyNames(b)

  if(propsA.length !== propsB.length)
    return false

  for(let i = 0; i < propsA.length; i ++) {
    const prop = propsA[i]
    if(a[prop] !== b[prop])
      return false
  }

  return true
}

class OperationTuple3 {
  constructor (value, added, removed) {
    this.value = value
    this.added = new Set(added)
    this.removed = new Set(removed)
  }

  static create (value, added, removed) {
    return new OperationTuple3(value, added, removed)
  }

  static from (json) {
    return OperationTuple3.create(json.value, json.added, json.removed)
  }
}

exports.OperationTuple3 = OperationTuple3
