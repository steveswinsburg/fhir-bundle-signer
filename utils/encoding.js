export function toBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

export function fromBase64(base64Str) {
  return Buffer.from(base64Str, 'base64').toString('utf8');
}

export function base64UrlToBase64(input) {
  return input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
}

export function base64ToBase64Url(input) {
  return input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}