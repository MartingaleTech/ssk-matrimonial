import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from 'crypto';
import { ValueTransformer } from 'typeorm';

const ALGORITHM = 'aes-256-gcm';
const PREFIX = 'enc:v1:';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

let warned = false;

function getKey(): Buffer | null {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw) {
    if (!warned && process.env.NODE_ENV !== 'test') {
      warned = true;
      console.warn(
        'DATA_ENCRYPTION_KEY is not set - sensitive columns are stored in plaintext',
      );
    }
    return null;
  }
  const key = /^[0-9a-f]{64}$/i.test(raw)
    ? Buffer.from(raw, 'hex')
    : Buffer.from(raw, 'base64');
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      'DATA_ENCRYPTION_KEY must be 32 bytes (64 hex characters or base64)',
    );
  }
  return key;
}

export function isEncryptionConfigured(): boolean {
  return getKey() !== null;
}

/**
 * A deterministic IV lets equality lookups work on encrypted columns
 * (same plaintext always yields the same ciphertext) at the cost of leaking
 * whether two rows share a value. Only use it for opaque identifiers.
 */
function buildIv(key: Buffer, plaintext: string, deterministic: boolean) {
  if (!deterministic) {
    return randomBytes(IV_LENGTH);
  }
  return createHmac('sha256', key)
    .update(plaintext)
    .digest()
    .subarray(0, IV_LENGTH);
}

export function encryptValue(plaintext: string, deterministic = false): string {
  const key = getKey();
  if (!key) {
    return plaintext;
  }
  const iv = buildIv(key, plaintext, deterministic);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
  return `${PREFIX}${payload.toString('base64')}`;
}

export function decryptValue(value: string): string {
  if (!value.startsWith(PREFIX)) {
    return value;
  }
  const key = getKey();
  if (!key) {
    throw new Error(
      'DATA_ENCRYPTION_KEY is required to read encrypted column values',
    );
  }
  const payload = Buffer.from(value.slice(PREFIX.length), 'base64');
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + 16);
  const ciphertext = payload.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

function buildStringTransformer(deterministic: boolean): ValueTransformer {
  return {
    to: (value: string | null | undefined) =>
      value === null || value === undefined
        ? value
        : encryptValue(value, deterministic),
    from: (value: string | null | undefined) =>
      value === null || value === undefined ? value : decryptValue(value),
  };
}

/** Encrypts a text column. Values cannot be queried by equality. */
export const encryptedString = buildStringTransformer(false);

/** Encrypts a text column while keeping `findOne({ where: { col } })` usable. */
export const searchableEncryptedString = buildStringTransformer(true);

/** Encrypts an object into a text column (replaces a jsonb column). */
export const encryptedJson: ValueTransformer = {
  to: (value: unknown) =>
    value === null || value === undefined
      ? value
      : encryptValue(JSON.stringify(value)),
  from: (value: string | null | undefined) => {
    if (value === null || value === undefined) {
      return value;
    }
    const plaintext = decryptValue(value);
    try {
      return JSON.parse(plaintext);
    } catch {
      return plaintext;
    }
  },
};
