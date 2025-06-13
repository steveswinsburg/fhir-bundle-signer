import { importPKCS8, importSPKI } from 'jose';
import { readFile, writeFile } from 'fs/promises';

export async function loadPrivateKey(path) {
  const pem = await readFile(path, 'utf8');
  return await importPKCS8(pem, 'RS256');
}

export async function loadPublicKey(path) {
  const pem = await readFile(path, 'utf8');
  return await importSPKI(pem, 'RS256');
}

export async function saveKeyPair(privateKey, publicKey, privPath, pubPath) {
  const privPEM = await privateKey.export({ type: 'pkcs8', format: 'pem' });
  const pubPEM = await publicKey.export({ type: 'spki', format: 'pem' });

  await writeFile(privPath, privPEM);
  await writeFile(pubPath, pubPEM);
}