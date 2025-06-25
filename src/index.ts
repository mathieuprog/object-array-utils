export type PlainObject<T = unknown> = Record<string, T>;

export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

function isPrimitive(v: unknown): v is Primitive {
  return v == null || (typeof v !== 'object' && typeof v !== 'function');
}

function isNullOrUndefined(v: unknown): v is null | undefined {
  return v == null; // matches both null and undefined
}

function isPrimitiveWrapper(o: unknown): o is Number | String | Boolean {
  return o instanceof Number || o instanceof String || o instanceof Boolean;
}

type Unboxed<T> =
  T extends Number  ? number  :
  T extends String  ? string  :
  T extends Boolean ? boolean :
  T;

function unboxPrimitiveWrapper<T>(v: T): Unboxed<T> {
  return (isPrimitiveWrapper(v) ? v.valueOf() : v) as Unboxed<T>;
}

function isEmptyArray(a: unknown): a is [] {
  return Array.isArray(a) && a.length === 0;
}

function isPlainObject(o: unknown): o is PlainObject {
  if (o == null || typeof o !== 'object') return false;
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
}

function isEmptyPlainObject(o: unknown): o is {} {
  return isPlainObject(o) && Object.keys(o).length === 0;
}

function isArrayWhereEvery<T>(a: unknown, predicate: (v: unknown) => v is T): a is T[] {
  return Array.isArray(a) && a.every(predicate);
}

function isPlainObjectWhereEvery<T>(o: unknown, predicate: (v: unknown) => v is T): o is PlainObject<T> {
  return isPlainObject(o) && Object.values(o).every(predicate);
}

export enum ComparisonResult {
  Equal = 'EQUAL',
  NotEqual = 'NOT_EQUAL',
  UseDefault = 'USE_DEFAULT'
}

export type ComparePlainObjects = {
  (a: PlainObject, b: PlainObject): ComparisonResult;
};

export type AreNonPlainObjectsEqual = {
  (a: object, b: object): boolean;
};

type EqualOptions = {
  comparePlainObjects?: ComparePlainObjects;
  areNonPlainObjectsEqual: AreNonPlainObjectsEqual;
  unboxPrimitives: boolean;
  unorderedArrays: true;
};

function areDataEqual(x: unknown, y: unknown, opts: EqualOptions) {
  if (opts.unboxPrimitives) {
    x = unboxPrimitiveWrapper(x);
    y = unboxPrimitiveWrapper(y);
  }

  if (x === y) return true;
  if (Array.isArray(x) && Array.isArray(y)) return areArraysEqual(x, y, opts);
  if (isPlainObject(x) && isPlainObject(y)) return arePlainObjectsEqual(x, y, opts);
  if (isPrimitive(x) && isPrimitive(y)) return Object.is(x, y);

  const protoX = Object.getPrototypeOf(x);
  const protoY = Object.getPrototypeOf(y);
  if (
    !isPrimitiveWrapper(x) && ![Object.prototype, Array.prototype, null].includes(protoX) &&
    !isPrimitiveWrapper(y) && ![Object.prototype, Array.prototype, null].includes(protoY)
  ) {
    if (protoX?.constructor !== protoY?.constructor) return false;
    return opts.areNonPlainObjectsEqual(x as object, y as object);
  }
  return Object.is(x, y);
}

function arePlainObjectsEqual(a: PlainObject, b: PlainObject, options: EqualOptions) {
  if (!isPlainObject(a) || !isPlainObject(b)) throw new Error('expected plain objects');
  if (a === b) return true;

  const res = options.comparePlainObjects?.(a, b);
  if (res === ComparisonResult.Equal) return true;
  if (res === ComparisonResult.NotEqual) return false;

  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;

  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!areDataEqual(a[k], b[k], options)) return false;
  }
  return true;
}

function areArraysEqual(a: readonly unknown[], b: readonly unknown[], options: EqualOptions) {
  if (!Array.isArray(a) || !Array.isArray(b)) throw new Error('expected arrays');
  if (a === b) return true;
  if (a.length !== b.length) return false;
  if (a.length === 0) return true;

  // fast-path 1: already aligned
  let allMatchByIndex = true;
  for (let i = 0; i < a.length; ++i) {
    if (!areDataEqual(a[i], b[i], options)) {
      allMatchByIndex = false;
      break;
    }
  }
  if (allMatchByIndex) return true;

  // fast-path 2: both all-primitive
  let allPrimitives = true;
  for (let i = 0; i < a.length; ++i) {
    if (!isPrimitive(a[i]) || !isPrimitive(b[i])) {
      allPrimitives = false;
      break;
    }
  }

  if (allPrimitives) {
    const multiset = new Map<Primitive, number>();
    for (const v of a as readonly Primitive[])
      multiset.set(v, (multiset.get(v) ?? 0) + 1);

    for (const v of b as readonly Primitive[]) {
      const n = multiset.get(v);
      if (!n) return false;
      n === 1 ? multiset.delete(v) : multiset.set(v, n - 1);
    }
    return true;
  }

  // fallback: generic O(n²) matcher
  const matched = new Array<boolean>(b.length).fill(false);

  outer: for (const elemA of a) {
    for (let i = 0; i < b.length; ++i) {
      if (!matched[i] && areDataEqual(elemA, b[i], options)) {
        matched[i] = true;
        continue outer;
      }
    }
    return false;
  }

  return true;
}

function hasProperty(o: object, prop: string) {
  if (typeof o !== 'object' || o == null) throw new Error('expected object');
  return Object.prototype.hasOwnProperty.call(o, prop);
}

function hasProperties(o: object, props: string[]) {
  return props.every(prop => hasProperty(o, prop));
}

type KeyPredicate<T> = (key: string, val: T) => boolean;

export function copyOwnStrings<T, K extends string = string>(
  src: Record<K, T>,
  filter: (key: K, value: T) => boolean,
): Record<K, T> {
  const kept: [K, T][] = [];

  for (const key of Object.keys(src) as K[]) {
    const value = src[key];
    if (filter(key, value)) kept.push([key, value]);
  }

  if (kept.length === Object.keys(src).length) return src as Record<K, T>;

  return Object.fromEntries(kept) as Record<K, T>;
}

function pickProperties<T = unknown>(
  obj: object,
  arg: string[] | KeyPredicate<T>
) {
  return Array.isArray(arg)
    ? copyOwnStrings(obj as any, k => arg.includes(k))
    : copyOwnStrings(obj as any, arg);
}

function omitProperties<T = unknown>(
  obj: object,
  arg: string[] | KeyPredicate<T>
) {
  return Array.isArray(arg)
    ? copyOwnStrings(obj as any, k => !arg.includes(k))
    : copyOwnStrings(obj as any, (k, v) => !arg(k, v as any));
}

function partitionProperties<T = unknown>(
  obj: object,
  arg: string[] | KeyPredicate<T>
) {
  const isWanted = Array.isArray(arg)
    ? (k: string) => (arg as string[]).includes(k)
    : (k: string, v: unknown) => (arg as KeyPredicate<T>)(k, v as T);

  const picked: Record<string, unknown> = {};
  const omitted: Record<string, unknown> = {};
  const missingKeys  : string[] = [];

  for (const k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    const v = (obj as any)[k];
    (isWanted(k, v) ? picked : omitted)[k] = v;
  }

  if (Array.isArray(arg)) {
    for (const k of arg) {
      if (!(k in picked)) missingKeys.push(k);
    }
  }

  return { picked, omitted, missingKeys };
}

function removeArrayElements<T = unknown>(array: T[], listOfValues: T[]): T[] {
  if (!Array.isArray(array) || !Array.isArray(listOfValues)) {
    throw new Error('expected array');
  }

  listOfValues.forEach((value) => {
    array = removeArrayElement(array, value);
  });

  return array;
}

function removeArrayElement<T = unknown>(array: T[], valueOrPredicate: T | ((value: T) => boolean)): T[] {
  if (!Array.isArray(array)) {
    throw new Error('expected array');
  }

  return (typeof valueOrPredicate === 'function')
    ? removeArrayElementByPredicate(array, valueOrPredicate as (value: T) => boolean)
    : removeArrayElementByValue(array, valueOrPredicate);
}

function removeArrayElementByValue<T = unknown>(array: T[], value: T): T[] {
  const indexToRemove = array.indexOf(value);

  return (indexToRemove !== -1)
    ? removeArrayElementByIndex(array, indexToRemove)
    : array;
}

function removeArrayElementByPredicate<T>(array: T[], fun: (v: T) => boolean): T[] {
  const idx = array.findIndex(fun);
  return idx === -1 ? array : [...array.slice(0, idx), ...array.slice(idx + 1)];
}

function removeArrayElementByIndex<T = unknown>(array: T[], index: number): T[] {
  if (!Array.isArray(array)) {
    throw new Error('expected array');
  }

  if (isNaN(index) || index < 0) {
    throw new Error('expected positive number')
  }

  return [...array.slice(0, index), ...array.slice(index + 1)];
}

function differencePrimitives<T extends Primitive>(a1: readonly T[], a2: readonly T[]): T[] {
  const exclude = new Set<Primitive>(a2 as readonly Primitive[]);
  return a1.filter(v => !exclude.has(v));
}

// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/group
// function groupArrayElementsBy(arrayOfObjects, getKey) {
//   return arrayOfObjects.reduce(function (resultingObject, object) {
//     const key = getKey(object);

//     if (!resultingObject[key]) {
//       resultingObject[key] = [];
//     }
//     resultingObject[key].push(object);

//     return resultingObject;
//   }, {});
// }

export function isDataSubset(sup: unknown, sub: unknown, opts: EqualOptions) {
  if (opts.unboxPrimitives) {
    sup = unboxPrimitiveWrapper(sup);
    sub = unboxPrimitiveWrapper(sub);
  }
  if (sup === sub) return true;
  if (Array.isArray(sup) && Array.isArray(sub)) return isArraySubset(sup, sub, opts);
  if (isPlainObject(sup) && isPlainObject(sub)) return isPlainObjectSubset(sup, sub, opts);
  if (isPrimitive(sup) && isPrimitive(sub)) return Object.is(sup, sub);

  const protoSup = Object.getPrototypeOf(sup);
  const protoSub = Object.getPrototypeOf(sub);
  if (
    !isPrimitiveWrapper(sup) && ![Object.prototype, Array.prototype, null].includes(protoSup) &&
    !isPrimitiveWrapper(sub) && ![Object.prototype, Array.prototype, null].includes(protoSub)
  ) {
    if (protoSup?.constructor !== protoSub?.constructor) return false;
    return opts.areNonPlainObjectsEqual(sup as object, sub as object);
  }
  return Object.is(sup, sub);
}

function isPlainObjectSubset(sup: PlainObject, sub: PlainObject, opt: EqualOptions) {
  if (!isPlainObject(sup) || !isPlainObject(sub)) throw new Error('expected plain objects');
  if (sup === sub) return true;

  const res = opt.comparePlainObjects?.(sup, sub);
  if (res === ComparisonResult.Equal) return true;
  if (res === ComparisonResult.NotEqual) return false;

  for (const [k, vSub] of Object.entries(sub)) {
    if (!hasProperty(sup, k)) return false;
    if (!isDataSubset(sup[k], vSub, opt)) return false;
  }
  return true;
}

function isArraySubset(supArr: readonly unknown[], subArr: readonly unknown[], opt: EqualOptions) {
  if (!Array.isArray(supArr) || !Array.isArray(subArr)) throw new Error('expected arrays');
  if (supArr === subArr) return true;
  if (subArr.length === 0) return true;
  if (supArr.length < subArr.length) return false;

  // fast-path 1: already aligned
  let allMatchByIndex = true;
  for (let i = 0; i < subArr.length; ++i) {
    if (!isDataSubset(supArr[i], subArr[i], opt)) {
      allMatchByIndex = false;
      break;
    }
  }
  if (allMatchByIndex) return true;

  // fast-path 2: both all-primitive
  let primitivesOnly = true;

  // check overlapping prefix
  for (let i = 0; i < subArr.length && primitivesOnly; ++i) {
    primitivesOnly = isPrimitive(subArr[i]) && isPrimitive(supArr[i]);
  }

  // check the tail of supArr only
  for (let i = subArr.length; i < supArr.length && primitivesOnly; ++i) {
    primitivesOnly = isPrimitive(supArr[i]);
  }

  if (primitivesOnly) {
    const multiset = new Map<Primitive, number>();
    for (const v of supArr as readonly Primitive[])
      multiset.set(v, (multiset.get(v) ?? 0) + 1);

    for (const v of subArr as readonly Primitive[]) {
      const n = multiset.get(v);
      if (!n) return false;
      n === 1 ? multiset.delete(v) : multiset.set(v, n - 1);
    }
    return true;
  }

  // fallback: generic O(n²) matcher
  const matched = new Array<boolean>(supArr.length).fill(false);

  outer: for (const vSub of subArr) {
    for (let i = 0; i < supArr.length; ++i) {
      if (!matched[i] && isDataSubset(supArr[i], vSub, opt)) {
        matched[i] = true;
        continue outer;
      }
    }
    return false;
  }
  return true;
}

function deepClonePlain<T = unknown>(value: T): T {
  const seen = new WeakMap<object, unknown>();

  const walk = (node: unknown): unknown => {
    if (isPrimitive(node) || typeof node === "function") return node;
    if (seen.has(node as object)) return seen.get(node as object)!;

    if (Array.isArray(node)) {
      const copy: unknown[] = [];
      seen.set(node as object, copy);
      (node as unknown[]).forEach((el, i) => (copy[i] = walk(el)));
      return copy;
    }

    if (isPlainObject(node)) {
      const copy: Record<string, unknown> = {};
      seen.set(node as object, copy);
      Object.keys(node as object).forEach((k) => {
        copy[k] = walk((node as Record<string, unknown>)[k]);
      });
      return copy;
    }

    return node;
  };

  return walk(value) as T;
}

type ObjectOrArray = unknown[] | Record<string | number | symbol, unknown>;

function deepFreezePlain<T extends ObjectOrArray>(root: T): Readonly<T> {
  if (!isPlainObject(root) && !Array.isArray(root)) {
    throw new Error('expected plain object or array');
  }

  const seen = new WeakSet<object>();

  const walk = (node: unknown): void => {
    if ((!isPlainObject(node) && !Array.isArray(node)) || seen.has(node)) return;

    seen.add(node as object);

    for (const key of Object.keys(node)) {
      walk((node as Record<string, unknown>)[key]);
    }

    Object.freeze(node);
  };

  walk(root);
  return root as Readonly<T>;
}

function toSortedObject(o: PlainObject) {
  const out: PlainObject = {};
  for (const k of Object.keys(o).sort()) out[k] = o[k];
  return out;
}

type RangeOptionsWithCount = {
  start?: number;
  count: number;
  endInclusive?: never;
  endExclusive?: never;
};

type RangeOptionsWithEndInclusive = {
  start?: number;
  count?: never;
  endInclusive: number;
  endExclusive?: never;
};

type RangeOptionsWithEndExclusive = {
  start?: number;
  count?: never;
  endInclusive?: never;
  endExclusive: number;
};

type RangeOptions = RangeOptionsWithCount | RangeOptionsWithEndInclusive | RangeOptionsWithEndExclusive;

function range(options: RangeOptions): number[] {
  const unknown = omitProperties(options, [
    'start',
    'count',
    'endInclusive',
    'endExclusive',
  ]);
  if (!isEmptyPlainObject(unknown)) {
    throw new Error(`unknown option(s): ${Object.keys(unknown).join(', ')}`);
  }

  const { start: rawStart, count, endInclusive, endExclusive } = options;
  const start = rawStart ?? 0;
  const hasCount        = count        !== undefined;
  const hasEndInclusive = endInclusive !== undefined;
  const hasEndExclusive = endExclusive !== undefined;

  const provided = Number(hasCount) + Number(hasEndInclusive) + Number(hasEndExclusive);
  if (provided === 0) {
    throw new Error('Specify either `count`, `endInclusive`, or `endExclusive`.');
  }
  if (provided > 1) {
    throw new Error('Only one of `count`, `endInclusive`, or `endExclusive` may be supplied.');
  }

  let len: number;
  if (hasCount) {
    if (count! < 0) throw new Error('`count` must be non-negative');
    len = count!;
  } else if (hasEndInclusive) {
    if (endInclusive! < start) throw new Error('`endInclusive` must be ≥ `start`');
    len = endInclusive! - start + 1;
  } else { // endExclusive
    if (endExclusive! <= start) throw new Error('`endExclusive` must be > `start`');
    len = endExclusive! - start;
  }

  return Array.from({ length: len }, (_, i) => start + i);
}

function repeat<T = unknown>(value: T, count: number, transformFun = (v: T, _i: number) => v) {
  return [...Array(count).keys()].map(i => transformFun(value, i));
}

function unique<T, K = T>(
  array: readonly T[],
  keyFn: (item: T) => K = (x => x as unknown as K)
): T[] {
  if (array.length < 2) return array as T[];

  const seen   = new Set<K>();
  const result: T[] = [];

  for (const item of array) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result.length === array.length ? (array as T[]) : result;
}

function makeCopyOnWriteObjectSetter<T extends PlainObject>(base: T) {
  if (!isPlainObject(base)) throw new Error('base must be a plain object');

  let draft = base;

  return function set<K extends keyof T>(key: K, value: T[K]): T {
    if (Object.is(draft[key], value)) return draft;

    if (draft === base) draft = { ...base };
    draft[key] = value;
    return draft;
  };
}

export {
  areArraysEqual,
  arePlainObjectsEqual,
  areDataEqual,
  deepClonePlain,
  deepFreezePlain,
  differencePrimitives,
  repeat,
  pickProperties,
  hasProperty,
  hasProperties,
  isArraySubset,
  isArrayWhereEvery,
  isEmptyArray,
  isEmptyPlainObject,
  isNullOrUndefined,
  isPlainObject,
  isPlainObjectWhereEvery,
  isPlainObjectSubset,
  isPrimitive,
  isPrimitiveWrapper,
  range,
  omitProperties,
  removeArrayElement,
  removeArrayElementByIndex,
  removeArrayElements,
  toSortedObject,
  unboxPrimitiveWrapper,
  partitionProperties,
  unique,
  makeCopyOnWriteObjectSetter,
}
