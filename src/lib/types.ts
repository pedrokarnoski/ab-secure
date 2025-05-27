export interface Certificate {
  subject: string;
  issuer: string;
  validFrom: string;
  validUntil: string;
  serialNumber: string;
  publicKey: CryptoKey | JsonWebKey;
  signature: string;
}

export interface MessageData {
  sender: 'alice' | 'bob';
  encryptedContent: string;
  encryptedSymmetricKey: string;
  signature: string;
  certificate: Certificate;
  timestamp: string;
  messageHash: string;
}

export interface UserKeys {
  encryptionPublicKey: CryptoKey;
  encryptionPrivateKey: CryptoKey;
  signaturePublicKey: CryptoKey;
  signaturePrivateKey: CryptoKey;
  encryptionPublicKeyJwk: JsonWebKey;
  encryptionPrivateKeyJwk: JsonWebKey;
  signaturePublicKeyJwk: JsonWebKey;
  signaturePrivateKeyJwk: JsonWebKey;
}