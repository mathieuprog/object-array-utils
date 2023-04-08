# `object-array-utils`

`object-array-utils` allows to check the type of an object or an array.

```javascript
import { isObjectLiteral } from 'object-array-utils';

isObjectLiteral({ prop: 1 }) // true
isObjectLiteral(new Date()) // false
isObjectLiteral([1]) // false

import { isEmptyObjectLiteral } from 'object-array-utils';

isEmptyObjectLiteral({}) // true
isEmptyObjectLiteral(new Date()) // false
isEmptyObjectLiteral([]) // false

import { isObjectInstance } from 'object-array-utils';

isObjectInstance({ prop: 1 }) // false
isObjectInstance(new Date()) // true
isObjectInstance([1]) // false

import { isObject } from 'object-array-utils';

isObject({ prop: 1 }) // true
isObject(new Date()) // true
isObject([1]) // false

import { isArray } from 'object-array-utils';

isArray([1]) // true

import { isEmptyArray } from 'object-array-utils';

isEmptyArray([]) // true

import { isArrayOfObjects } from 'object-array-utils';

isArrayOfObjects([{ prop: 1 }, new Date()]) // true
isArrayOfObjects([1]) // false
isArrayOfObjects([]) // false

import { isArrayOfObjectLiterals } from 'object-array-utils';

isArrayOfObjectLiterals([{ prop: 1 }, { prop: 2 }]) // true
isArrayOfObjectLiterals([{ prop: 1 }, new Date()]) // false
isArrayOfObjectLiterals([1]) // false
isArrayOfObjectLiterals([]) // false

import { isNullOrUndefined } from 'object-array-utils';

isNullOrUndefined(null) // true
isNullOrUndefined(undefined) // true

import { hasProperty } from 'object-array-utils';

hasProperty({ prop: 1 }, 'prop') // true

import { hasProperties } from 'object-array-utils';

hasProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop2']) // true

import { filterProperties } from 'object-array-utils';

filterProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop3']) // { prop1: 1 }
filterProperties({ prop1: 1, prop2: 2 }, (_key, val) => val < 2) // { prop1: 1 }

import { rejectProperties } from 'object-array-utils';

rejectProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop3']) // { prop2: 2 }
rejectProperties({ prop1: 1, prop2: 2 }, (_key, val) => val < 2) // { prop2: 2 }

import { takeProperties } from 'object-array-utils';

takeProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop3']) // { filtered: { prop1: 1 }, rejected: { prop2: 2 } }
takeProperties({ prop1: 1, prop2: 2 }, (_key, val) => val < 2) // { filtered: { prop1: 1 }, rejected: { prop2: 2 } }

import { sortProperties } from 'object-array-utils';

sortProperties({ prop2: 2, prop1: 1 }) // { prop1: 1, prop2: 2 }

import { removeArrayElement } from 'object-array-utils';

removeArrayElement([1, 1, 2, 3], 1) // [1, 2, 3]
removeArrayElement([1, 1, 2, 3], (e) => e === 1) // [1, 2, 3]

import { removeArrayElementByIndex } from 'object-array-utils';

removeArrayElementByIndex([1, 2, 3], 1) // [1, 3]

import { removeArrayElements } from 'object-array-utils';

removeArrayElements([1, 1, 2, 3], [1, 2]) // [1, 3]
removeArrayElements([1, 1, 2, 3], [1, 2, 1]) // [3]

import { isObjectSubset } from 'object-array-utils';

isObjectSubset({ prop1: 1, prop2: 2 }, { prop1: 1 }) // true
isObjectSubset({ prop1: { foo: 1, bar: 2 } }, prop2: 2 }, { prop1: { bar: 2 } }) // true
isObjectSubset({ prop1: [1, 2], prop2: 2 }, { prop1: [2] }) // true

import { isArraySubset } from 'object-array-utils';

isArraySubset([1, 2], [1]) // true
isArraySubset([1, { foo: 1, bar: 2 }], [{ bar: 2 }]) // true

import { areObjectsEqual } from 'object-array-utils';

areObjectsEqual({ prop1: 1, prop2: 2 }, { prop2: 2, prop1: 1 }) // true

import { areArraysEqual } from 'object-array-utils';

areArraysEqual([1, { prop1: 1, prop2: 2 }], [{ prop2: 2, prop1: 1 }, 1]) // true

import { areValuesEqual } from 'object-array-utils';

areValuesEqual(new Date(), new Date()) // true

import { deepFreeze } from 'object-array-utils';

deepFreeze({ foo: 1 })

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

import { isArrayOfPrimitives } from 'object-array-utils';

isArrayOfPrimitives([1, 'foo']) // true
isArrayOfPrimitives([new Number(1), 'foo']) // false
isArrayOfPrimitives([]) // false

import { isArrayOfType } from 'object-array-utils';

isArrayOfType(['foo', 'bar'], 'string') // true
isArrayOfType(['foo', 1], 'string') // false
isArrayOfType([1, 2], 'number') // true
isArrayOfType([], 'string') // false

import { isArrayWhereEvery, isObjectLiteral } from 'object-array-utils';

isArrayWhereEvery([{ foo: 1 }, { bar: 2 }], isObjectLiteral) // true
isArrayWhereEvery([{ foo: 1 }, new Date()], isObjectLiteral) // false
isArrayWhereEvery([], isObjectLiteral) // false

import { isObjectLiteralWhereEvery, isArray } from 'object-array-utils';

isObjectLiteralWhereEvery({ foo: [1], bar: [2, 3] }, isArray) // true
isObjectLiteralWhereEvery({}, isArray) // false

import { differenceArraysOfPrimitives } from 'object-array-utils';

differenceArraysOfPrimitives([1, 2, 3, 9], [1, 3, 4]) // [2, 9]

import { duplicate } from 'duplicate';

duplicate(1, 3) // [1, 1, 1]
duplicate(1, 3, (value, i) => value + 1) // [1, 2, 3]
duplicate({ name: 'John' }, 2, (v, i) => ({ id: i + 1, ...v }))  // [{ id: 1, name: 'John' }, { id: 2, name: 'John' }]

import { range } from 'range';

range({ count: 2 }) // [0, 1]
range({ endInclusive: 2 }) // [0, 1, 2]
range({ endExclusive: 2 }) // [0, 1]
range({ start: 5, count: 2 }) // [5, 6]
range({ start: 5, endInclusive: 7 }) // [5, 6, 7]
range({ start: 5, endInclusive: 5 }) // [5]
range({ start: 5, endExclusive: 7 }) // [5, 6]
```

## Limitations

`isObjectSubset` and `isArraySubset` may result into false negatives when dealing with arrays of object literals. For example:

```javascript
isArraySubset([{ foo: 1 }, { bar: 2 }], [{}, { bar: 2 }]) // true
isArraySubset([{ foo: 1 }, { bar: 2 }], [{}, { foo: 1 }]) // false
```

## Installation

You can get `object-array-utils` via [npm](http://npmjs.com).

```bash
$ npm install object-array-utils --save
```
