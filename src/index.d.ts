declare module "object-array-utils" {
  type FilterFunction = (key: string, value: unknown) => boolean;

  function isNullOrUndefined(v: unknown): boolean;

  function isObject(o: unknown): boolean;

  function isObjectLiteral(o: unknown): boolean;

  function isEmptyObjectLiteral(o: unknown): boolean;

  function isObjectInstance(o: unknown): boolean;

  function isArray(a: unknown): boolean;

  function isEmptyArray(a: unknown): boolean;

  function isArrayOfObjects(a: unknown): boolean;

  function isArrayOfObjectLiterals(a: unknown): boolean;

  function isArrayOfPrimitives(a: unknown): boolean;

  function isArrayOfType(a: unknown, type: string): boolean;

  function isArrayWhereEvery(a: unknown, fun: (value: unknown) => boolean): boolean;

  function isObjectLiteralWhereEvery(o: unknown, fun: (value: unknown) => boolean): boolean;

  function areValuesEqual(a: unknown, b: unknown): boolean;

  function areObjectsEqual(a: Record<string, unknown>, b: Record<string, unknown>, options: Record<string, unknown> = {}): boolean;

  function areArraysEqual(a: unknown[], b: unknown[], options: Record<string, unknown> = {}): boolean;

  function hasProperty(o: Record<string, unknown>, prop: string): boolean;

  function hasProperties(o: Record<string, unknown>, props: string[]): boolean;

  function filterProperties(o: Record<string, unknown>, arg: string[] | FilterFunction): Record<string, unknown>;

  function rejectProperties(o: Record<string, unknown>, arg: string[] | FilterFunction): Record<string, unknown>;

  function takeProperties(o: Record<string, unknown>, arg: string[] | FilterFunction): { filtered: Record<string, unknown>, rejected: Record<string, unknown> };

  function removeArrayElements(array: unknown[], listOfValues: unknown[]): unknown[];

  function removeArrayElement(array: unknown[], valueOrFun: unknown): unknown[];

  function removeArrayElementByIndex(array: unknown[], index: number): unknown[];

  function isObjectSubset(superObject: Record<string, unknown>, subObject: Record<string, unknown>, options: Record<string, unknown> = {}): boolean;

  function isArraySubset(superArray: unknown[], subArray: unknown[], options: Record<string, unknown> = {}): boolean;

  function isPrimitive(value: unknown): boolean;

  function deepFreeze(o: Record<string, unknown>): Record<string, unknown>;

  function sortProperties(o: Record<string, unknown>): Record<string, unknown>;

  type RangeOptions = {
    start?: number;
    count?: number;
    endInclusive?: number;
    endExclusive?: number;
  };

  function range(o: RangeOptions): number[];
} 
