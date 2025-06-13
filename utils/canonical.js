import stringify from 'json-stable-stringify';

export function canonicalize(obj) {
  return stringify(obj);
}