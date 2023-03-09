export const deepEqual = (a: Record<string | number | symbol, unknown>, b: Record<string | number | symbol, unknown>): boolean => {
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

export class OperationTuple3<V=unknown, T=unknown> {
  readonly value: V
  readonly added: Set<T>
  readonly removed: Set<T>

  constructor (value: V, added: Iterable<T>, removed: Iterable<T>) {
    this.value = value
    this.added = new Set(added)
    this.removed = new Set(removed)
  }

  static create<V=unknown, T=unknown> (value: V, added: Iterable<T>, removed: Iterable<T>): OperationTuple3<V, T> {
    return new OperationTuple3(value, added, removed)
  }

  static from<V=unknown, T=unknown> (json: { value: V, added: Iterable<T>, removed: Iterable<T> }): OperationTuple3<V, T> {
    return OperationTuple3.create(json.value, json.added, json.removed)
  }
}
