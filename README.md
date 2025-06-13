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

Signs a FHIR Bundle and embeds the JWS in `Bundle.signature`.

```bash
bundle-signer sign --bundle <file> [--key <private.pem>] [--out <file>] [--xml]
```

- `--bundle`: Path to the input FHIR Bundle (JSON or XML)
- `--key`: Path to the private key (optional; a new keypair will be generated if omitted)
- `--out`: Path to save signed bundle  
  - If omitted, the input file will be **overwritten**
- `--xml`: Treat input/output as XML (default is JSON)

### `verify`

Verifies the signature in a FHIR Bundle.

```bash
bundle-signer verify --bundle <file> --key <public.pem> [--xml]
```

- `--bundle`: Path to the signed FHIR Bundle
- `--key`: Path to the public key to verify with
- `--xml`: Treat input as XML

## Examples

### Sign and overwrite the input file
```bash
bundle-signer --bundle bundle.json --key private.pem
```

### Sign and write to a new file
```bash
bundle-signer --bundle bundle.json --key private.pem --out signed.json
```

### Sign with auto-generated key
```bash
bundle-signer --bundle bundle.json
```
Outputs:
```
No key provided — generating RSA key pair...
Saved private.pem and public.pem to current directory.
Wrote signed bundle to bundle.json
```

### Verify a signed bundle
```bash
bundle-signer --bundle bundle.json --key public.pem
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
