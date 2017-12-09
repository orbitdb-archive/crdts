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

class AddRemovePair {
  constructor (element, added, removed) {
    this.value = element
    this._added = new Set(added)
    this._removed = new Set(removed)
  }
}

exports.AddRemovePair = AddRemovePair
