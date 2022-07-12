export type Nullish = undefined | null
export type MaybeNullish<T> = T | Nullish

/**
 * Tries to index a maybe-falsy object with a maybe-falsy key, maybe.
 * @param obj the maybe-falsy object
 * @param key the maybe-falsy key to index the maybe-falsy object with
 * @returns a maybe-falsy value
 */
export function maybeObjectAccess<K extends keyof O, O>(
  obj: MaybeNullish<O>,
  key: MaybeNullish<K>,
  defaultValue: O[K],
): O[K] {
  if (obj && key && obj[key]) {
    return obj[key]
  }
  return defaultValue
}

/**
 * Removes key K from type T.
 */
export type Without<T, K> = Pick<T, Exclude<keyof T, K>>
