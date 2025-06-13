export function getSignatureData(bundle) {
  const sig = bundle?.signature?.data;

  if (!sig) {
    throw new Error('No signature data found in bundle.');
  }

  // Case 1: Normal JSON — base64 string
  if (typeof sig === 'string') {
    return sig;
  }

  // Case 2: XML-parsed — object like { $: { value: "..." } }
  if (typeof sig === 'object' && sig.$?.value) {
    return sig.$.value;
  }

  // Case 3: Unexpected structure
  throw new Error('Unrecognized format in Bundle.signature.data');
}