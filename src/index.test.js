import {
  areArraysEqual,
  areObjectsEqual,
  deepFreeze,
  filterProperties,
  hasObjectProperties,
  isArrayOfPrimitives,
  isArrayOfType,
  isArrayWhereEvery,
  isEmptyArray,
  isEmptyObjectLiteral,
  isObjectLiteral,
  isObjectLiteralWhereEvery,
  isPrimitive,
  removeArrayElement,
  removeArrayElementByIndex,
  takeProperties
} from './index';

test('areObjectsEqual', () => {
  expect(
    areObjectsEqual(
      { b: null, c: { d: 1, e: "world" }, a: "foo" },
      { a: "foo", b: null, c: { e: "world", d: 1 } }
    )
  ).toBeTruthy();

  expect(
    areObjectsEqual(
      { b: null, c: { d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" }, a: "foo" },
      { a: "foo", b: null, c: { e: "world", d: [{d: 4, c: 3}, 1, 0, 2, 5] } }
    )
  ).toBeTruthy();
});

test('areArraysEqual', () => {
  expect(
    areArraysEqual(
      [2, 1, 1],
      [2, 1, 2]
    )
  ).toBeFalsy();

  expect(
    areArraysEqual(
      [{ b: null, c: { d: 1, e: "world" }, a: "foo" }, "foo"],
      ["foo", { a: "foo", b: null, c: { e: "world", d: 1 } }]
    )
  ).toBeTruthy();

  expect(
    areArraysEqual(
      [1, { b: null, c: { d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" }, a: "foo" }],
      [{ a: "foo", b: null, c: { e: "world", d: [{d: 4, c: 3}, 1, 0, 2, 5] } }, 1]
    )
  ).toBeTruthy();

  const date1 = new Date('December 17, 1995 03:24:00');
  const date2 = new Date('December 17, 1995 03:24:00');
  const date3 = new Date('December 18, 1995 03:24:00');

  expect(
    areObjectsEqual(
      { date: date1, dates: [date3, date2, date1] },
      { date: date2, dates: [date1, date3, date2] }
    )
  ).toBeTruthy();

  expect(
    areArraysEqual(
      [1, 1, 2],
      [1, 1, 2]
    )
  ).toBeTruthy();

  deepFreeze([1, { b: null, c: { d: [2, 5, 1, 0, {c: 3, d: 4}], e: "world" }, a: "foo" }]);
});

test('hasObjectProperties', () => {
  expect(hasObjectProperties({ foo: 1, bar: 2 }, ['foo'])).toBeTruthy();
  expect(hasObjectProperties({ foo: 1, bar: 2 }, ['bar'])).toBeTruthy();
  expect(hasObjectProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toBeTruthy();
  expect(hasObjectProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toBeFalsy();
  expect(hasObjectProperties({ foo: 1, bar: 2 }, ['foo', 'foo'])).toBeTruthy();
});

test('filterProperties using whitelist of props', () => {
  expect(filterProperties({ foo: 1, bar: 2 }, ['foo'])).toEqual({ foo: 1 });
  expect(filterProperties({ foo: 1, bar: 2 }, ['bar'])).toEqual({ bar: 2 });
  expect(filterProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toEqual({ foo: 1, bar: 2 });
  expect(filterProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toEqual({ foo: 1, bar: 2 });
  expect(filterProperties({ foo: 1, bar: 2 }, ['foo', 'foo'])).toEqual({ foo: 1 });
  expect(filterProperties({ foo: 1, foo: 2, bar: 3 }, ['foo'])).toEqual({ foo: 1, foo: 2 });
});

test('filterProperties using function', () => {
  expect(filterProperties({ foo: 1, bar: 2 }, (_key, val) => val < 2)).toEqual({ foo: 1 });
  expect(filterProperties({ foo: 3, bar: 2 }, (_key, val) => val < 2)).toEqual({});
});

test('takeProperties using whitelist of props', () => {
  expect(takeProperties({ foo: 1, bar: 2 }, ['foo'])).toEqual({ filtered: { foo: 1 }, rejected: { bar: 2 }, undefined: {} });
  expect(takeProperties({ foo: 1, bar: 2 }, ['bar'])).toEqual({ filtered: { bar: 2 }, rejected: { foo: 1 }, undefined: {} });
  expect(takeProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toEqual({ filtered: { foo: 1, bar: 2 }, rejected: {}, undefined: {} });
  expect(takeProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toEqual({ filtered: { foo: 1, bar: 2 }, rejected: {}, undefined: { baz: undefined } });
  expect(takeProperties({ foo: 1, bar: 2 }, ['baz'])).toEqual({ filtered: {}, rejected: { foo: 1, bar: 2 }, undefined: { baz: undefined } });
  expect(takeProperties({ foo: 1, foo: 2, bar: 3 }, ['foo'])).toEqual({ filtered: { foo: 1, foo: 2 }, rejected: { bar: 3 }, undefined: {} });
});

test('takeProperties using function', () => {
  expect(takeProperties({ foo: 1, bar: 2 }, (_key, val) => val < 2)).toEqual({ filtered: { foo: 1 }, rejected: { bar: 2 }, undefined: {} });
  expect(takeProperties({ foo: 3, bar: 2 }, (_key, val) => val < 2)).toEqual({filtered: {}, rejected: { foo: 3, bar: 2 }, undefined: {} });
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
  expect(isPrimitive(Symbol('foo'))).toBeTruthy();
  expect(isPrimitive(false)).toBeTruthy();
  expect(isPrimitive(new Boolean(false))).toBeFalsy();
  expect(isPrimitive(true)).toBeTruthy();
  expect(isPrimitive(new Boolean(true))).toBeFalsy();
});

test('isArrayOfPrimitives', () => {
  expect(isArrayOfPrimitives([])).toBeFalsy();
  expect(isArrayOfPrimitives([{}])).toBeFalsy();
  expect(isArrayOfPrimitives([[]])).toBeFalsy();
  expect(isArrayOfPrimitives([false])).toBeTruthy();
  expect(isArrayOfPrimitives([false, 'foo', 1])).toBeTruthy();
  expect(isArrayOfPrimitives([false, new String('foo'), 1])).toBeFalsy();
  expect(isArrayOfPrimitives(1)).toBeFalsy();
});

test('isArrayOfType', () => {
  expect(isArrayOfType([], 'string')).toBeFalsy();
  expect(isArrayOfType([{}], 'string')).toBeFalsy();
  expect(isArrayOfType(['foo', 'bar'], 'string')).toBeTruthy();
  expect(isArrayOfType(['foo', 'bar'], 'number')).toBeFalsy();
  expect(isArrayOfType([1, 2], 'number')).toBeTruthy();
  expect(isArrayOfType([1, 'bar'], 'number')).toBeFalsy();
  expect(isArrayOfType(['foo', 1], 'string')).toBeFalsy();
});

test('isArrayWhereEvery', () => {
  expect(isArrayWhereEvery([[], []], isEmptyArray)).toBeTruthy();
  expect(isArrayWhereEvery([], isEmptyArray)).toBeFalsy();
  expect(isArrayWhereEvery([{ foo: 1 }, { bar: 2 }], isObjectLiteral)).toBeTruthy();
  expect(isArrayWhereEvery([{ foo: 1 }, new Date()], isObjectLiteral)).toBeFalsy();
});

test('isObjectLiteralWhereEvery', () => {
  expect(isObjectLiteralWhereEvery([[], []], isEmptyArray)).toBeFalsy();
  expect(isObjectLiteralWhereEvery({ foo: [], bar: [] }, isEmptyArray)).toBeTruthy();
  expect(isObjectLiteralWhereEvery({}, isEmptyObjectLiteral)).toBeFalsy();
  expect(isObjectLiteralWhereEvery({ foo: { a: 1 }, bar: { b: 2 } }, isObjectLiteral)).toBeTruthy();
});

test('isEmptyObjectLiteral', () => {
  expect(isEmptyObjectLiteral({})).toBeTruthy();
  expect(isEmptyObjectLiteral([])).toBeFalsy();
  expect(isEmptyObjectLiteral({ foo: 1 })).toBeFalsy();
  expect(isEmptyObjectLiteral(new Date())).toBeFalsy();
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
