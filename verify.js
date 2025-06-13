import { readBundle } from './utils/bundle.js';
import { loadPublicKey } from './utils/keys.js';
import { canonicalize } from './utils/canonical.js';
import { getSignatureData } from './utils/signature.js';
import { base64ToBase64Url } from './utils/encoding.js';
import { jwtVerify } from 'jose';
import { diffLines } from 'diff';

export async function verify({ bundle: bundlePath, key: keyPath, xml }) {
  // Load the bundle
  const bundle = await readBundle(bundlePath, xml);

  // Extract the embedded JWS signature 
  const signatureJWS = base64ToBase64Url(getSignatureData(bundle));

  // Load the public key
  const publicKey = await loadPublicKey(keyPath);

  // Canonicalize the bundle without the signature
  const canonicalRaw = canonicalize({ ...bundle, signature: undefined });
  const canonical = JSON.stringify(JSON.parse(canonicalRaw), null, 2);

  let payload;
  try {
    const result = await jwtVerify(signatureJWS, publicKey);
    payload = JSON.stringify(result.payload, null, 2);
  } catch (err) {
    console.error("Signature structure is valid, but verification FAILED.");
    console.error("Reason:", err.message);
    return;
  }

  const isValid = payload === canonical;
  console.log("Signature valid:", isValid);

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