import {
  areArraysEqual,
  areObjectsEqual,
  deepFreeze,
  filterProperties,
  hasObjectProperties,
  isArrayOfPrimitives,
  isEmptyArray,
  isPrimitive,
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
});

test('filterProperties using whitelist of props', () => {
  expect(filterProperties({ foo: 1, bar: 2 }, ['foo'])).toEqual({ foo: 1 });
  expect(filterProperties({ foo: 1, bar: 2 }, ['bar'])).toEqual({ bar: 2 });
  expect(filterProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toEqual({ foo: 1, bar: 2 });
  expect(filterProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toEqual({ foo: 1, bar: 2 });
});

test('filterProperties using function', () => {
  expect(filterProperties({ foo: 1, bar: 2 }, (_key, val) => val < 2)).toEqual({ foo: 1 });
  expect(filterProperties({ foo: 3, bar: 2 }, (_key, val) => val < 2)).toEqual({});
});

test('takeProperties using whitelist of props', () => {
  expect(takeProperties({ foo: 1, bar: 2 }, ['foo'])).toEqual({ filtered: { foo: 1 }, rejected: { bar: 2 } });
  expect(takeProperties({ foo: 1, bar: 2 }, ['bar'])).toEqual({ filtered: { bar: 2 }, rejected: { foo: 1 } });
  expect(takeProperties({ foo: 1, bar: 2 }, ['bar', 'foo'])).toEqual({ filtered: { foo: 1, bar: 2 }, rejected: {} });
  expect(takeProperties({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toEqual({ filtered: { foo: 1, bar: 2 }, rejected: {} });
  expect(takeProperties({ foo: 1, bar: 2 }, ['baz'])).toEqual({ filtered: {}, rejected: { foo: 1, bar: 2 } });
});

test('takeProperties using function', () => {
  expect(takeProperties({ foo: 1, bar: 2 }, (_key, val) => val < 2)).toEqual({ filtered: { foo: 1 }, rejected: { bar: 2 } });
  expect(takeProperties({ foo: 3, bar: 2 }, (_key, val) => val < 2)).toEqual({filtered: {}, rejected: { foo: 3, bar: 2 } });
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
