import { readBundle, writeBundle, updateSignature } from './utils/bundle.js';
import { loadPrivateKey, saveKeyPair } from './utils/keys.js';
import { canonicalize } from './utils/canonical.js';
import { CompactSign, generateKeyPair } from 'jose';
import { toBase64 } from './utils/encoding.js';

export async function sign({ bundle: bundlePath, key: keyPath, out: outPath, xml }) {
  // Step 1: Load and canonicalize the bundle
  const bundle = await readBundle(bundlePath, xml);
  const canonical = canonicalize({ ...bundle, signature: undefined });
  const payloadBuffer = Buffer.from(canonical, 'utf8');

  // Step 2: Load or generate private key
  let privateKey;
  if (keyPath) {
    privateKey = await loadPrivateKey(keyPath);
  } else {
    const { publicKey, privateKey: generatedKey } = await generateKeyPair('RS256');
    privateKey = generatedKey;
    console.log('No key provided — generating RSA key pair...');
    await saveKeyPair(privateKey, publicKey, 'private.pem', 'public.pem');
    console.log('Saved private.pem and public.pem to current directory.');
  }

  // Step 3: Sign using JWS (RS256)
  const jws = await new CompactSign(payloadBuffer)
    .setProtectedHeader({ alg: 'RS256' })
    .sign(privateKey);

  const [header, , signature] = jws.split('.');
  const detachedJws = `${header}.${''}.${signature}`; // note empty payload

  // FHIR requires base64 (not base64url) encoded JWS string
  const fhirSafeJWS = toBase64(detachedJws);

  // Step 4: Embed signature in the bundle
  updateSignature(bundle, {
    signature: fhirSafeJWS,
    targetFormat: xml ? 'application/fhir+xml' : 'application/fhir+json',
    sigFormat: 'application/jose',
    whoRef: 'Practitioner/123'
  });

  // Step 5: Write out the signed bundle
  const outputPath = outPath || bundlePath;
  await writeBundle(outputPath, bundle, xml);
  console.log('Wrote signed bundle to', outputPath);
}