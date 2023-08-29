export type ObjectLiteral<T = unknown> = Record<string, T>;

export type ObjectInstance<T = unknown> = {
  constructor: Function;
  [key: string]: unknown;
};

export type Primitive = string | number | bigint | boolean | symbol | null | undefined;

function isNullOrUndefined(v: unknown) {
  return v === null || v === undefined;
}

function isObject(o: unknown): o is ObjectInstance | ObjectLiteral {
  return isObjectLiteral(o) || isObjectInstance(o);
}

function isObjectLiteral(o: unknown): o is ObjectLiteral {
  return !isNullOrUndefined(o) && Object.getPrototypeOf(o) === Object.prototype;
}

function isEmptyObjectLiteral(o: unknown): o is {} {
  return isObjectLiteral(o) && Object.keys(o).length === 0;
}

function isObjectInstance(o: unknown): o is ObjectInstance {
  return !isNullOrUndefined(o)
    && !isArray(o)
    && Object.getPrototypeOf(o) !== Object.prototype
    && typeof o === 'object';
}

function isArray(a: unknown): a is unknown[] {
  return !isNullOrUndefined(a) && Array.isArray(a);
}

function isEmptyArray(a: unknown): a is [] {
  return isArray(a) && a.length === 0;
}

function isArrayOfObjects(a: unknown): a is (ObjectInstance | ObjectLiteral)[] {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isObject(o));
}

function isArrayOfObjectLiterals(a: unknown): a is ObjectLiteral[] {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isObjectLiteral(o));
}

function isArrayOfPrimitives(a: unknown): a is Primitive[] {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isPrimitive(o));
}

function isArrayOfType<T extends string | number | boolean>(
  a: unknown,
  type: T extends string ? 'string' : T extends number ? 'number' : 'boolean'
): a is Array<T> {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => typeof o !== type);
}

function isArrayWhereEvery<T>(a: unknown, fun: (value: unknown) => boolean): a is Array<T> {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !fun(o));
}

function isObjectLiteralWhereEvery<T>(o: unknown, fun: (value: unknown) => boolean): o is ObjectLiteral<T> {
  if (!isObjectLiteral(o) || isEmptyObjectLiteral(o)) {
    return false;
  }

  return isArrayWhereEvery(Object.values(o), fun);
}

function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (!a || !b) return false;

  if (typeof a !== typeof b) return false;

  if (isArray(a) !== isArray(b)) return false;

  if (isArray(a)) {
    if (!areArraysEqual(a, b as unknown[])) return false;
    return true;
  }

  if (isObject(a) !== isObject(b)) return false;

  if (isObject(a)) {
    if (!areObjectsEqual(a, b as ObjectInstance | ObjectLiteral)) return false;
    return true;
  }

  return false;
}

export enum ComparisonResult {
  Equal = 'EQUAL',
  NotEqual = 'NOT_EQUAL',
  DefaultComparison = 'DEFAULT_COMPARISON'
}

type AreEqualOptions = {
  compare: (a: any, b: any) => ComparisonResult;
};

function areObjectsEqual(a: ObjectLiteral | ObjectInstance, b: ObjectLiteral | ObjectInstance, options?: AreEqualOptions) {
  if (!isObject(a) || !isObject(b)) {
    throw new Error('expected objects');
  }

  if (a === b) return true;

  // ensure immutability
  a = { ...a };
  b = { ...b };

  switch (options?.compare(a, b)) {
    case 'DEFAULT_COMPARISON':
    case undefined:
      break;

    case 'EQUAL':
      return true;

    case 'NOT_EQUAL':
      return false;
  }

  if (isObjectLiteral(a) !== isObjectLiteral(b)) return false;

  if (isObjectInstance(a)) {
    const str = a.toString();
    return str !== '[object Object]' && str === b.toString();
  }

  if (Object.keys(a).length !== Object.keys(b).length) return false;

  for (let [key, value] of Object.entries(a)) {
    if (!hasProperty(b, key)) return false;

    const b_: ObjectLiteral = b;

    if (value === b_[key]) continue;

    if (!value || !b_[key]) return false;

    if (typeof value !== typeof b_[key]) return false;

    if (isArray(value) !== isArray(b_[key])) return false;

    if (isArray(value)) {
      if (!areArraysEqual(value, b_[key] as unknown[], options)) return false;
      continue;
    }

    if (isObject(value) !== isObject(b_[key])) return false;

    if (isObject(value)) {
      if (!areObjectsEqual(value, b_[key] as ObjectInstance | ObjectLiteral, options)) return false;
      continue;
    }

    return false;
  }

  return true;
}

function areArraysEqual(a: unknown[], b: unknown[], options?: AreEqualOptions) {
  if (!isArray(a) || !isArray(b)) {
    throw new Error('expected arrays');
  }

  if (a === b) return true;

  // ensure immutability
  a = [...a];
  b = [...b];

  switch (options?.compare(a, b)) {
    case 'DEFAULT_COMPARISON':
    case undefined:
      break;

    case 'EQUAL':
      return true;

    case 'NOT_EQUAL':
      return false;
  }

  if (a.length !== b.length) return false;

  for (let value of a) {
    if (isArray(value)) {
      const value_ = value;
      const index = b.findIndex(e => isArray(e) && areArraysEqual(e, value_, options));
      if (index === -1) return false;
      b.splice(index, 1);
      continue;
    }

    if (isObject(value)) {
      const value_ = value;
      const index = b.findIndex(e => isObject(e) && areObjectsEqual(e, value_, options));
      if (index === -1) return false;
      b.splice(index, 1);
      continue;
    }

    const index = b.findIndex(e => e === value);
    if (index === -1) return false;
    b.splice(index, 1);
  }

  return true;
}

function hasProperty(o: ObjectInstance | ObjectLiteral, prop: string) {
  if (!isObject(o)) {
    throw new Error('expected object');
  }

  return Object.prototype.hasOwnProperty.call(o, prop);
}

function hasProperties(o: ObjectInstance | ObjectLiteral, props: string[]) {
  return props.every(prop => hasProperty(o, prop));
}

function filterProperties<T>(o: ObjectLiteral<T>, arg: string[] | ((key: string, val: T) => boolean)) {
  return isArray(arg)
    ? filterPropsByWhitelist(o, arg)
    : filterPropsByFun(o, arg);
}

function filterPropsByWhitelist(o: ObjectLiteral, props: string[]) {
  return props.reduce((newObject, prop) => {
    return (prop in o)
      ? { ...newObject, [prop]: o[prop] }
      : newObject;
  }, {});
}

function filterPropsByFun<T>(o: ObjectLiteral<T>, fun: (key: string, val: T) => boolean) {
  const filteredEntries = Object.entries(o).filter(([key, val]) => fun(key, val));
  return Object.fromEntries(filteredEntries);
}

function rejectProperties<T>(o: ObjectLiteral<T>, arg: string[] | ((key: string, val: T) => boolean)) {
  return isArray(arg)
    ? rejectPropsByWhitelist(o, arg)
    : rejectPropsByFun(o, arg);
}

function rejectPropsByWhitelist(o: ObjectLiteral, props: string[]) {
  return Object.keys(o).reduce((newObject, prop) => {
    return (props.includes(prop))
      ? newObject
      : { ...newObject, [prop]: o[prop] };
  }, {});
}

function rejectPropsByFun<T>(o: ObjectLiteral<T>, fun: (key: string, val: T) => boolean) {
  const filteredEntries = Object.entries(o).filter(([key, val]) => !fun(key, val));
  return Object.fromEntries(filteredEntries);
}

function takeProperties<T>(o: ObjectLiteral<T>, arg: string[] | ((key: string, val: T) => boolean)) {
  return isArray(arg)
    ? takePropsByWhitelist(o, arg)
    : takePropsByFun(o, arg);
}

function takePropsByWhitelist(o: ObjectLiteral, props: string[]) {
  const keys = Object.keys(o);

  const undefined_ =
    differenceArraysOfPrimitives(props, keys)
      .reduce((acc, key) => ({ ...acc, [key]: undefined }), {});

  return keys.reduce(({ filtered, rejected, undefined }, prop) => {
    return (props.includes(prop))
      ? { filtered: { ...filtered, [prop]: o[prop] }, rejected, undefined }
      : { filtered, rejected: { ...rejected, [prop]: o[prop] }, undefined }
  }, { filtered: {}, rejected: {}, undefined: undefined_ });
}

function takePropsByFun<T>(o: ObjectLiteral<T>, fun: (key: string, val: T) => boolean) {
  const filteredKeys =
    Object.entries(o)
      .filter(([key, val]) => fun(key, val))
      .map(([key, _]) => key);

  return takePropsByWhitelist(o, filteredKeys);
}

function removeArrayElements<T = unknown>(array: T[], listOfValues: T[]): T[] {
  if (!isArray(array) || !isArray(listOfValues)) {
    throw new Error('expected array');
  }

  listOfValues.forEach((value) => {
    array = removeArrayElement(array, value);
  });

  return array;
}

function removeArrayElement<T = unknown>(array: T[], valueOrFun: T | ((value: T) => boolean)): T[] {
  if (!isArray(array)) {
    throw new Error('expected array');
  }

  return (typeof valueOrFun === 'function')
    ? removeArrayElementByFun(array, valueOrFun as (value: T) => boolean)
    : removeArrayElementByValue(array, valueOrFun);
}

function removeArrayElementByValue<T = unknown>(array: T[], value: T): T[] {
  const indexToRemove = array.indexOf(value);

  return (indexToRemove !== -1)
    ? removeArrayElementByIndex(array, indexToRemove)
    : array;
}

function removeArrayElementByFun<T = unknown>(array: T[], fun: (value: T) => boolean): T[] {
  let indexToRemove = null;

  for (let i = 0; i < array.length; ++i) {
    if (fun(array[i])) {
      indexToRemove = i;
      break;
    }
  }

  if (indexToRemove === null) {
    return array;
  }

  return removeArrayElementByIndex(array, indexToRemove);
}

function removeArrayElementByIndex<T = unknown>(array: T[], index: number): T[] {
  if (!isArray(array)) {
    throw new Error('expected array');
  }

  if (isNaN(index) || index < 0) {
    throw new Error('expected positive number')
  }

  return [...array.slice(0, index), ...array.slice(index + 1)];
}

function differenceArraysOfPrimitives<T extends Primitive>(a1: T[], a2: T[]): T[] {
  return a1.filter((e) => !a2.includes(e));
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

function isObjectSubset(superObject: ObjectInstance | ObjectLiteral, subObject: ObjectInstance | ObjectLiteral): boolean {
  if (!isObject(superObject) || !isObject(subObject)) {
    throw new Error('expected objects');
  }

  if (superObject === subObject) return true;

  if (isObjectLiteral(superObject) !== isObjectLiteral(subObject)) return false;

  if (isObjectInstance(superObject)) {
    const str = superObject.toString();
    return str !== '[object Object]' && str === subObject.toString();
  }

  if (Object.keys(superObject).length < Object.keys(subObject).length) return false;

  return Object.keys(subObject).every(key => {
    if (!hasProperty(superObject, key)) return false;

    if (superObject[key] === subObject[key]) return true;

    if (!superObject[key] || !subObject[key]) return false;

    if (typeof superObject[key] !== typeof subObject[key]) return false;

    if (isObject(superObject[key]) !== isObject(subObject[key])) return false;

    if (isObject(superObject[key])) {
      return isObjectSubset(superObject[key], subObject[key] as ObjectInstance | ObjectLiteral);
    }

    if (isArray(superObject[key]) !== isArray(subObject[key])) return false;

    if (isArray(superObject[key])) {
      return isArraySubset(superObject[key], subObject[key] as unknown[]);
    }

    return false;
  });
}

function isArraySubset(superArray: unknown[], subArray: unknown[]): boolean {
  if (!isArray(superArray) || !isArray(subArray)) {
    throw new Error('expected arrays');
  }

  if (superArray === subArray) return true;

  if (superArray.length < subArray.length) return false;

  superArray = [...superArray];
  subArray = [...subArray];

  for (let value of subArray) {
    if (isArray(value)) {
      const value_ = value;
      const index = superArray.findIndex(e => isArray(e) && isArraySubset(e, value_));
      if (index === -1) return false;
      superArray.splice(index, 1);
      continue;
    }

    if (isObject(value)) {
      const value_ = value;
      const index = superArray.findIndex(e => isObject(e) && isObjectSubset(e, value_));
      if (index === -1) return false;
      superArray.splice(index, 1);
      continue;
    }

    const index = superArray.findIndex(e => e === value);
    if (index === -1) return false;
    superArray.splice(index, 1);
  }

  return true;
}

function isPrimitive(value: unknown) {
  return value !== Object(value);
}

function cloneShape<T = unknown>(value: T): T {
  if (isObjectLiteral(value)) {
    return cloneShapeOfObjectLiteral(value) as any;
  }

  if (isArray(value)) {
    return cloneShapeOfArray(value) as any;
  }

  return value;
}

function cloneShapeOfObjectLiteral(o: ObjectLiteral) {
  return Object.fromEntries(
    Object.entries(o).map(([key, val]) => [key, cloneShape(val)])
  );
}

function cloneShapeOfArray(a: unknown[]) {
  return a.map((e) => cloneShape(e));
}

function deepFreeze(o: unknown[] | ObjectInstance | ObjectLiteral) {
  if (!isObject(o) && !isArray(o)) {
    throw new Error('expected object or array');
  }

  Object.keys(o).forEach((prop) => {
    const o_ = o as any;
    if ((!isObject(o_[prop]) || !isArray(o_[prop])) && !Object.isFrozen(o_[prop])) {
      deepFreeze(o_[prop]);
    }
  });

  return Object.freeze(o);
}

function sortProperties(o: ObjectLiteral) {
  return Object.fromEntries(Object.entries(o).sort(([k1], [k2]) => k1 < k2 ? -1 : 1));
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

function range(options: RangeOptions) {
  const unknownOptions = rejectProperties<unknown>(options, ['start', 'count', 'endInclusive', 'endExclusive']);

  if (!isEmptyObjectLiteral(unknownOptions)) {
    throw new Error(`unknown options: ${Object.keys(unknownOptions).join(', ')}`);
  }

  if (!options.endInclusive && !options.endExclusive && !options.count) {
    throw new Error('expected either `endInclusive`, `endExclusive` or `count` to be specified');
  }

  if (Number(!!options?.count) + Number(!!options?.endInclusive) + Number(!!options?.endExclusive) > 1) {
    throw new Error('expected only one of the properties `endInclusive`, `endExclusive`, or `count` to be specified.');
  }

  const start = options.start ?? 0;

  if (options.endInclusive && start > options.endInclusive) {
    throw new Error('`endInclusive` should be greater or equal than `start`');
  }

  if (options.endExclusive && start >= options.endExclusive) {
    throw new Error('`endExclusive` should be greater than `start`');
  }

  const count = options.count ?? ((options.endInclusive) ? options.endInclusive - start + 1 : options.endExclusive as number - start);

  return [...Array(count).keys()].map(i => i + start);
}

function duplicate<T = unknown>(value: T, count: number, transformFun = (v: T, _i: number) => v) {
  return [...Array(count).keys()].map(i => transformFun(value, i));
}

function unique<T>(a: T[], fun?: (val: T) => unknown) {
  if (!fun) {
    return [...new Set(a)];
  }

  const uniqueMap = new Map<unknown, T>();

  for (const item of a) {
    const key = fun(item);

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  return Array.from(uniqueMap.values());
}

export {
  areArraysEqual,
  areObjectsEqual,
  areValuesEqual,
  cloneShape,
  deepFreeze,
  differenceArraysOfPrimitives,
  duplicate,
  filterProperties,
  hasProperty,
  hasProperties,
  isArray,
  isArrayOfObjects,
  isArrayOfObjectLiterals,
  isArrayOfPrimitives,
  isArrayOfType,
  isArraySubset,
  isArrayWhereEvery,
  isEmptyArray,
  isEmptyObjectLiteral,
  isNullOrUndefined,
  isObject,
  isObjectInstance,
  isObjectLiteral,
  isObjectLiteralWhereEvery,
  isObjectSubset,
  isPrimitive,
  range,
  rejectProperties,
  removeArrayElement,
  removeArrayElementByIndex,
  removeArrayElements,
  sortProperties,
  takeProperties,
  unique
}
