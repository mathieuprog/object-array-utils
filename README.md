# `object-array-utils`

`object-array-utils` is a JavaScript library offering utilities for advanced array and object manipulation.

```javascript
import { isPlainObject } from 'object-array-utils';

isPlainObject({ prop: 1 }) // true
isPlainObject(new Date()) // false
isPlainObject([1]) // false

import { isEmptyPlainObject } from 'object-array-utils';

isEmptyPlainObject({}) // true
isEmptyPlainObject(new Date()) // false
isEmptyPlainObject([]) // false

import { isArray } from 'object-array-utils';

isArray([1]) // true

import { isEmptyArray } from 'object-array-utils';

isEmptyArray([]) // true

import { isNullish } from 'object-array-utils';

isNullish(null) // true
isNullish(undefined) // true

import { hasProperty } from 'object-array-utils';

hasProperty({ prop: 1 }, 'prop') // true

import { hasProperties } from 'object-array-utils';

hasProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop2']) // true

import { pickProperties } from 'object-array-utils';

pickProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop3']) // { prop1: 1 }
pickProperties<number>({ prop1: 1, prop2: 2 }, (_key, val) => val < 2) // { prop1: 1 }

import { omitProperties } from 'object-array-utils';

omitProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop3']) // { prop2: 2 }
omitProperties<number>({ prop1: 1, prop2: 2 }, (_key, val) => val < 2) // { prop2: 2 }

import { partitionProperties } from 'object-array-utils';

partitionProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop3']) // { picked: { prop1: 1 }, omitted: { prop2: 2 }, missingKeys: ['prop3'] }
partitionProperties<number>({ prop1: 1, prop2: 2 }, (_key, val) => val < 2) // { picked: { prop1: 1 }, omitted: { prop2: 2 }, missingKeys: [] }

import { toSortedObject } from 'object-array-utils';

toSortedObject({ prop2: 2, prop1: 1 }) // { prop1: 1, prop2: 2 }

import { removeArrayElement } from 'object-array-utils';

removeArrayElement([1, 1, 2, 3], 1) // [1, 2, 3]
removeArrayElement([1, 1, 2, 3], (e) => e === 1) // [1, 2, 3]

import { removeArrayElementByIndex } from 'object-array-utils';

removeArrayElementByIndex([1, 2, 3], 1) // [1, 3]

import { removeArrayElements } from 'object-array-utils';

removeArrayElements([1, 1, 2, 3], [1, 2]) // [1, 3]
removeArrayElements([1, 1, 2, 3], [1, 2, 1]) // [3]

import { isPlainObjectSubset } from 'object-array-utils';

isPlainObjectSubset({ prop1: 1, prop2: 2 }, { prop1: 1 }) // true
isPlainObjectSubset({ prop1: { foo: 1, bar: 2 } }, prop2: 2 }, { prop1: { bar: 2 } }) // true
isPlainObjectSubset({ prop1: [1, 2], prop2: 2 }, { prop1: [2] }) // true

import { isArraySubset } from 'object-array-utils';

isArraySubset([1, 2], [1]) // true
isArraySubset([1, { foo: 1, bar: 2 }], [{ bar: 2 }]) // true

import { arePlainObjectsEqual, type AreNonPlainObjectsEqual } from 'object-array-utils';

const areNonPlainObjectsEqual: AreNonPlainObjectsEqual = ((o1, o2) => {
  if (o1 instanceof Date && o2 instanceof Date) return o1.getTime() === o2.getTime();
  throw new Error();
});
const opts = { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true };
arePlainObjectsEqual({ prop1: 1, prop2: 2 }, { prop2: 2, prop1: 1 }, opts) // true

import { areArraysEqual, type AreNonPlainObjectsEqual } from 'object-array-utils';

const opts = { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true };
areArraysEqual([1, { prop1: 1, prop2: 2 }], [{ prop2: 2, prop1: 1 }, 1], opts) // true

import { areDataEqual } from 'object-array-utils';

const opts = { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true };
areDataEqual(new Date(), new Date(), opts) // true

import { deepClonePlain } from 'object-array-utils';

deepClonePlain({ foo: [{ bar: 1 }] })

import { deepFreezePlain } from 'object-array-utils';

deepFreezePlain({ foo: 1 })

import { isPrimitive } from 'object-array-utils';

// https://developer.mozilla.org/docs/Glossary/Primitive
isPrimitive(null) // true
isPrimitive(undefined) // true
isPrimitive(1) // true
isPrimitive('foo') // true
isPrimitive(Symbol('foo')) // true
isPrimitive(false) // true
isPrimitive([]) // false
isPrimitive({}) // false
isPrimitive(new Number(1)) // false
isPrimitive((x) => x) // false

import { isPrimitiveWrapper } from 'object-array-utils';

isPrimitiveWrapper(new Number(5)) // true
isPrimitiveWrapper(Number(5)) // false
isPrimitiveWrapper(5) // false

import { unboxPrimitiveWrapper } from 'object-array-utils';

unboxPrimitiveWrapper(new Number(5)) // 5
unboxPrimitiveWrapper(5) // 5

import { isArrayWhereEvery, isPlainObject } from 'object-array-utils';

isArrayWhereEvery([{ foo: 1 }, { bar: 2 }], isPlainObject) // true
isArrayWhereEvery([{ foo: 1 }, new Date()], isPlainObject) // false
isArrayWhereEvery([], isPlainObject) // false

import { isPlainObjectWhereEvery, isArray } from 'object-array-utils';

isPlainObjectWhereEvery({ foo: [1], bar: [2, 3] }, isArray) // true
isPlainObjectWhereEvery({}, isArray) // false

import { differencePrimitives } from 'object-array-utils';

differencePrimitives([1, 2, 3, 9], [1, 3, 4]) // [2, 9]

import { repeat } from 'object-array-utils';

repeat(1, 3) // [1, 1, 1]
repeat(1, 3, (value, i) => value + 1) // [1, 2, 3]
repeat({ name: 'John' }, 2, (v, i) => ({ id: i + 1, ...v }))  // [{ id: 1, name: 'John' }, { id: 2, name: 'John' }]

import { range } from 'object-array-utils';

range({ count: 2 }) // [0, 1]
range({ endInclusive: 2 }) // [0, 1, 2]
range({ endExclusive: 2 }) // [0, 1]
range({ start: 5, count: 2 }) // [5, 6]
range({ start: 5, endInclusive: 7 }) // [5, 6, 7]
range({ start: 5, endInclusive: 5 }) // [5]
range({ start: 5, endExclusive: 7 }) // [5, 6]

import { unique } from 'object-array-utils';

unique([1, 1, 2]) // [1, 2]
unique(
  [{ name: 'John', age: 27 }, { name: 'James', age: 42 }, { name: 'Joe', age: 27 }],
  ({ age }) => age
)  // [{ name: 'John', age: 27 }, { name: 'James', age: 42 }]

import { makeCopyOnWriteObjectSetter } from 'object-array-utils';

const base = { a: 1, b: 2 };
const set  = makeCopyOnWriteObjectSetter(base);

// No-op: same value ⇒ original reference
set('a', 1) === base; // true

// First real update ⇒ shallow-clone
const draft = set('a', 42);
draft // { a: 42, b: 2 }
base  // { a: 1,  b: 2 }

// Further updates mutate the same draft
set('b', 99) === draft; // true

import { hasArrayDuplicates } from 'object-array-utils';

hasArrayDuplicates([1, 2, 3]) // false
hasArrayDuplicates([1, 2, 1]) // true
hasArrayDuplicates(
  [{ name: 'John', age: 27 }, { name: 'James', age: 42 }, { name: 'Joe', age: 27 }],
  ({ age }) => age
) // true

## Limitations

`isObjectSubset` and `isArraySubset` may result into false negatives when dealing with arrays of object literals. For example:

```javascript
const opts = { areNonPlainObjectsEqual, unboxPrimitives: true, unorderedArrays: true };
isArraySubset([{ foo: 1 }, { bar: 2 }], [{}, { bar: 2 }], opts) // true
isArraySubset([{ foo: 1 }, { bar: 2 }], [{}, { foo: 1 }], opts) // false
```

## Installation

You can get `object-array-utils` via [npm](http://npmjs.com).

```bash
$ npm install object-array-utils --save
```
