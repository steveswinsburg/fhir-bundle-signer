import { readBundle } from './utils/bundle.js';
import { loadPublicKey } from './utils/keys.js';
import { canonicalize } from './utils/canonical.js';
import { getSignatureData } from './utils/signature.js';
import { fromBase64 } from './utils/encoding.js';
import { compactVerify } from 'jose';
import { diffLines } from 'diff';


export async function verify({ bundle: bundlePath, key: keyPath, xml }) {
  
  // Step 1: Load and canonicalize the bundle
  const bundle = await readBundle(bundlePath, xml);
  const canonical = canonicalize({ ...bundle, signature: undefined });
  const payloadBuffer = Buffer.from(canonical, 'utf8');

  // Step 2: Extract the embedded JWS signature 
  const rawSignature = getSignatureData(bundle);
  const detachedJws = fromBase64(rawSignature);

  // To verify a detached JWS we need to reinject the payload.
  // Step 3: Split the JWS into header..signature
  const parts = detachedJws.split('.');
  if (parts.length !== 3 || parts[1] !== '') {
    console.error('Invalid detached JWS format');
    console.log('JWS parts:', parts);
    return;
  }

  // Step 4: Reattach the canonical payload to create a valid JWS
  const payloadBase64url = payloadBuffer.toString('base64url'); // must use base64url encoding
  const reattachedJws = `${parts[0]}.${payloadBase64url}.${parts[2]}`;

  // Step 5: Load public key for verification
  const publicKey = await loadPublicKey(keyPath);

  let isValid = false;

  // Step 6: Verify
  try {
     const { payload: verifiedPayload } = await compactVerify(reattachedJws, publicKey);
      isValid = Buffer.compare(verifiedPayload, payloadBuffer) === 0;
  } catch (err) {
    console.error('Signature verification error:', err.message);
  }

  console.log('Signature valid:', isValid);

  // Step 7: Show the differences if the signature is not valid
  if (!isValid) {
    console.log("Changed lines:");

    // Decode the payload from the JWS for comparison
    let verifiedPayload;
    try {
      const { payload } = await compactVerify(detachedJws, publicKey, { detached: payloadBuffer });
      verifiedPayload = payload.toString('utf8');
    } catch {
      verifiedPayload = ''; // fallback if parsing fails again
    }

    const diffs = diffLines(verifiedPayload, canonical);

    for (const part of diffs) {
      if (part.added) {
        process.stdout.write(`+ ${part.value}`);
      } else if (part.removed) {
        process.stdout.write(`- ${part.value}`);
      }
    }
  }
}
