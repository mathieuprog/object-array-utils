import { areArraysEqual, areObjectsEqual, deepFreeze, hasObjectProps } from './index';

test('object equality', () => {
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

test('array equality', () => {
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

test('object has props', () => {
  expect(hasObjectProps({ foo: 1, bar: 2 }, ['foo'])).toBeTruthy();
  expect(hasObjectProps({ foo: 1, bar: 2 }, ['bar'])).toBeTruthy();
  expect(hasObjectProps({ foo: 1, bar: 2 }, ['bar', 'foo'])).toBeTruthy();
  expect(hasObjectProps({ foo: 1, bar: 2 }, ['bar', 'foo', 'baz'])).toBeFalsy();
});
