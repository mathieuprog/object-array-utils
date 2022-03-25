function isNullOrUndefined(v) {
  return v === null || v === undefined;
}

function isObject(o) {
  return isObjectLiteral(o) || isObjectInstance(o);
}

function isObjectLiteral(o) {
  return !isNullOrUndefined(o) && Object.getPrototypeOf(o) === Object.prototype;
}

function isObjectInstance(o) {
  return !isNullOrUndefined(o)
    && !isArray(o)
    && Object.getPrototypeOf(o) !== Object.prototype
    && typeof o === 'object';
}

function isArray(a) {
  return !isNullOrUndefined(a) && Array.isArray(a);
}

function isEmptyArray(a) {
  return isArray(a) && a.length === 0;
}

function isArrayOfObjects(a) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isObject(o));
}

function isArrayOfObjectLiterals(a) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isObjectLiteral(o));
}

function isArrayOfPrimitives(a) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !isPrimitive(o));
}

function isArrayOfType(a, type) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => typeof o !== type);
}

function isArrayWhereEvery(a, fun) {
  if (!isArray(a) || a.length === 0) {
    return false;
  }

  return !a.some(o => !fun(o));
}

function areObjectsEqual(a, b, options = {}) {
  if (!isObject(a) || !isObject(b)) {
    throw new Error('expected objects');
  }

  const { hooks, ignoreProperties } = options;

  const hookOnCompareObjects = hooks?.onCompareObjects ?? (() => ({}));
  const hookOnCompareObjectProperties = hooks?.onCompareObjectProperties ?? (() => ({}));

  if (a === b) return true;

  // ensure immutability
  a = { ...a };
  b = { ...b };

  const { eq, ne } = hookOnCompareObjects(a, b) ?? {};
  if (eq) return true;
  if (ne) return false;

  if (isObjectLiteral(a) !== isObjectLiteral(b)) return false;

  if (isObjectInstance(a)) {
    const str = a.toString();
    return str !== '[object Object]' && str === b.toString();
  }

  if (ignoreProperties) {
    ignoreProperties.forEach(prop => {
      delete a[prop];
      delete b[prop];
    });
  }

  if (Object.keys(a).length !== Object.keys(b).length) return false;

  for (let [key, value] of Object.entries(a)) {
    if (value === b[key]) continue;

    const { eq, ne } = hookOnCompareObjectProperties(key, a, b) ?? {};
    if (eq) return true;
    if (ne) return false;

    if (!hasObjectProperty(b, key)) return false;

    if (!value || !b[key]) return false;

    if (typeof value !== typeof b[key]) return false;

    if (isArray(value) !== isArray(b[key])) return false;

    if (isArray(value)) {
      if (!areArraysEqual(value, b[key], options)) return false;
      continue;
    }

    if (isObject(value) !== isObject(b[key])) return false;

    if (isObject(value)) {
      if (!areObjectsEqual(value, b[key], options)) return false;
      continue;
    }

    return false;
  }

  return true;
}

function areArraysEqual(a, b, options = {}) {
  if (!isArray(a) || !isArray(b)) {
    throw new Error('expected arrays');
  }

  const { hooks } = options;

  const hookOnCompareArrays = hooks?.onCompareArrays ?? (() => ({}));

  if (a === b) return true;

  // ensure immutability
  a = [...a];
  b = [...b];

  const { eq, ne } = hookOnCompareArrays(a, b) ?? {};
  if (eq) return true;
  if (ne) return false;

  if (a.length !== b.length) return false;

  for (let value of a) {
    if (isArray(value)) {
      const index = b.findIndex(e => isArray(e) && areArraysEqual(e, value, options));
      if (index === -1) return false;
      b.splice(index, 1);
      continue;
    }

    if (isObject(value)) {
      const index = b.findIndex(e => isObject(e) && areObjectsEqual(e, value, options));
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

function hasObjectProperty(o, prop) {
  if (!isObject(o)) {
    throw new Error('expected object');
  }

  return Object.prototype.hasOwnProperty.call(o, prop);
}

function hasObjectProperties(o, props) {
  return props.every(prop => hasObjectProperty(o, prop));
}

function filterProperties(o, arg) {
  return isArray(arg)
    ? filterPropsByWhitelist(o, arg)
    : filterPropsByFun(o, arg);
}

function filterPropsByWhitelist(o, props) {
  return props.reduce((newObject, prop) => {
    return (prop in o)
      ? { ...newObject, [prop]: o[prop] }
      : newObject;
  }, {});
}

function filterPropsByFun(o, fun) {
  const filteredEntries = Object.entries(o).filter(([key, val]) => fun(key, val));
  return Object.fromEntries(filteredEntries);
}

function takeProperties(o, arg) {
  return isArray(arg)
    ? takePropsByWhitelist(o, arg)
    : takePropsByFun(o, arg);
}

function takePropsByWhitelist(o, props) {
  return Object.keys(o).reduce(({ filtered, rejected }, prop) => {
    return (props.includes(prop))
      ? { filtered: { ...filtered, [prop]: o[prop] }, rejected }
      : { filtered, rejected: { ...rejected, [prop]: o[prop] } }
  }, { filtered: {}, rejected: {} });
}

function takePropsByFun(o, fun) {
  const filteredKeys =
    Object.entries(o)
      .filter(([key, val]) => fun(key, val))
      .map(([key, _]) => key);

  return takePropsByWhitelist(o, filteredKeys);
}

// https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/groupBy
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

function isObjectSubset(superObject, subObject, options = {}) {
  if (!isObject(superObject) || !isObject(subObject)) {
    throw new Error('expected objects');
  }

  if (superObject === subObject) return true;

  if (isObjectLiteral(superObject) !== isObjectLiteral(subObject)) return false;

  if (isObjectInstance(superObject)) {
    const str = superObject.toString();
    return str !== '[object Object]' && str === subObject.toString();
  }

  const { ignoreProperties } = options;

  if (ignoreProperties) {
    subObject = { ...subObject };
    ignoreProperties.forEach(prop => delete subObject[prop]);
  }

  if (Object.keys(superObject).length < Object.keys(subObject).length) return false;

  return Object.keys(subObject).every(key => {
    if (!hasObjectProperty(superObject, key)) return false;

    if (superObject[key] === subObject[key]) return true;

    if (!superObject[key] || !subObject[key]) return false;

    if (typeof superObject[key] !== typeof subObject[key]) return false;

    if (isObject(superObject[key]) !== isObject(subObject[key])) return false;

    if (isObject(superObject[key])) {
      return isObjectSubset(superObject[key], subObject[key], options);
    }

    if (isArray(superObject[key]) !== isArray(subObject[key])) return false;

    if (isArray(superObject[key])) {
      return isArraySubset(superObject[key], subObject[key], options);
    }

    return false;
  });
}

function isArraySubset(superArray, subArray, options = {}) {
  if (!isArray(superArray) || !isArray(subArray)) {
    throw new Error('expected arrays');
  }

  if (superArray === subArray) return true;

  if (superArray.length < subArray.length) return false;

  superArray = [...superArray];
  subArray = [...subArray];

  for (let value of subArray) {
    if (isArray(value)) {
      const index = superArray.findIndex(e => isArray(e) && isArraySubset(e, value, options));
      if (index === -1) return false;
      superArray.splice(index, 1);
      continue;
    }

    if (isObject(value)) {
      const index = superArray.findIndex(e => isObject(e) && isObjectSubset(e, value, options));
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

function isPrimitive(value) {
  return value !== Object(value);
}

function deepFreeze(o) {
  if (!isObject(o) && !isArray(o)) {
    throw new Error('expected object or array');
  }

  Object.keys(o).forEach(prop => {
    if ((!isObject(o[prop]) || !isArray(o[prop])) && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });

  return Object.freeze(o);
}

export {
  areArraysEqual,
  areObjectsEqual,
  deepFreeze,
  filterProperties,
  hasObjectProperty,
  hasObjectProperties,
  isArray,
  isArrayOfObjects,
  isArrayOfObjectLiterals,
  isArrayOfPrimitives,
  isArrayOfType,
  isArraySubset,
  isArrayWhereEvery,
  isEmptyArray,
  isNullOrUndefined,
  isObject,
  isObjectInstance,
  isObjectLiteral,
  isObjectSubset,
  isPrimitive,
  takeProperties
}
