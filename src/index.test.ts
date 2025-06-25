import { expect, test } from 'vitest';

import {
  areArraysEqual,
  arePlainObjectsEqual,
  areDataEqual,
  deepClonePlain,
  deepFreezePlain,
  differencePrimitives,
  repeat,
  pickProperties,
  omitProperties,
  partitionProperties,
  hasProperties,
  isArrayWhereEvery,
  isEmptyArray,
  isEmptyPlainObject,
  isPlainObject,
  isPlainObjectWhereEvery,
  isPrimitive,
  isPrimitiveWrapper,
  unboxPrimitiveWrapper,
  range,
  removeArrayElement,
  removeArrayElementByIndex,
  removeArrayElements,
  toSortedObject,
  unique,
  makeCopyOnWriteObjectSetter,
  type AreNonPlainObjectsEqual
} from './index';

test('areDataEqual', () => {
  const areNonPlainObjectsEqual: AreNonPlainObjectsEqual = () => { throw new Error() };

  expect(areDataEqual(null, null, { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
  expect(areDataEqual(null, undefined, { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeFalsy();
  expect(areDataEqual(undefined, undefined, { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
  expect(areDataEqual(false, false, { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
  expect(areDataEqual(1, 1, { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
  expect(areDataEqual(1, '1', { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeFalsy();
  expect(areDataEqual([{}], [{}], { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
  expect(areDataEqual(0, -0, { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
  expect(areDataEqual([0], [-0], { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
  expect(areDataEqual({ foo: 0 }, { foo: -0 }, { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
});

test('areDataEqual containing object instances', () => {
  const areNonPlainObjectsEqual: AreNonPlainObjectsEqual = ((o1, o2) => {
    if (o1 instanceof Date && o2 instanceof Date) {
      return o1.getTime() === o2.getTime();
    }
    throw new Error();
  });

  expect(areDataEqual(new Date(), new Date(), { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
});

test('areObjectsEquivalent', () => {
  const areNonPlainObjectsEqual: AreNonPlainObjectsEqual = () => { throw new Error() };

  expect(
    arePlainObjectsEqual(
      { b: null, c: { d: 1, e: "world" }, a: "foo" },
      { a: "foo", b: null, c: { e: "world", d: 1 } },
      { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true }
    )
  ).toBeTruthy();

  expect(
    arePlainObjectsEqual(
      { b: null, c: { d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" }, a: "foo" },
      { a: "foo", b: null, c: { e: "world", d: [{d: 4, c: 3}, 1, 0, 2, 5] } },
      { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true }
    )
  ).toBeTruthy();

  expect(arePlainObjectsEqual({ foo: 0 }, { foo: -0 }, { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
});

test('areArraysEqual', () => {
  const areNonPlainObjectsEqual: AreNonPlainObjectsEqual = () => { throw new Error() };

  expect(
    areArraysEqual(
      [2, 1, 1],
      [2, 1, 2],
      { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true }
    )
  ).toBeFalsy();

  expect(
    areArraysEqual(
      [{ b: null, c: { d: 1, e: "world" }, a: "foo" }, "foo"],
      ["foo", { a: "foo", b: null, c: { e: "world", d: 1 } }],
      { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true }
    )
  ).toBeTruthy();

  expect(
    areArraysEqual(
      [1, { b: null, c: { d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" }, a: "foo" }],
      [{ a: "foo", b: null, c: { e: "world", d: [{d: 4, c: 3}, 1, 0, 2, 5] } }, 1],
      { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true }
    )
  ).toBeTruthy();

  expect(areArraysEqual([0], [-0], { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true })).toBeTruthy();
});

test('areArraysEqual containing object instances', () => {
  const date1 = new Date('December 17, 1995 03:24:00');
  const date2 = new Date('December 17, 1995 03:24:00');
  const date3 = new Date('December 18, 1995 03:24:00');

  const areNonPlainObjectsEqual: AreNonPlainObjectsEqual = ((o1, o2) => {
    if (o1 instanceof Date && o2 instanceof Date) {
      return o1.getTime() === o2.getTime();
    }
    throw new Error();
  });

  expect(
    arePlainObjectsEqual(
      { date: date1, dates: [date3, date2, date1] },
      { date: date2, dates: [date1, date3, date2] },
      { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true }
    )
  ).toBeTruthy();

  expect(
    areArraysEqual(
      [1, 1, 2],
      [1, 1, 2],
      { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true }
    )
  ).toBeTruthy();

  deepFreezePlain([1, { b: null, c: { d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" }, a: "foo" }]);
});

test('hasProperties', () => {
  expect(hasProperties({ foo: 1, bar: 2 }, ['foo'])).toBeTruthy();
  expect(hasProperties({ foo: 1, bar: 2 }, ['bar'])).toBeTruthy();
  expect(hasProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toBeTruthy();
  expect(hasProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toBeFalsy();
  expect(hasProperties({ foo: 1, bar: 2 }, ['foo', 'foo'])).toBeTruthy();
});

test('pickProperties using whitelist of props', () => {
  expect(pickProperties({ foo: 1, bar: 2 }, ['foo'])).toEqual({ foo: 1 });
  expect(pickProperties({ foo: 1, bar: 2 }, ['bar'])).toEqual({ bar: 2 });
  expect(pickProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toEqual({ foo: 1, bar: 2 });
  expect(pickProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toEqual({ foo: 1, bar: 2 });
  expect(pickProperties({ foo: 1, bar: 2 }, ['foo', 'foo'])).toEqual({ foo: 1 });
});

test('pickProperties using function', () => {
  expect(pickProperties<number>({ foo: 1, bar: 2 }, (_key, val) => val < 2)).toEqual({ foo: 1 });
  expect(pickProperties<number>({ foo: 3, bar: 2 }, (_key, val) => val < 2)).toEqual({});
});

test('omitProperties using whitelist of props', () => {
  expect(omitProperties({ foo: 1, bar: 2 }, ['foo'])).toEqual({ bar: 2 });
  expect(omitProperties({ foo: 1, bar: 2 }, ['bar'])).toEqual({ foo: 1 });
  expect(omitProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toEqual({});
  expect(omitProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toEqual({});
  expect(omitProperties({ foo: 1, bar: 2 }, ['foo', 'foo'])).toEqual({ bar: 2 });
  expect(omitProperties({ foo: 1, bar: 2 }, ['baz'])).toEqual({ foo: 1, bar: 2 });
});

test('omitProperties using function', () => {
  expect(omitProperties<number>({ foo: 1, bar: 2 }, (_key, val) => val < 2)).toEqual({ bar: 2 });
  expect(omitProperties<number>({ foo: 3, bar: 2 }, (_key, val) => val < 2)).toEqual({ foo: 3, bar: 2 });
  expect(omitProperties<number>({ foo: 3, bar: 2 }, (_key, val) => val > 1)).toEqual({});
});

test('partitionProperties using whitelist of props', () => {
  expect(partitionProperties({ foo: 1, bar: 2 }, ['foo'])).toEqual({ picked: { foo: 1 }, omitted: { bar: 2 }, missingKeys: [] });
  expect(partitionProperties({ foo: 1, bar: 2 }, ['bar'])).toEqual({ picked: { bar: 2 }, omitted: { foo: 1 }, missingKeys: [] });
  expect(partitionProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toEqual({ picked: { foo: 1, bar: 2 }, omitted: {}, missingKeys: [] });
  expect(partitionProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toEqual({ picked: { foo: 1, bar: 2 }, omitted: {}, missingKeys: ['baz'] });
  expect(partitionProperties({ foo: 1, bar: 2 }, ['baz'])).toEqual({ picked: {}, omitted: { foo: 1, bar: 2 }, missingKeys: ['baz'] });
});

test('partitionProperties using function', () => {
  expect(partitionProperties<number>({ foo: 1, bar: 2 }, (_key, val) => val < 2)).toEqual({ picked: { foo: 1 }, omitted: { bar: 2 }, missingKeys: [] });
  expect(partitionProperties<number>({ foo: 3, bar: 2 }, (_key, val) => val < 2)).toEqual({picked: {}, omitted: { foo: 3, bar: 2 }, missingKeys: [] });
});

test('isEmptyArray', () => {
  expect(isEmptyArray([])).toBeTruthy();
  expect(isEmptyArray([1])).toBeFalsy();
  expect(isEmptyArray(null)).toBeFalsy();
  expect(isEmptyArray(undefined)).toBeFalsy();
  expect(isEmptyArray(1)).toBeFalsy();
});

test('isPrimitive', () => {
  expect(isPrimitive([])).toBeFalsy();
  expect(isPrimitive({})).toBeFalsy();
  expect(isPrimitive(new Date())).toBeFalsy();
  expect(isPrimitive(null)).toBeTruthy();
  expect(isPrimitive(undefined)).toBeTruthy();
  expect(isPrimitive(1)).toBeTruthy();
  expect(isPrimitive(new Number(1))).toBeFalsy();
  expect(isPrimitive('foo')).toBeTruthy();
  expect(isPrimitive(new String('foo'))).toBeFalsy();
  expect(isPrimitive(false)).toBeTruthy();
  expect(isPrimitive(new Boolean(false))).toBeFalsy();
  expect(isPrimitive(true)).toBeTruthy();
  expect(isPrimitive(new Boolean(true))).toBeFalsy();
});

test('isPrimitiveWrapper', () => {
  expect(isPrimitiveWrapper('foo')).toBeFalsy();
  expect(isPrimitiveWrapper(false)).toBeFalsy();
  expect(isPrimitiveWrapper(5)).toBeFalsy();
  expect(isPrimitiveWrapper(String('foo'))).toBeFalsy();
  expect(isPrimitiveWrapper(Boolean(false))).toBeFalsy();
  expect(isPrimitiveWrapper(Number(5))).toBeFalsy();
  expect(isPrimitiveWrapper(new String('foo'))).toBeTruthy();
  expect(isPrimitiveWrapper(new Boolean(false))).toBeTruthy();
  expect(isPrimitiveWrapper(new Number(5))).toBeTruthy();
});

test('unboxPrimitiveWrapper', () => {
  expect(unboxPrimitiveWrapper([])).toEqual([]);
  expect(unboxPrimitiveWrapper({})).toEqual({});
  expect(unboxPrimitiveWrapper('foo')).toBe('foo');
  expect(unboxPrimitiveWrapper(false)).toBe(false);
  expect(unboxPrimitiveWrapper(5)).toBe(5);
  expect(unboxPrimitiveWrapper(new String('foo'))).toBe('foo');
  expect(unboxPrimitiveWrapper(new Boolean(false))).toBe(false);
  expect(unboxPrimitiveWrapper(new Number(5))).toBe(5);
});

test('isArrayWhereEvery', () => {
  expect(isArrayWhereEvery([[], []], isEmptyArray)).toBeTruthy();
  expect(isArrayWhereEvery([], isEmptyArray)).toBeTruthy();
  expect(isArrayWhereEvery([{ foo: 1 }, { bar: 2 }], isPlainObject)).toBeTruthy();
  expect(isArrayWhereEvery([{ foo: 1 }, new Date()], isPlainObject)).toBeFalsy();
});

test('isObjectLiteralWhereEvery', () => {
  expect(isPlainObjectWhereEvery([[], []], isEmptyArray)).toBeFalsy();
  expect(isPlainObjectWhereEvery({ foo: [], bar: [] }, isEmptyArray)).toBeTruthy();
  expect(isPlainObjectWhereEvery({}, isEmptyPlainObject)).toBeTruthy();
  expect(isPlainObjectWhereEvery({ foo: { a: 1 }, bar: { b: 2 } }, isPlainObject)).toBeTruthy();
});

test('isPlainObject', () => {
  expect(isPlainObject([])).toBeFalsy();
  expect(isPlainObject({})).toBeTruthy();
  expect(isPlainObject(Object.create(null))).toBeTruthy();
  expect(isPlainObject(1)).toBeFalsy();
  expect(isPlainObject('foo')).toBeFalsy();
  expect(isPlainObject(true)).toBeFalsy();
  expect(isPlainObject(false)).toBeFalsy();
  expect(isPlainObject(new Date())).toBeFalsy();
  expect(isPlainObject(new Number(1))).toBeFalsy();
  expect(isPlainObject(new String('foo'))).toBeFalsy();
  expect(isPlainObject(new Boolean(false))).toBeFalsy();
});

test('isEmptyPlainObject', () => {
  expect(isEmptyPlainObject({})).toBeTruthy();
  expect(isEmptyPlainObject([])).toBeFalsy();
  expect(isEmptyPlainObject({ foo: 1 })).toBeFalsy();
  expect(isEmptyPlainObject(new Date())).toBeFalsy();
});

test('removeArrayElementByIndex', () => {
  expect(removeArrayElementByIndex([1, 2, 3], 1)).toEqual([1, 3]);
  expect(removeArrayElementByIndex([], 1)).toEqual([]);
  expect(removeArrayElementByIndex([1, 2, 3], 5)).toEqual([1, 2, 3]);
});

test('removeArrayElement', () => {
  expect(removeArrayElement([1, 2, 3, 1], 1)).toEqual([2, 3, 1]);
  expect(removeArrayElement([], 1)).toEqual([]);
  expect(removeArrayElement([1, 2, 3], 5)).toEqual([1, 2, 3]);
  expect(removeArrayElement([1, 2, 3, 1], (e) => e === 1)).toEqual([2, 3, 1]);
  expect(removeArrayElement([], (e) => e === 1)).toEqual([]);
  expect(removeArrayElement([1, 2, 3], (e) => e === 5)).toEqual([1, 2, 3]);
});

test('removeArrayElements', () => {
  expect(removeArrayElements([1, 2, 3, 1], [1, 2])).toEqual([3, 1]);
  expect(removeArrayElements([1, 2, 3, 1], [2, 1, 1])).toEqual([3]);
  expect(removeArrayElements([1, 2, 3, 1], [2, 2, 1, 1, 1])).toEqual([3]);
  expect(removeArrayElements([1], [])).toEqual([1]);
  expect(removeArrayElements([], [1])).toEqual([]);
  expect(removeArrayElements([], [])).toEqual([]);
  expect(removeArrayElements([1, 2, 3], [5, 6])).toEqual([1, 2, 3]);
});

test('toSortedObject', () => {
  expect(Object.keys(toSortedObject({ b: 2, a: 1, c: 3 }))).not.toEqual(['b', 'a', 'c']);
  expect(Object.keys(toSortedObject({ b: 2, a: 1, c: 3 }))).toEqual(['a', 'b', 'c']);
});

test('range', () => {
  expect(range({ count: 2 })).toEqual([0, 1]);
  expect(range({ endInclusive: 2 })).toEqual([0, 1, 2]);
  expect(range({ endExclusive: 2 })).toEqual([0, 1]);
  expect(range({ start: 5, count: 2 })).toEqual([5, 6]);
  expect(range({ start: 5, endInclusive: 7 })).toEqual([5, 6, 7]);
  expect(range({ start: 5, endInclusive: 5 })).toEqual([5]);
  expect(range({ start: 5, endExclusive: 7 })).toEqual([5, 6]);
});

test('repeat', () => {
  expect(repeat(2, 3)).toEqual([2, 2, 2]);
  expect(repeat(['foo', 0], 3)).toEqual([['foo', 0], ['foo', 0], ['foo', 0]]);
  expect(repeat({ num: 1 }, 2, (value, i) => ({ ...value, id: i + 1 }))).toEqual([{ num: 1, id: 1 }, { num: 1, id: 2 }]);
});

test('differencePrimitives', () => {
  expect(differencePrimitives([2], [2])).toEqual([]);
  expect(differencePrimitives([2], [3])).toEqual([2]);
  expect(differencePrimitives([1, 2, 3, 9], [1, 3, 4])).toEqual([2, 9]);
  expect(differencePrimitives(['foo'], ['bar', 'foo'])).toEqual([]);
  expect(differencePrimitives(['bar', 'foo'], ['foo'])).toEqual(['bar']);
});

test('unique', () => {
  expect(unique([5, 1, 2, 1, 4, '1'])).toEqual([5, 1, 2, 4, '1']);
  expect(unique([{ x: 2 }, { x: 2 }])).toEqual([{ x: 2 }, { x: 2 }]);

  expect(unique(
    [{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 1 }],
    ({ x }) => x
  )).toEqual(
    [{ x: 2, y: 1 }, { x: 1, y: 2 }]
  );
});

test('deepClonePlain', () => {
  expect(deepClonePlain(null)).toEqual(null);
  expect(deepClonePlain('foo')).toEqual('foo');

  const o = [1, { b: null, c: { d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" }, a: "foo" }] as const;
  const clonedO = deepClonePlain(o);

  expect(o[1].b).toBe(null);
  expect(clonedO[1].b).toBe(null);

  expect(o[1].a).toBe('foo');
  expect(clonedO[1].a).toBe('foo');

  expect(o[1].c).toEqual({ d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" });
  expect(clonedO[1].c).toEqual({ d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" });

  expect(o === clonedO).toBeFalsy();
  expect(o[1] === clonedO[1]).toBeFalsy();
  expect(o[1].c === clonedO[1].c).toBeFalsy();
  expect(o[1].c.d === clonedO[1].c.d).toBeFalsy();
});

test('makeCopyOnWriteObjectSetter, copy-on-write semantics', () => {
  const base = { a: 1, b: 2 };
  const set  = makeCopyOnWriteObjectSetter(base);

  const r0 = set('a', 1);
  expect(r0).toBe(base);

  const r1 = set('a', 42);
  expect(r1).not.toBe(base);
  expect(r1).toEqual({ a: 42, b: 2 });

  const r2 = set('b', 99);
  expect(r2).toBe(r1);
  expect(r2).toEqual({ a: 42, b: 99 });

  const r3 = set('b', 99);
  expect(r3).toBe(r2);
});

test('makeCopyOnWriteObjectSetter, shallow clone only', () => {
  const base = { a: { x: 1 }, b: 2 };
  const set  = makeCopyOnWriteObjectSetter(base);

  const updated = set('b', 3);

  expect(updated).not.toBe(base);
  expect(updated.a).toBe(base.a);
});
