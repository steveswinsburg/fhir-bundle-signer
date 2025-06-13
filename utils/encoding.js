export function toBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

export function fromBase64(base64Str) {
  return Buffer.from(base64Str, 'base64').toString('utf8');
}
