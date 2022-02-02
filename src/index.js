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

function areObjectsEqual(a, b, options = {}) {
  if (!isObject(a) || !isObject(b)) {
    throw new Error('expected objects');
  }

  const { hooks, ignoreProps } = options;

  const hookOnCompareObjects = hooks?.onCompareObjects ?? (() => ({}));
  const hookOnCompareObjectProps = hooks?.onCompareObjectProps ?? (() => ({}));

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

  if (ignoreProps) {
    ignoreProps.forEach(prop => {
      delete a[prop];
      delete b[prop];
    });
  }

  if (Object.keys(a).length !== Object.keys(b).length) return false;

  for (let [key, value] of Object.entries(a)) {
    if (value === b[key]) continue;

    const { eq, ne } = hookOnCompareObjectProps(a, b) ?? {};
    if (eq) return true;
    if (ne) return false;

    if (!hasObjectProp(b, key)) return false;

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

function hasObjectProp(o, prop) {
  if (!isObject(o)) {
    throw new Error('expected object');
  }

  return Object.prototype.hasOwnProperty.call(o, prop);
}

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

  const { ignoreProps } = options;

  if (ignoreProps) {
    subObject = { ...subObject };
    ignoreProps.forEach(prop => delete subObject[prop]);
  }

  if (Object.keys(superObject).length < Object.keys(subObject).length) return false;

  return Object.keys(subObject).every(key => {
    if (!hasObjectProp(superObject, key)) return false;

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
  hasObjectProp,
  isArray,
  isArrayOfObjects,
  isArrayOfObjectLiterals,
  isArraySubset,
  isNullOrUndefined,
  isObject,
  isObjectInstance,
  isObjectLiteral,
  isObjectSubset
}
