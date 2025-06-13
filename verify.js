import { readBundle } from './utils/bundle.js';
import { loadPublicKey } from './utils/keys.js';
import { canonicalize } from './utils/canonical.js';
import { getSignatureData } from './utils/signature.js';
import { fromBase64 } from './utils/encoding.js';
import { jwtVerify } from 'jose';
import { diffLines } from 'diff';

export async function verify({ bundle: bundlePath, key: keyPath, xml }) {
  // Load the bundle
  const bundle = await readBundle(bundlePath, xml);

  // Extract the embedded JWS signature 
  const signatureData = getSignatureData(bundle);
  const jwsCompact = fromBase64(signatureData);

  // Load the public key
  const publicKey = await loadPublicKey(keyPath);

  // Canonicalize the bundle without the signature
  const canonical = canonicalize({ ...bundle, signature: undefined });
  const payload = JSON.parse(canonical);

  let isValid = false;

  // Verify
  try {
    const { payload: verifiedPayload } = await jwtVerify(jwsCompact, publicKey);
    isValid = JSON.stringify(verifiedPayload) === JSON.stringify(payload);
  } catch (err) {
    console.error('Signature verification error:', err.message);
  }

  console.log('Signature valid:', isValid);

  // show the differences if the signature is not valid
  if (!isValid) {
    console.log("Changed lines:");
    const diffs = diffLines(payload, canonical);

    for (const part of diffs) {
      if (part.added) {
        process.stdout.write(`+ ${part.value}`);
      } else if (part.removed) {
        process.stdout.write(`- ${part.value}`);
      }
    }
  }
}
