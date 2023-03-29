// Python's bisect implementation in TypeScript
// Lifted from here: https://github.com/bgschiller/bisect
export type Comparable = string | number | Date;
export type KeyFunc<T, C extends Comparable> = (arg0: T) => C;
export type Comparator<T> = (a: T, b: T) => -1 | 0 | 1;

export class BisectError extends Error {}

// find the insertion point for `needle` in `arr` to maintain
// sorted order. if `needle` already appears in `arr`, the
// insertion point will be to the left of any existing entries.
export function bisect_left<T>(
  arr: T[],
  needle: Comparable,
  key: (arg: T) => Comparable = (x) => x as Comparable,
  lo: number = 0,
  hi: number = arr.length
): number {
  if (lo < 0)
    throw new BisectError(`low parameter must be >= 0, received ${lo}`);

  let lowIndex = lo;
  let highIndex = hi;
  let midIndex;

  while (lowIndex < highIndex) {
    // The naive `low + high >>> 1` could fail for large arrays
    // because `>>>` converts its operands to int32 and (low + high) could
    // be larger than 2**31
    midIndex = lowIndex + ((highIndex - lowIndex) >>> 1);
    const mVal = key(arr[midIndex]);

    if (mVal < needle) {
      lowIndex = midIndex + 1;
    } else {
      highIndex = midIndex;
    }
  }
  return lowIndex;
}

export function bisect_right<C extends Comparable>(
  arr: C[],
  needle: C,
  lo: number = 0,
  hi: number = arr.length
): number {
  if (lo < 0)
    throw new BisectError(`low parameter must be >= 0, received ${lo}`);

  let lowIx = lo;
  let highIx = hi;
  let midIx;

  while (lowIx < highIx) {
    // The naive `low + high >>> 1` could fail for large arrays
    // because `>>>` converts its operands to int32 and (low + high) could
    // be larger than 2**31
    midIx = lowIx + ((highIx - lowIx) >>> 1);
    const mKey = arr[midIx];
    if (needle < mKey) {
      highIx = midIx;
    } else {
      lowIx = midIx + 1;
    }
  }
  return lowIx;
}
