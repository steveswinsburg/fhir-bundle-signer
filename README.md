# 🔐 FHIR Bundle Signer CLI

A command-line tool to **digitally sign** and **verify** FHIR `Bundle` resources.

## Features

- Supports both JSON and XML FHIR Bundles
- Signs canonicalized Bundle content using RS256 JWS
- Embeds signature in `Bundle.signature.data`
- Verifies embedded JWS using public keys
- Uses `jose` for cryptographic operations

## Installation

```bash
npm install
npm link
```

## Commands

### `sign`

Signs a FHIR Bundle.

```bash
bundle-signer sign --bundle <file> [--key <private.pem>] [--out <file>] [--xml]
```

- `--bundle`: Path to the input FHIR Bundle (JSON or XML)
- `--key`: Path to the private key (optional; a new keypair will be generated if omitted)
- `--out`: Path to save signed bundle  
  - If omitted, the input file will be **overwritten**
- `--xml`: Treat input/output as XML (default is JSON)

The tool embeds the signature in the `Bundle.signature` element as specified by the FHIR standard:

```json
"signature": {
  "type": [{
    "system": "urn:iso-astm:E1762-95:2013",
    "code": "1.2.840.10065.1.12.1.5",
    "display": "Verification Signature"
  }],
  "when": "2025-06-10T10:00:00Z",
  "who": { "reference": "Practitioner/123" },
  "targetFormat": "application/fhir+json",
  "sigFormat": "application/jose",
  "data": "<JWS Compact Signature>"
}
```

Once signed, the signature block may be modified, for example to update the `when` and `who` blocks. This will not invalidate the signature.

### `verify`

Verifies the signature in a FHIR Bundle.

```bash
bundle-signer verify --bundle <file> --key <public.pem> [--xml]
```

- `--bundle`: Path to the signed FHIR Bundle
- `--key`: Path to the public key to verify with
- `--xml`: Treat input as XML

## Examples

### Sign a JSON bundle (and overwrite it)
```bash
bundle-signer sign --bundle bundle.json --key private.pem
```

### Sign an XML bundle (and overwrite it)
```bash
bundle-signer sign --bundle bundle.xml --key private.pem  --xml
```

### Sign and write to a new file
```bash
bundle-signer sign --bundle bundle.json --key private.pem --out signed.json
```

### Sign with auto-generated key
```bash
bundle-signer sign --bundle bundle.json
```

Output:
```
No key provided — generating RSA key pair...
Saved private.pem and public.pem to current directory.
Wrote signed bundle to bundle.json
```

### Verify a signed JSON bundle
```bash
bundle-signer verify --bundle bundle.json --key public.pem
```

### Verify a signed XML bundle
```bash
bundle-signer verify --bundle bundle.xml --key public.pem --xml
```

Output:
```
Signature valid: true
```

Or if invalid:
```
Signature valid: false
Changed lines:
-   "id": "original"
+   "id": "tampered"
```
