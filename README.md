# `object-array-utils`

`object-array-utils` allows to check the type of an object or an array.

```javascript
import { isObjectLiteral } from 'object-array-utils';

isObjectLiteral({ prop: 1 }) // true
isObjectLiteral(new Date()) // false
isObjectLiteral([1]) // false

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

import { hasObjectProperty } from 'object-array-utils';

hasObjectProperty({ prop: 1 }, 'prop') // true

import { hasObjectProperties } from 'object-array-utils';

hasObjectProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop2']) // true

import { filterProperties } from 'object-array-utils';

filterProperties({ prop1: 1, prop2: 2 }, ['prop1', 'prop3']) // { prop1: 1 }

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

import { deepFreeze } from 'object-array-utils';

deepFreeze({ foo: 1 })
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
