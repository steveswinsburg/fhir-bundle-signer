import { readFile, writeFile } from 'fs/promises';
import xml2js from 'xml2js';

export async function readBundle(path, asXml = false) {
  const content = await readFile(path, 'utf8');
  if (asXml) {
    const parsed = await xml2js.parseStringPromise(content, { explicitArray: false });
    return parsed.Bundle;
  }
  return JSON.parse(content);
}

export async function writeBundle(path, bundle, asXml = false) {
   if (asXml) {
    const bundleForXml = JSON.parse(JSON.stringify(bundle));

    // convert signature.data to value="" (XML specific)
    if (bundleForXml.signature && typeof bundleForXml.signature.data === 'string') {
      bundleForXml.signature.data = { $: { value: bundleForXml.signature.data } };
    }

    const builder = new xml2js.Builder({ headless: true });
    const xml = builder.buildObject({ Bundle: bundleForXml });
    await writeFile(path, xml);
  } else {
    await writeFile(path, JSON.stringify(bundle, null, 2));
  }
}

export function updateSignature(bundle, { signature, sigFormat, targetFormat, whoRef }) {
  bundle.signature = {
    type: [{ system: "urn:iso-astm:E1762-95:2013", code: "1.2.840.10065.1.12.1.5", display: "Verification Signature" }],
    when: new Date().toISOString(),
    who: { reference: whoRef },
    targetFormat,
    sigFormat,
    data: signature
  };
}